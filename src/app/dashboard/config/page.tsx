"use client"
import { useState } from "react";
import BusStatusBadge from "@/components/BusStatusBadge";
import { useBuses, useFiwareSettings } from "@/lib/fiware/hooks";
import { normalizeHost, saveSettings } from "@/lib/fiware/settings";

const input = "w-full px-4 py-2.5 text-sm sm:text-base placeholder-black/40 border border-white/10 text-center bg-zinc-300 rounded-xl focus:outline-none focus:border-blue-mobi focus:ring-1 focus:ring-blue-mobi transition-all";
const label = "text-sm sm:text-base font-medium block";

const ConfigPage = () => {
    const { settings, raw } = useFiwareSettings();
    const { connection } = useBuses();
    const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const get = (name: string) => String(data.get(name) ?? "").trim();

        const ok = saveSettings({
            host: normalizeHost(get("ipFirmware")),
            service: get("serviceFireware"),
            servicePath: get("pathFireware") || "/",
            entityType: get("typeEntity"),
            urlSthComet: get("urlSthComet"),
        });
        setMessage(ok
            ? { ok: true, text: "Configurações salvas." }
            : { ok: false, text: "Não foi possível salvar: o navegador bloqueou o armazenamento local." });
    };

    return (
        <div className="w-full flex flex-col items-start gap-4 p-6 pt-8 md:p-12 md:pt-10">
            <h1 className="font-bold text-2xl md:text-3xl">Configurações</h1>
            <h2 className="text-2xl font-semibold text-zinc-700">
                Usuário
            </h2>
            <div className="flex w-full flex-wrap items-center justify-between gap-4 pt-3">
                <div className="flex items-center gap-4">
                    <span className="flex size-16 md:size-20 justify-center items-center bg-blue-mobi rounded-full text-3xl font-bold text-white select-none">MB</span>
                    <div>
                        <h2 className="text-2xl font-semibold">MobiBus Admin</h2>
                        <p className="text-base text-center font-semibold text-alert">Admin</p>
                    </div>
                </div>
                <BusStatusBadge status={connection} />
            </div>
            <h2 className="text-2xl font-semibold text-zinc-700 pt-5">Conexão</h2>
            <form key={raw} onSubmit={handleSubmit} className="pt-2 w-full max-w-md self-center flex flex-col gap-4 bg-zinc-100 border border-zinc-300 rounded-xl p-4">
                <div className="w-full space-y-2">
                    <label className={label}>IP do Servidor do Fireware:</label>
                    <input type="text" name="ipFirmware" defaultValue={settings.host} placeholder="192.168.0.10" className={input} />
                </div>
                <div className="w-full space-y-2">
                    <label className={label}>Serviço do Fireware:</label>
                    <input type="text" name="serviceFireware" defaultValue={settings.service} placeholder="smart" className={input} />
                </div>
                <div className="w-full space-y-2">
                    <label className={label}>PATH do Serviço do Fireware:</label>
                    <input type="text" name="pathFireware" defaultValue={settings.servicePath} placeholder="/" className={input} />
                </div>
                <div className="w-full space-y-2">
                    <label className={label}>Tipo:</label>
                    <input type="text" name="typeEntity" defaultValue={settings.entityType} placeholder="Onibus" required className={input} />
                </div>
                <div className="w-full space-y-2">
                    <label className={label}>URL do STH-COMET:</label>
                    <input type="text" name="urlSthComet" defaultValue={settings.urlSthComet} placeholder="http://sth-comet:8666/notify" className={input} />
                </div>
                {message && (
                    <p role="status" className={`text-sm text-center font-bold ${message.ok ? "text-active" : "text-alert"}`}>{message.text}</p>
                )}
                <button type="submit" className="w-full bg-blue-mobi text-white cursor-pointer hover:font-medium px-4 py-2.5 text-sm sm:text-base rounded-xl">Salvar</button>
            </form>
        </div>
    )
}

export default ConfigPage
