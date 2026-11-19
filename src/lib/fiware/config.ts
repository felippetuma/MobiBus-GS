// Portas dos serviços no servidor FIWARE 
export const ORION_PORT = 1026;
export const STH_PORT = 8666;
export const IOTA_PORT = 4041; // IoT Agent 

export const ENTITY_ID_PREFIX = "urn:ngsi-ld:Onibus:";
export const buildEntityId = (route: string) => `${ENTITY_ID_PREFIX}${route}`;

// Valores iniciais dos campos da página de configurações
export const DEFAULT_ENTITY_TYPE = "Onibus";
export const DEFAULT_SERVICE = "smart";
export const DEFAULT_SERVICEPATH = "/";
export const DEFAULT_STH_NOTIFY_URL = "http://sth-comet:8666/notify";

export const ORION_LIST_LIMIT = 1000;

// Sem leitura nova por mais de 60 s = "sem dados recentes"
export const POLL_INTERVAL_MS = 5000;
export const COMMAND_CHECK_MS = 2000;
export const COMMAND_TIMEOUT_MS = 15000;
export const STALE_AFTER_MS = 60000;

// Mapeamento do firmware (t, h, m, a, s) para os atributos no Orion
export const ATTRS = {
    temperaturaInterna: "temperaturaInterna", // t (Number)
    umidadeInterna: "umidadeInterna",         // h (Number)
    temperaturaMotor: "temperaturaMotor",     // m (Number)
    alerta: "alerta",                         // a (Text "true"/"false")
    buzzer: "buzzer",                         // s (Text "on"/"off")
} as const;

// Limites de alarme iguais aos do firmware (TEMP_INTERNA_MAX e TEMP_MOTOR_MAX): alarme quando valor > limite.
export const TEMP_INTERNA_MAX = 35.0;
export const TEMP_MOTOR_MAX = 79.0;

// Pressão dos 6 pneus (PSI): p1/p2 dianteiros esq./dir., p3/p4 traseiros esquerdos, p5/p6 traseiros direitos
export const TIRES = [
    { object_id: "p1", name: "pressaoPneu1", label: "Dianteiro esquerdo" },
    { object_id: "p2", name: "pressaoPneu2", label: "Dianteiro direito" },
    { object_id: "p3", name: "pressaoPneu3", label: "Traseiro esquerdo (externo)" },
    { object_id: "p4", name: "pressaoPneu4", label: "Traseiro esquerdo (interno)" },
    { object_id: "p5", name: "pressaoPneu5", label: "Traseiro direito (interno)" },
    { object_id: "p6", name: "pressaoPneu6", label: "Traseiro direito (externo)" },
] as const;

export const NAME_ATTR = "nome";

// Comandos aceitos pelo firmware
export const COMMANDS = ["resolverAlerta", "alertTemp", "alertOff", "buzzer_on", "buzzer_off"] as const;
export type Command = (typeof COMMANDS)[number];

//Provisionamento no Fireware
export const IOTA_PROTOCOL = "PDI-IoTA-UltraLight";
export const IOTA_TRANSPORT = "MQTT";

export const buildDeviceId = (type: string, route: string) => `${type.toLowerCase()}${route}`;

export const DEVICE_ATTRIBUTES = [
    { object_id: "t", name: ATTRS.temperaturaInterna, type: "Number" },
    { object_id: "h", name: ATTRS.umidadeInterna, type: "Number" },
    { object_id: "m", name: ATTRS.temperaturaMotor, type: "Number" },
    { object_id: "a", name: ATTRS.alerta, type: "Text" },
    { object_id: "s", name: ATTRS.buzzer, type: "Text" },
    ...TIRES.map((t) => ({ object_id: t.object_id, name: t.name, type: "Number" as const })),
] as const;

export const HISTORY_ATTRS = [ATTRS.temperaturaInterna, ATTRS.umidadeInterna, ATTRS.temperaturaMotor] as const;
