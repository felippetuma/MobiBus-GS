import { IOTA_PORT } from "@/lib/fiware/config";
import { parseDevices } from "@/lib/fiware/provision";
import { readContext, relay, upstream } from "@/lib/fiware/server";

export async function GET(request: Request) {
    const c = readContext(request);
    if (c instanceof Response) return c;

    const res = await upstream(`http://${c.host}:${IOTA_PORT}/iot/devices?limit=1000`, { headers: c.headers }, "IoT Agent");
    if (!res.ok) return relay(res, "IoT Agent não encontrou o recurso (verifique serviço e path).");
    return Response.json(parseDevices(await res.json().catch(() => null), c.type));
}
