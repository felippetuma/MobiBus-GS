"use client"
import { CirclePlus, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useBuses, useFiwareSettings } from "@/lib/fiware/hooks";
import BusCard from "./BusCard";
import Image from "next/image";

const stat = "flex flex-col gap-1 rounded-xl border border-zinc-300 bg-zinc-100 p-4";

const mono = "font-mono text-xs break-all";

const BusGrid = () => {
    const { entries, summary, connection, error, diagnostics, sendCommand } = useBuses();
    const { settings } = useFiwareSettings();

    return (
        <div className="flex w-full flex-col gap-6 p-6 pt-8 md:p-12 md:pt-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1>
                    <Image src="/icons/mobibus-branco.svg" alt="MobiBus - Ônibus" width={126} height={32} className="brightness-0" />
                </h1>
                <Link href="/dashboard/onibus/novo" className="inline-flex items-center gap-2 rounded-xl bg-blue-mobi px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-mobi/90">
                    <CirclePlus size={18} /> Cadastrar ônibus
                </Link>
            </div>

            {entries.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-xl border border-zinc-300 bg-zinc-100 p-8 text-center">
                    <p className="text-zinc-600">Nenhum ônibus cadastrado ainda.</p>
                    <Link href="/dashboard/onibus/novo" className="inline-flex items-center gap-2 rounded-xl bg-blue-mobi px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-mobi/90">
                        <CirclePlus size={18} /> Cadastrar ônibus
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <div className={stat}>
                            <span className="text-sm text-zinc-600">Total</span>
                            <span className="text-3xl font-bold">{summary.total}</span>
                        </div>
                        <div className={stat}>
                            <span className="text-sm text-zinc-600">Ativos</span>
                            <span className="text-3xl font-bold text-active">{summary.online}</span>
                        </div>
                        <div className={stat}>
                            <span className="text-sm text-zinc-600">Com aviso</span>
                            <span className={`text-3xl font-bold ${summary.withAlert > 0 ? "text-alert" : ""}`}>{summary.withAlert}</span>
                        </div>
                    </div>

                    {connection === "unconfigured" && (
                        <p className="rounded-xl border border-zinc-300 bg-zinc-100 p-4 text-sm">
                            Nenhum servidor configurado. Informe o IP do FIWARE em{" "}
                            <Link href="/dashboard/config" className="font-semibold text-blue-mobi underline">Configurações</Link>.
                        </p>
                    )}
                    {connection === "offline" && error && (
                        <p role="alert" className="flex items-center gap-2 rounded-xl bg-alert/20 p-4 text-sm font-bold text-alert">
                            <TriangleAlert size={18} className="shrink-0" /> {error}
                        </p>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {entries.map((entry) => (
                            <BusCard key={entry.bus.route} entry={entry} onResolve={(route) => sendCommand(route, "resolverAlerta")} />
                        ))}
                    </div>
                </>
            )}

            {settings.host && (
                <details className="rounded-xl border border-zinc-300 bg-zinc-100 p-4 text-sm" open={diagnostics.devicesError !== null || diagnostics.ignoredDevices.length > 0 || diagnostics.ignoredEntities.length > 0}>
                    <summary className="cursor-pointer font-semibold">Diagnóstico da conexão com o FIWARE</summary>
                    <div className="mt-3 flex flex-col gap-2">
                        <p>Consultando <span className={mono}>{settings.host}</span> · serviço <span className={mono}>{settings.service || "(vazio)"}</span> · path <span className={mono}>{settings.servicePath}</span> · tipo <span className={mono}>{settings.entityType}</span></p>
                        <p>
                            IoT Agent: {diagnostics.devicesTotal === null ? "sem resposta" : `${diagnostics.devicesTotal} dispositivo(s) devolvido(s)`}
                            {" · "}Orion: {diagnostics.entitiesTotal === null ? "sem resposta" : `${diagnostics.entitiesTotal} entidade(s) do tipo ${settings.entityType}`}
                        </p>
                        {diagnostics.devicesError && (
                            <p role="alert" className="rounded-xl bg-alert/20 p-3 font-bold text-alert">
                                Não foi possível listar os dispositivos do IoT Agent: {diagnostics.devicesError}
                            </p>
                        )}
                        {diagnostics.ignoredDevices.length > 0 && (
                            <div className="rounded-xl bg-attention/25 p-3">
                                <p className="font-bold">Dispositivos do IoT Agent ignorados ({diagnostics.ignoredDevices.length}):</p>
                                <ul className="mt-1 list-disc pl-5">
                                    {diagnostics.ignoredDevices.map((d) => (
                                        <li key={`${d.deviceId}-${d.entityName}`}><span className={mono}>{d.deviceId || "(sem device_id)"}</span>: {d.reason}{d.entityName && <> (entity_name <span className={mono}>{d.entityName}</span>)</>}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {diagnostics.ignoredEntities.length > 0 && (
                            <div className="rounded-xl bg-attention/25 p-3">
                                <p className="font-bold">Entidades do Orion ignoradas ({diagnostics.ignoredEntities.length}): o id não segue o padrão urn:ngsi-ld:Onibus:&lt;rota&gt;</p>
                                <ul className="mt-1 list-disc pl-5">
                                    {diagnostics.ignoredEntities.map((id) => <li key={id}><span className={mono}>{id}</span></li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </details>
            )}
        </div>
    )
}

export default BusGrid
