"use client"
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { COMMAND_CHECK_MS, COMMAND_TIMEOUT_MS, POLL_INTERVAL_MS, type Command } from "./config";
import type { SyncApi } from "./sync";
import { parseBuses, readRawBuses, subscribeBuses } from "./buses";
import {
    buildEntries, commandResult, isStale, mergeBuses, parseEntities, sortEntries, summarize, toReading,
    type BusReading, type BusStatus, type CommandResult, type DeviceInfo, type DevicesResponse, type EntityState, type IgnoredDevice, type ListPhase,
} from "./reading";
import {
    fiwareHeaders, parseSettings, readRawSettings, subscribeSettings,
} from "./settings";


export const useFiwareSettings = () => {
    const raw = useSyncExternalStore(subscribeSettings, readRawSettings, () => "");
    const settings = useMemo(() => parseSettings(raw), [raw]);
    return { settings, raw };
};


export const useBusList = () => {
    const raw = useSyncExternalStore(subscribeBuses, readRawBuses, () => "");
    const list = useMemo(() => parseBuses(raw), [raw]);
    return { list, raw };
};

const busUrl = (route: string, suffix = "") => `/api/fiware/bus/${encodeURIComponent(route)}${suffix}`;

const errorMessage = async (res: Response) => {
    const body = await res.json().catch(() => null);
    return body?.error ?? `Erro ${res.status}`;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForCommand = async (read: () => Promise<BusReading | null>, command: Command): Promise<CommandResult> => {
    const deadline = Date.now() + COMMAND_TIMEOUT_MS;
    for (; ;) {
        await sleep(COMMAND_CHECK_MS);
        const result = commandResult(await read(), command);
        if (result.status?.toUpperCase() !== "PENDING" || Date.now() >= deadline) return result;
    }
};


const usePolling = (load: (signal: AbortSignal) => Promise<unknown>, enabled: boolean) => {
    useEffect(() => {
        if (!enabled) return;
        const ctrl = new AbortController();
        const first = setTimeout(() => load(ctrl.signal), 0);
        const id = setInterval(() => load(ctrl.signal), POLL_INTERVAL_MS);
        return () => {
            ctrl.abort();
            clearTimeout(first);
            clearInterval(id);
        };
    }, [load, enabled]);
};

export const useSendCommand = () => {
    const { settings } = useFiwareSettings();
    return useCallback(async (route: string, command: Command) => {
        const res = await fetch(busUrl(route, "/command"), {
            method: "POST",
            headers: { ...fiwareHeaders(settings), "content-type": "application/json" },
            body: JSON.stringify({ command }),
        });
        if (!res.ok) throw new Error(await errorMessage(res));
    }, [settings]);
};

export const useProvision = () => {
    const { settings } = useFiwareSettings();
    const headers = useMemo(() => fiwareHeaders(settings), [settings]);

    const api = useMemo<SyncApi>(() => ({
        provision: async (route, name) => {
            const res = await fetch(busUrl(route, "/device"), {
                method: "POST",
                headers: { ...headers, "content-type": "application/json" },
                body: JSON.stringify({ name }),
            });
            if (!res.ok) throw new Error(await errorMessage(res));
            return res.json();
        },
        rename: async (route, name) => {
            const res = await fetch(busUrl(route, "/device"), {
                method: "PATCH",
                headers: { ...headers, "content-type": "application/json" },
                body: JSON.stringify({ name }),
            });
            if (!res.ok) throw new Error(await errorMessage(res));
        },
        deprovision: async (route) => {
            const res = await fetch(busUrl(route, "/device"), { method: "DELETE", headers });
            if (!res.ok) throw new Error(await errorMessage(res));
            return res.json();
        },
    }), [headers]);

    return { hasHost: settings.host !== "", api };
};

type BusState = { phase: "loading" | "ok" | "error" | "missing"; reading: BusReading | null; stale: boolean; error: string | null };

export const useBus = (route: string) => {
    const { settings } = useFiwareSettings();
    const send = useSendCommand();
    const [state, setState] = useState<BusState>({ phase: "loading", reading: null, stale: false, error: null });

    const load = useCallback(async (signal?: AbortSignal): Promise<BusReading | null> => {
        try {
            const res = await fetch(busUrl(route), { headers: fiwareHeaders(settings), cache: "no-store", signal });
            if (res.status === 404) {
                setState({ phase: "missing", reading: null, stale: false, error: await errorMessage(res) });
                return null;
            }
            if (!res.ok) throw new Error(await errorMessage(res));
            const reading = toReading(await res.json());
            setState({ phase: "ok", reading, stale: isStale(reading, Date.now()), error: null });
            return reading;
        } catch (e) {
            if (signal?.aborted) return null;
            const error = e instanceof Error ? e.message : "Falha ao consultar o FIWARE.";
            setState((prev) => ({ ...prev, phase: "error", error }));
            return null;
        }
    }, [route, settings]);

    usePolling(load, settings.host !== "");

    const sendCommand = useCallback(async (command: Command): Promise<CommandResult> => {
        await send(route, command);
        return waitForCommand(() => load(), command);
    }, [send, route, load]);

    let status: BusStatus;
    if (!settings.host) status = "unconfigured";
    else if (state.phase === "loading") status = "loading";
    else if (state.phase === "error") status = "offline";
    else if (state.phase === "missing") status = "missing";
    else status = state.stale ? "stale" : "online";

    return { status, reading: state.reading, error: state.error, sendCommand };
};

export type Diagnostics = {
    devicesTotal: number | null;      
    devicesError: string | null;     
    ignoredDevices: IgnoredDevice[];
    entitiesTotal: number | null;    
    ignoredEntities: string[];
};

type ListState = {
    phase: ListPhase;
    entities: Record<string, EntityState>;
    devices: Record<string, DeviceInfo>;
    error: string | null;
    diagnostics: Diagnostics;
};

const emptyDiagnostics: Diagnostics = { devicesTotal: null, devicesError: null, ignoredDevices: [], entitiesTotal: null, ignoredEntities: [] };

export const useBuses = () => {
    const { settings } = useFiwareSettings();
    const { list } = useBusList();
    const send = useSendCommand();
    const [state, setState] = useState<ListState>({ phase: "loading", entities: {}, devices: {}, error: null, diagnostics: emptyDiagnostics });

    const load = useCallback(async (signal?: AbortSignal): Promise<Record<string, EntityState> | null> => {
        const init = { headers: fiwareHeaders(settings), cache: "no-store" as const, signal };
        const [orion, iota] = await Promise.allSettled([fetch("/api/fiware/buses", init), fetch("/api/fiware/devices", init)]);
        if (signal?.aborted) return null;

        let devices: Record<string, DeviceInfo> | null = null;
        let devicesTotal: number | null = null;
        let ignoredDevices: IgnoredDevice[] = [];
        let devicesError: string | null = null;
        if (iota.status === "fulfilled" && iota.value.ok) {
            const body: DevicesResponse = await iota.value.json().catch(() => ({ total: 0, devices: [], ignored: [] }));
            devices = Object.fromEntries(body.devices.map((d) => [d.route, d]));
            devicesTotal = body.total;
            ignoredDevices = body.ignored;
        } else {
            devicesError = iota.status === "fulfilled" ? await errorMessage(iota.value) : "Não foi possível consultar o IoT Agent.";
        }

        try {
            if (orion.status === "rejected") throw orion.reason;
            if (!orion.value.ok) throw new Error(await errorMessage(orion.value));
            const parsed = parseEntities(await orion.value.json(), Date.now());
            setState((prev) => ({
                phase: "ok",
                entities: parsed.byRoute,
                devices: devices ?? prev.devices,
                error: null,
                diagnostics: { devicesTotal, devicesError, ignoredDevices, entitiesTotal: parsed.total, ignoredEntities: parsed.ignored },
            }));
            return parsed.byRoute;
        } catch (e) {
            const error = e instanceof Error ? e.message : "Falha ao consultar o FIWARE.";
            setState((prev) => ({
                phase: "error",
                entities: prev.entities,
                devices: devices ?? prev.devices,
                error,
                diagnostics: { ...prev.diagnostics, devicesTotal, devicesError, ignoredDevices },
            }));
            return null;
        }
    }, [settings]);

    const hasHost = settings.host !== "";
    usePolling(load, hasHost);

    const entries = useMemo(
        () => sortEntries(buildEntries(mergeBuses(list, state.devices, state.entities), hasHost, state.phase, state.entities)),
        [list, hasHost, state.phase, state.devices, state.entities],
    );
    const summary = useMemo(() => summarize(entries), [entries]);

    const sendCommand = useCallback(async (route: string, command: Command): Promise<CommandResult> => {
        await send(route, command);
        return waitForCommand(async () => (await load())?.[route]?.reading ?? null, command);
    }, [send, load]);

    let connection: BusStatus;
    if (!hasHost) connection = "unconfigured";
    else if (state.phase === "loading") connection = "loading";
    else if (state.phase === "error") connection = "offline";
    else connection = "online";

    const loaded = !hasHost || state.phase !== "loading";

    return { entries, summary, connection, loaded, error: state.error, diagnostics: state.diagnostics, sendCommand };
};
