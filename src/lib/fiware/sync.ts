export type SyncApi = {
    provision(route: string, name: string): Promise<{ existed: boolean; warning: string | null }>;
    rename(route: string, name: string): Promise<void>;
    deprovision(route: string): Promise<{ warning: string | null }>;
};

export type SyncResult = { error: string | null; notes: string[] };

const message = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

export const syncAdd = async (api: SyncApi, route: string, name: string): Promise<SyncResult> => {
    try {
        const r = await api.provision(route, name);
        const notes: string[] = [];
        if (r.existed) notes.push(`O dispositivo do ônibus ${route} já existia no IoT Agent e foi apenas vinculado ao dashboard.`);
        if (r.warning) notes.push(r.warning);
        return { error: null, notes };
    } catch (e) {
        return { error: message(e, "Falha ao cadastrar no FIWARE."), notes: [] };
    }
};

export const syncRemove = async (api: SyncApi, route: string): Promise<SyncResult> => {
    try {
        const r = await api.deprovision(route);
        return { error: null, notes: r.warning ? [r.warning] : [] };
    } catch (e) {
        return { error: message(e, "Falha ao remover do FIWARE."), notes: [] };
    }
};

export const syncEdit = async (api: SyncApi, oldRoute: string, newRoute: string, name: string, oldName: string): Promise<SyncResult> => {
    if (oldRoute === newRoute) {
        if (name === oldName) return { error: null, notes: [] };
        try {
            await api.rename(newRoute, name);
            return { error: null, notes: [] };
        } catch (e) {
            return { error: message(e, "Falha ao gravar o nome no FIWARE."), notes: [] };
        }
    }

    const added = await syncAdd(api, newRoute, name);
    if (added.error) return added;

    const removed = await syncRemove(api, oldRoute);
    const notes = [...added.notes];
    if (removed.error) notes.push(`O ônibus ${newRoute} foi criado, mas o antigo (${oldRoute}) não foi removido do FIWARE: ${removed.error}`);
    else notes.push(...removed.notes);
    return { error: null, notes };
};
