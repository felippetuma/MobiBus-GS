export type Bus = { route: string; name: string };

const KEY = "mobibus:buses";
const EVENT = "mobibus:buses-change";

const ROUTE_RE = /^[A-Za-z0-9_-]{1,20}$/;
const RESERVED_ROUTES = ["novo"];
const NAME_MAX = 60;

export const validateBus = (list: Bus[], input: Bus, editing?: string): string | null => {
    const route = input.route.trim();
    if (!route) return "Informe o número do ônibus.";
    if (!ROUTE_RE.test(route)) return "Use só letras, números, hífen ou _ (até 20 caracteres), sem espaços.";
    if (RESERVED_ROUTES.includes(route.toLowerCase())) return `"${route}" é um nome reservado. Escolha outro número.`;
    if (list.some((b) => b.route === route && b.route !== editing)) return `Já existe um ônibus com o número ${route}.`;
    if (input.name.trim().length > NAME_MAX) return `O nome pode ter no máximo ${NAME_MAX} caracteres.`;
    return null;
};

export const addBus = (list: Bus[], input: Bus): Bus[] =>
    [...list, { route: input.route.trim(), name: input.name.trim() }];

export const updateBus = (list: Bus[], editing: string, input: Bus): Bus[] =>
    addBus(removeBus(list, editing), input);

export const removeBus = (list: Bus[], route: string): Bus[] => list.filter((b) => b.route !== route);

export const parseBuses = (raw: string): Bus[] => {
    try {
        const saved: unknown = JSON.parse(raw);
        if (!Array.isArray(saved)) return [];
        const seen = new Set<string>();
        const result: Bus[] = [];
        for (const item of saved) {
            const route = typeof item?.route === "string" ? item.route : "";
            if (!ROUTE_RE.test(route) || seen.has(route)) continue;
            seen.add(route);
            result.push({ route, name: typeof item.name === "string" ? item.name : "" });
        }
        return result;
    } catch {
        return [];
    }
};

export const readRawBuses = () => {
    try {
        return localStorage.getItem(KEY) ?? "";
    } catch {
        return "";
    }
};

export const subscribeBuses = (callback: () => void) => {
    window.addEventListener("storage", callback);
    window.addEventListener(EVENT, callback);
    return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener(EVENT, callback);
    };
};

export const saveBuses = (list: Bus[]) => {
    try {
        localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
        return false;
    }
    window.dispatchEvent(new Event(EVENT));
    return true;
};
