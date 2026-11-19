import { ORION_PORT } from "@/lib/fiware/config";
import { readContext, relay, upstream } from "@/lib/fiware/server";

export async function GET(request: Request, ctx: RouteContext<"/api/fiware/bus/[route]">) {
    const { route } = await ctx.params;
    const c = readContext(request, route);
    if (c instanceof Response) return c;

    const url = `http://${c.host}:${ORION_PORT}/v2/entities/${encodeURIComponent(c.entityId)}?type=${encodeURIComponent(c.type)}&options=keyValues`;
    const res = await upstream(url, { headers: c.headers }, "Orion");
    return relay(res, `Entidade ${c.entityId} (tipo ${c.type}) não encontrada no Orion.`);
}
