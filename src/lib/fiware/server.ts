import { buildEntityId } from "./config";

// Validações simples: o host/serviço vêm do navegador, então não são confiáveis.
const HOST_RE = /^[A-Za-z0-9]([A-Za-z0-9.-]{0,251}[A-Za-z0-9])?$/;
const SERVICE_RE = /^[A-Za-z0-9_]{0,50}$/;
const PATH_RE = /^(\/[A-Za-z0-9_]{0,50}){1,10}$/;
const TYPE_RE = /^[A-Za-z0-9_.:-]{1,64}$/;
const ROUTE_RE = /^[A-Za-z0-9_-]{1,20}$/;

export type FiwareContext = {
    host: string;
    type: string;
    entityId: string;
    headers: Record<string, string>;
};

export const jsonError = (error: string, status: number) => Response.json({ error }, { status });

export const readContext = (request: Request, route?: string): FiwareContext | Response => {
    const h = request.headers;
    const host = (h.get("x-fiware-host") ?? "").trim();
    const service = (h.get("x-fiware-service") ?? "").trim();
    const servicePath = (h.get("x-fiware-servicepath") ?? "/").trim();
    const type = (h.get("x-fiware-type") ?? "").trim();

    if (!host) return jsonError("Servidor FIWARE não configurado.", 400);
    // 169.254.x.x é o endereço de metadados da nuvem: nunca deve ser consultado
    if (!HOST_RE.test(host) || host.startsWith("169.254.")) return jsonError("IP/host do servidor inválido.", 400);
    if (!SERVICE_RE.test(service)) return jsonError("Serviço (fiware-service) inválido.", 400);
    if (!PATH_RE.test(servicePath)) return jsonError("Path do serviço (fiware-servicepath) inválido.", 400);
    if (!TYPE_RE.test(type)) return jsonError("Tipo da entidade inválido.", 400);
    if (route !== undefined && !ROUTE_RE.test(route)) return jsonError("Número da rota inválido.", 400);

    return {
        host,
        type,
        entityId: route === undefined ? "" : buildEntityId(route),
        headers: { "fiware-service": service, "fiware-servicepath": servicePath },
    };
};

export const upstream = async (url: string, init: RequestInit, label: string) => {
    try {
        return await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(5000) });
    } catch {
        return jsonError(`Não foi possível conectar ao ${label}. Verifique o IP e se o serviço está no ar.`, 502);
    }
};

export const relay = async (res: Response, notFound: string) => {
    if (res.status === 204) return new Response(null, { status: 204 });
    const body = await res.json().catch(() => null);
    if (res.status === 404) return jsonError(notFound, 404);
    if (!res.ok) return jsonError(body?.description ?? body?.message ?? body?.error ?? `FIWARE respondeu ${res.status}.`, res.status);
    return Response.json(body);
};

export const readNotifyUrl = (request: Request): string | null => {
    const value = (request.headers.get("x-fiware-notify-url") ?? "").trim();
    try {
        const u = new URL(value);
        if ((u.protocol !== "http:" && u.protocol !== "https:") || u.username || u.password) return null;
        return u.toString();
    } catch {
        return null;
    }
};
