import { ATTRS, COMMANDS, ENTITY_ID_PREFIX, NAME_ATTR, STALE_AFTER_MS, TEMP_INTERNA_MAX, TEMP_MOTOR_MAX, TIRES, type Command } from "./config";
import type { Bus } from "./buses";

export type BusReading = {
    temperaturaInterna: number | null;
    umidadeInterna: number | null;
    temperaturaMotor: number | null;
    alerta: boolean; // true = motorista apertou o botão físico (pediu suporte)
    buzzer: boolean;
    timeInstant: string | null;
    pneus: (number | null)[]; // pressão em PSI, na ordem de TIRES (p1..p6)
    nome: string; 
    commandStatus: Partial<Record<Command, string>>;
    commandInfo: Partial<Record<Command, string>>;  
};

export type BusStatus = "unconfigured" | "loading" | "online" | "stale" | "offline" | "missing";

const toNumber = (v: unknown) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
};

export const toReading = (d: Record<string, unknown>): BusReading => {
    const commandStatus: BusReading["commandStatus"] = {};
    const commandInfo: BusReading["commandInfo"] = {};
    for (const c of COMMANDS) {
        const s = d[`${c}_status`];
        if (typeof s === "string") commandStatus[c] = s;
        const i = d[`${c}_info`];
        if (typeof i === "string" && i) commandInfo[c] = i;
    }
    return {
        temperaturaInterna: toNumber(d[ATTRS.temperaturaInterna]),
        umidadeInterna: toNumber(d[ATTRS.umidadeInterna]),
        temperaturaMotor: toNumber(d[ATTRS.temperaturaMotor]),
        alerta: String(d[ATTRS.alerta]).toLowerCase() === "true",
        buzzer: String(d[ATTRS.buzzer]).toLowerCase() === "on",
        timeInstant: typeof d.TimeInstant === "string" ? d.TimeInstant : null,
        pneus: TIRES.map((t) => toNumber(d[t.name])),
        nome: typeof d[NAME_ATTR] === "string" ? (d[NAME_ATTR] as string).trim() : "",
        commandStatus,
        commandInfo,
    };
};

export const isStale = (r: BusReading, now: number) => {
    const t = r.timeInstant ? Date.parse(r.timeInstant) : NaN;
    return !Number.isNaN(t) && now - t > STALE_AFTER_MS;
};

export type BusAlerts = { driver: boolean; tempInterna: boolean; tempMotor: boolean };

export const alertsOf = (r: BusReading | null): BusAlerts => ({
    driver: r?.alerta ?? false,
    tempInterna: r?.temperaturaInterna != null && r.temperaturaInterna > TEMP_INTERNA_MAX,
    tempMotor: r?.temperaturaMotor != null && r.temperaturaMotor > TEMP_MOTOR_MAX,
});

export const hasAlert = (r: BusReading | null) => Object.values(alertsOf(r)).some(Boolean);

export type EntityState = { reading: BusReading; stale: boolean };

export const parseEntities = (entities: unknown, now: number) => {
    const byRoute: Record<string, EntityState> = {};
    const ignored: string[] = [];
    let total = 0;
    if (Array.isArray(entities)) {
        for (const e of entities) {
            total++;
            const id = typeof e?.id === "string" ? e.id : "";
            if (!id.startsWith(ENTITY_ID_PREFIX)) {
                ignored.push(id || "(sem id)");
                continue;
            }
            const reading = toReading(e);
            byRoute[id.slice(ENTITY_ID_PREFIX.length)] = { reading, stale: isStale(reading, now) };
        }
    }
    return { byRoute, ignored, total };
};

export type ListPhase = "loading" | "ok" | "error";


export type DeviceInfo = { route: string; deviceId: string; name: string };
// Dispositivo que o IoT Agent devolveu mas que o dashboard não mostra, com o motivo
export type IgnoredDevice = { deviceId: string; entityName: string; entityType: string; reason: string };
export type DevicesResponse = { total: number; devices: DeviceInfo[]; ignored: IgnoredDevice[] };

export type BusEntry = {
    bus: Bus;
    deviceId: string | null;
    displayName: string;
    status: BusStatus;
    reading: BusReading | null;
};


export const mergeBuses = (
    local: Bus[],
    devices: Record<string, DeviceInfo>,
    entities: Record<string, EntityState>,
): (Bus & { deviceId: string | null })[] => {
    const routes = new Set([...local.map((b) => b.route), ...Object.keys(devices), ...Object.keys(entities)]);
    return [...routes].map((route) => ({
        route,
        name: devices[route]?.name || entities[route]?.reading.nome || local.find((b) => b.route === route)?.name || "",
        deviceId: devices[route]?.deviceId ?? null,
    }));
};

export const buildEntries = (
    buses: (Bus & { deviceId: string | null })[],
    hasHost: boolean,
    phase: ListPhase,
    entities: Record<string, EntityState>,
): BusEntry[] =>
    buses.map(({ deviceId, ...bus }) => {
        const entity = entities[bus.route];
        let status: BusStatus;
        if (!hasHost) status = "unconfigured";
        else if (phase === "loading") status = "loading";
        else if (phase === "error") status = "offline";
        else if (!entity) status = "missing";
        else status = entity.stale ? "stale" : "online";
        return {
            bus,
            deviceId,
            displayName: bus.name || deviceId || "",
            status,
            reading: phase === "ok" && entity ? entity.reading : null,
        };
    });

// Ônibus em alerta primeiro; depois por número da rota (001 < 002 < 010)
export const sortEntries = (entries: BusEntry[]): BusEntry[] =>
    [...entries].sort((a, b) => {
        const byAlert = Number(hasAlert(b.reading)) - Number(hasAlert(a.reading));
        return byAlert || a.bus.route.localeCompare(b.bus.route, undefined, { numeric: true });
    });

export const summarize = (entries: BusEntry[]) => ({
    total: entries.length,
    online: entries.filter((e) => e.status === "online").length,
    withAlert: entries.filter((e) => hasAlert(e.reading)).length,
});


export type CommandResult = { status: string | null; info: string | null };

export const commandResult = (reading: BusReading | null, command: Command): CommandResult => ({
    status: reading?.commandStatus[command] ?? null,
    info: reading?.commandInfo[command] ?? null,
});

export const describeCommand = (command: Command, r: CommandResult): { kind: "ok" | "warn" | "error"; text: string } => {
    const status = r.status?.toUpperCase() ?? null;
    if (status === null) {
        return {
            kind: "warn",
            text: `O Orion aceitou o comando ${command}, mas ele não tem status (${command}_status). Isso indica que o comando não está registrado no dispositivo do IoT Agent, então não chegou ao firmware. Reprovisione o dispositivo incluindo este comando.`,
        };
    }
    if (status === "OK") return { kind: "ok", text: `O firmware confirmou o comando ${command} (OK).` };
    if (status === "ERROR") return { kind: "error", text: `O firmware respondeu com erro ao comando ${command}${r.info ? `: ${r.info}` : "."}` };
    return { kind: "warn", text: `Comando ${command} encaminhado pelo IoT Agent (${r.status}), mas o firmware não respondeu em /cmdexe no tempo esperado. Ele não está recebendo o comando (tópico /cmd) ou a resposta não está chegando no formato <dispositivo>@${command}|ok.` };
};
