import { ORION_LIST_LIMIT, ORION_PORT } from "@/lib/fiware/config";
import { readContext, relay, upstream } from "@/lib/fiware/server";

export async function GET(request: Request) {
    const c = readContext(request);
    if (c instanceof Response) return c;

    const url = `http://${c.host}:${ORION_PORT}/v2/entities?type=${encodeURIComponent(c.type)}&options=keyValues&limit=${ORION_LIST_LIMIT}`;
    const res = await upstream(url, { headers: c.headers }, "Orion");
    return relay(res, "Nenhuma entidade encontrada no Orion.");
}
