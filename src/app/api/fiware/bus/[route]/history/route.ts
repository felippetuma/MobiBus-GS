import { ATTRS, STH_PORT } from "@/lib/fiware/config";
import { jsonError, readContext, relay, upstream } from "@/lib/fiware/server";

export async function GET(request: Request, ctx: RouteContext<"/api/fiware/bus/[route]/history">) {
    const { route } = await ctx.params;
    const c = readContext(request, route);
    if (c instanceof Response) return c;

    const params = new URL(request.url).searchParams;
    const attr = params.get("attr") ?? "";
    if (!(Object.values(ATTRS) as string[]).includes(attr)) return jsonError("Atributo inválido.", 400);
    const lastN = Math.min(Math.max(Number(params.get("lastN")) || 20, 1), 100);

    const url = `http://${c.host}:${STH_PORT}/STH/v1/contextEntities/type/${encodeURIComponent(c.type)}/id/${encodeURIComponent(c.entityId)}/attributes/${encodeURIComponent(attr)}?lastN=${lastN}`;
    const res = await upstream(url, { headers: c.headers }, "STH-Comet");
    return relay(res, "Sem histórico para esse atributo no STH-Comet.");
}
