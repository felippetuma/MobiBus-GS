import { COMMANDS, ORION_PORT } from "@/lib/fiware/config";
import { jsonError, readContext, relay, upstream } from "@/lib/fiware/server";

export async function POST(request: Request, ctx: RouteContext<"/api/fiware/bus/[route]/command">) {
    const { route } = await ctx.params;
    const c = readContext(request, route);
    if (c instanceof Response) return c;

    const body = await request.json().catch(() => null);
    const command = body?.command;
    if (typeof command !== "string" || !(COMMANDS as readonly string[]).includes(command)) {
        return jsonError("Comando desconhecido.", 400);
    }

    const url = `http://${c.host}:${ORION_PORT}/v2/entities/${encodeURIComponent(c.entityId)}/attrs?type=${encodeURIComponent(c.type)}`;
    const res = await upstream(url, {
        method: "PATCH",
        headers: { ...c.headers, "content-type": "application/json" },
        body: JSON.stringify({ [command]: { type: "command", value: "" } }),
    }, "Orion");

    const out = await relay(res, `Entidade ${c.entityId} (tipo ${c.type}) não encontrada no Orion.`);
    return out.status === 204 ? Response.json({ ok: true }) : out;
}
