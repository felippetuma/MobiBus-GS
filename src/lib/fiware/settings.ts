import {
    DEFAULT_ENTITY_TYPE, DEFAULT_SERVICE,
    DEFAULT_SERVICEPATH, DEFAULT_STH_NOTIFY_URL,
} from "./config";

export type FiwareSettings = {
    host: string;
    service: string;
    servicePath: string;
    entityType: string;
    urlSthComet: string;
};

export const DEFAULT_SETTINGS: FiwareSettings = {
    host: "",
    service: DEFAULT_SERVICE,
    servicePath: DEFAULT_SERVICEPATH,
    entityType: DEFAULT_ENTITY_TYPE,
    urlSthComet: DEFAULT_STH_NOTIFY_URL,
};

const KEY = "mobibus:fiware";
const EVENT = "mobibus:fiware-change";

export const normalizeHost = (value: string) =>
    value.trim().replace(/^https?:\/\//i, "").replace(/[/?#].*$/, "").replace(/:\d+$/, "");

export const parseSettings = (raw: string): FiwareSettings => {
    try {
        const saved = JSON.parse(raw) as Record<string, unknown>;
        const result = { ...DEFAULT_SETTINGS };
        for (const k of Object.keys(DEFAULT_SETTINGS) as (keyof FiwareSettings)[]) {
            if (typeof saved[k] === "string") result[k] = saved[k];
        }
        return result;
    } catch {
        return DEFAULT_SETTINGS;
    }
};

export const readRawSettings = () => {
    try {
        return localStorage.getItem(KEY) ?? "";
    } catch {
        return "";
    }
};

export const subscribeSettings = (callback: () => void) => {
    window.addEventListener("storage", callback);
    window.addEventListener(EVENT, callback);
    return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener(EVENT, callback);
    };
};

export const saveSettings = (settings: FiwareSettings) => {
    try {
        localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
        return false;
    }
    window.dispatchEvent(new Event(EVENT));
    return true;
};

export const fiwareHeaders = (s: FiwareSettings): Record<string, string> => ({
    "x-fiware-host": s.host,
    "x-fiware-service": s.service,
    "x-fiware-servicepath": s.servicePath,
    "x-fiware-type": s.entityType,
    "x-fiware-notify-url": s.urlSthComet,
});
