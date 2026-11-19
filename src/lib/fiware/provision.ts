import {
    buildDeviceId, buildEntityId, COMMANDS, DEVICE_ATTRIBUTES, ENTITY_ID_PREFIX, HISTORY_ATTRS,
    IOTA_PROTOCOL, IOTA_TRANSPORT, NAME_ATTR,
} from "./config";
import type { DevicesResponse } from "./reading";

const STH_DESCRIPTION_PREFIX = "STH-Comet: histórico do ônibus";

export const buildStaticAttributes = (name: string) => [{ name: NAME_ATTR, type: "Text", value: name }];

export const buildDevice = (type: string, route: string, name: string) => ({
    device_id: buildDeviceId(type, route),
    entity_name: buildEntityId(route),
    entity_type: type,
    protocol: IOTA_PROTOCOL,
    transport: IOTA_TRANSPORT,
    attributes: DEVICE_ATTRIBUTES,
    commands: COMMANDS.map((command) => ({ name: command, type: "command" })),
    ...(name ? { static_attributes: buildStaticAttributes(name) } : {}),
});

export const buildSubscription = (type: string, route: string, notifyUrl: string) => ({
    description: `${STH_DESCRIPTION_PREFIX} ${route}`,
    subject: {
        entities: [{ id: buildEntityId(route), type }],
        condition: { attrs: HISTORY_ATTRS },
    },
    notification: {
        http: { url: notifyUrl },
        attrs: HISTORY_ATTRS,
        attrsFormat: "legacy",
    },
});

type Subscription = {
    id?: string;
    description?: string;
    subject?: { entities?: { id?: string }[] };
    notification?: { http?: { url?: string } };
};

export const findSubscriptions = (subscriptions: unknown, entityId: string, notifyUrl: string | null): Subscription[] =>
    Array.isArray(subscriptions)
        ? subscriptions.filter((s: Subscription) =>
            Array.isArray(s?.subject?.entities) &&
            s.subject.entities.some((e) => e?.id === entityId) &&
            (notifyUrl ? s.notification?.http?.url === notifyUrl : String(s.description ?? "").startsWith(STH_DESCRIPTION_PREFIX)))
        : [];

export const parseDevices = (body: unknown, type: string): DevicesResponse => {
    const raw = (body as { devices?: unknown } | null)?.devices;
    const result: DevicesResponse = { total: 0, devices: [], ignored: [] };
    if (!Array.isArray(raw)) return result;

    for (const d of raw) {
        result.total++;
        const deviceId = String(d?.device_id ?? "");
        const entityName = typeof d?.entity_name === "string" ? d.entity_name : "";
        const entityType = typeof d?.entity_type === "string" ? d.entity_type : "";

        if (entityType && entityType !== type) {
            result.ignored.push({ deviceId, entityName, entityType, reason: `tipo "${entityType}" é diferente do tipo configurado "${type}"` });
            continue;
        }
        if (!entityName.startsWith(ENTITY_ID_PREFIX)) {
            result.ignored.push({ deviceId, entityName, entityType, reason: `entity_name fora do padrão ${ENTITY_ID_PREFIX}<rota>` });
            continue;
        }
        const staticName = Array.isArray(d.static_attributes)
            ? d.static_attributes.find((a: { name?: string }) => a?.name === NAME_ATTR)?.value
            : undefined;
        result.devices.push({
            route: entityName.slice(ENTITY_ID_PREFIX.length),
            deviceId,
            name: typeof staticName === "string" ? staticName.trim() : "",
        });
    }
    return result;
};
