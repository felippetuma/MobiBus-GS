import { IOTA_PORT, NAME_ATTR, ORION_PORT, buildDeviceId } from "@/lib/fiware/config";
import { buildDevice, buildStaticAttributes, buildSubscription, findSubscriptions } from "@/lib/fiware/provision";
import { readContext, readNotifyUrl, relay, upstream, type FiwareContext } from "@/lib/fiware/server";

const json = { "content-type": "application/json" };
const subscriptionsUrl = (c: FiwareContext) => `http://${c.host}:${ORION_PORT}/v2/subscriptions`;

const detail = async (res: Response) => {
    const body = await res.json().catch(() => null);
    return body?.description ?? body?.message ?? body?.error ?? `Resposta ${res.status}.`;
};

const subscribeToSth = async (c: FiwareContext, route: string, notifyUrl: string | null) => {
    if (!notifyUrl) return "URL do STH-Comet não configurada (ou inválida).";

    const existing = await upstream(`${subscriptionsUrl(c)}?limit=1000`, { headers: c.headers }, "Orion");
    if (existing.ok && findSubscriptions(await existing.json().catch(() => null), c.entityId, notifyUrl).length > 0) return null;

    const res = await upstream(subscriptionsUrl(c), {
        method: "POST",
        headers: { ...c.headers, ...json },
        body: JSON.stringify(buildSubscription(c.type, route, notifyUrl)),
    }, "Orion");
    return res.ok ? null : detail(res);
};

const unsubscribeFromSth = async (c: FiwareContext, notifyUrl: string | null) => {
    const list = await upstream(`${subscriptionsUrl(c)}?limit=1000`, { headers: c.headers }, "Orion");
    if (!list.ok) return await detail(list);

    const failures: string[] = [];
    for (const sub of findSubscriptions(await list.json().catch(() => null), c.entityId, notifyUrl)) {
        if (!sub.id) continue;
        const res = await upstream(`${subscriptionsUrl(c)}/${encodeURIComponent(sub.id)}`, { method: "DELETE", headers: c.headers }, "Orion");
        if (!res.ok && res.status !== 404) failures.push(await detail(res));
    }
    return failures.length > 0 ? failures.join("; ") : null;
};

const readName = async (request: Request) => {
    const body = await request.json().catch(() => null);
    return typeof body?.name === "string" ? body.name.trim().slice(0, 60) : "";
};

const writeName = async (c: FiwareContext, route: string, name: string) => {
    const res = await upstream(`http://${c.host}:${IOTA_PORT}/iot/devices/${encodeURIComponent(buildDeviceId(c.type, route))}`, {
        method: "PUT",
        headers: { ...c.headers, ...json },
        body: JSON.stringify({ static_attributes: buildStaticAttributes(name) }),
    }, "IoT Agent");
    if (!res.ok) return detail(res);

    await upstream(`http://${c.host}:${ORION_PORT}/v2/entities/${encodeURIComponent(c.entityId)}/attrs?type=${encodeURIComponent(c.type)}`, {
        method: "PATCH",
        headers: { ...c.headers, ...json },
        body: JSON.stringify({ [NAME_ATTR]: { type: "Text", value: name } }),
    }, "Orion");
    return null;
};

export async function POST(request: Request, ctx: RouteContext<"/api/fiware/bus/[route]/device">) {
    const { route } = await ctx.params;
    const c = readContext(request, route);
    if (c instanceof Response) return c;

    const name = await readName(request);
    const res = await upstream(`http://${c.host}:${IOTA_PORT}/iot/devices`, {
        method: "POST",
        headers: { ...c.headers, ...json },
        body: JSON.stringify({ devices: [buildDevice(c.type, route, name)] }),
    }, "IoT Agent");

    const existed = res.status === 409;
    if (!res.ok && !existed) return relay(res, "IoT Agent não encontrou o recurso (verifique serviço e path).");

    const warnings: string[] = [];
    // Dispositivo que já existia: o nome informado passa a ser o nome de cadastro dele
    if (existed && name) {
        const problem = await writeName(c, route, name);
        if (problem) warnings.push(`Dispositivo já existia, mas o nome não foi gravado: ${problem}`);
    }
    const subscription = await subscribeToSth(c, route, readNotifyUrl(request));
    if (subscription) warnings.push(`Dispositivo ${existed ? "já existia" : "criado"}, mas a assinatura do STH falhou: ${subscription}`);

    return Response.json({
        ok: true,
        deviceId: buildDeviceId(c.type, route),
        existed,
        warning: warnings.length > 0 ? warnings.join(" ") : null,
    });
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/fiware/bus/[route]/device">) {
    const { route } = await ctx.params;
    const c = readContext(request, route);
    if (c instanceof Response) return c;

    const problem = await writeName(c, route, await readName(request));
    return problem ? Response.json({ error: `Não foi possível gravar o nome no IoT Agent: ${problem}` }, { status: 502 }) : Response.json({ ok: true });
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/fiware/bus/[route]/device">) {
    const { route } = await ctx.params;
    const c = readContext(request, route);
    if (c instanceof Response) return c;

    const res = await upstream(`http://${c.host}:${IOTA_PORT}/iot/devices/${encodeURIComponent(buildDeviceId(c.type, route))}`, {
        method: "DELETE",
        headers: c.headers,
    }, "IoT Agent");
    if (!res.ok && res.status !== 404) return relay(res, "");

    await upstream(`http://${c.host}:${ORION_PORT}/v2/entities/${encodeURIComponent(c.entityId)}?type=${encodeURIComponent(c.type)}`, {
        method: "DELETE",
        headers: c.headers,
    }, "Orion");

    const problem = await unsubscribeFromSth(c, readNotifyUrl(request));
    return Response.json({
        ok: true,
        warning: problem ? `Dispositivo removido, mas a assinatura do STH não foi apagada: ${problem}` : null,
    });
}
