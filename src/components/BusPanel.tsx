"use client"
import { ArrowLeft, BellRing, Cog, Droplets, Gauge, Pencil, Thermometer, Trash2, TriangleAlert, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { removeBus, saveBuses } from "@/lib/fiware/buses";
import { TEMP_INTERNA_MAX, TEMP_MOTOR_MAX, TIRES, type Command } from "@/lib/fiware/config";
import { useBus, useBuses, useBusList, useProvision } from "@/lib/fiware/hooks";
import { alertsOf, describeCommand } from "@/lib/fiware/reading";
import { syncRemove } from "@/lib/fiware/sync";
import BusStatusBadge from "./BusStatusBadge";

const card = "flex flex-col gap-2 rounded-xl border border-zinc-300 bg-zinc-100 p-4";
const button = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";
const secondary = `${button} bg-zinc-200 hover:bg-zinc-300`;

const fmt = (v: number | null, unit: string) => (v === null ? "--" : `${v.toFixed(1)} ${unit}`);

const BusPanel = ({ route }: { route: string }) => {
    const router = useRouter();
    const { list } = useBusList();
    const { entries, loaded } = useBuses();
    const { status, reading, error, sendCommand } = useBus(route);
    const [busy, setBusy] = useState<Command | null>(null);
    const [feedback, setFeedback] = useState<{ kind: "ok" | "warn" | "error"; text: string } | null>(null);

    const { hasHost, api } = useProvision();
    const [removing, setRemoving] = useState(false);
    const [removedNotes, setRemovedNotes] = useState<string[] | null>(null);
    const [removeBusy, setRemoveBusy] = useState(false);
    const [removeError, setRemoveError] = useState<string | null>(null);

    const entry = entries.find((e) => e.bus.route === route);
    const bus = entry?.bus;
    const alerts = alertsOf(reading);

    const run = async (command: Command) => {
        setBusy(command);
        setFeedback(null);
        try {
            setFeedback(describeCommand(command, await sendCommand(command)));
        } catch (e) {
            setFeedback({ kind: "error", text: e instanceof Error ? e.message : "Falha ao enviar o comando." });
        } finally {
            setBusy(null);
        }
    };

    const confirmRemove = async () => {
        setRemoveBusy(true);
        setRemoveError(null);
        const result = await syncRemove(api, route);
        if (result.error) {
            setRemoveError(result.error);
            setRemoveBusy(false);
            return;
        }
        if (!saveBuses(removeBus(list, route))) {
            setRemoveError("O navegador bloqueou o armazenamento local.");
            setRemoveBusy(false);
            return;
        }
        if (result.notes.length > 0) setRemovedNotes(result.notes);
        else router.push("/dashboard");
    };

    const connected = status === "online" || status === "stale";
    const canSend = connected && busy === null;

    if (removedNotes) {
        return (
            <div className="flex w-full flex-col items-start gap-4 p-6 pt-8 md:p-12 md:pt-10">
                <p className="font-bold text-active">Ônibus {route} removido.</p>
                {removedNotes.map((note) => (
                    <p key={note} role="alert" className="flex items-start gap-2 rounded-xl bg-attention/25 p-3 text-sm font-bold">
                        <TriangleAlert size={18} className="mt-0.5 shrink-0" /> {note}
                    </p>
                ))}
                <Link href="/dashboard" className={`${button} bg-blue-mobi text-white hover:bg-blue-mobi/90`}>Voltar ao grid</Link>
            </div>
        )
    }

    if (!bus) {
        if (!loaded) return null;
        return (
            <div className="flex w-full flex-col items-start gap-4 p-6 pt-8 md:p-12 md:pt-10">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-blue-mobi"><ArrowLeft size={16} /> Voltar</Link>
                <p className="rounded-xl border border-zinc-300 bg-zinc-100 p-4 text-sm">
                    O ônibus {route} não está cadastrado.{" "}
                    <Link href="/dashboard/onibus/novo" className="font-semibold text-blue-mobi underline">Cadastrar ônibus</Link>
                </p>
            </div>
        )
    }

    return (
        <div className="flex w-full flex-col gap-6 p-6 pt-8 md:p-12 md:pt-10">
            <Link href="/dashboard" className="inline-flex w-fit items-center gap-2 text-sm text-zinc-600 hover:text-blue-mobi">
                <ArrowLeft size={16} /> Voltar
            </Link>

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold md:text-3xl">Ônibus {bus.route}</h1>
                    {entry?.displayName && <p className="text-zinc-600">{entry.displayName}</p>}
                </div>
                <BusStatusBadge status={status} />
            </div>

            <div className="flex flex-wrap gap-2">
                <Link href={`/dashboard/onibus/${encodeURIComponent(route)}/editar`} className={secondary}><Pencil size={16} /> Editar</Link>
                <button type="button" onClick={() => setRemoving((v) => !v)} className={`${button} bg-alert/15 text-alert hover:bg-alert/25`}><Trash2 size={16} /> Remover</button>
            </div>

            {removing && (
                <div className={`${card} border-alert`}>
                    <p className="font-bold">Remover o ônibus {route}?</p>
                    <p className="text-sm">
                        Será removido do dashboard e do FIWARE: dispositivo no IoT Agent, entidade no Orion e assinatura do STH-Comet.
                    </p>
                    {!hasHost && (
                        <p className="text-sm font-bold text-alert">
                            Nenhum servidor FIWARE configurado. Informe o IP em{" "}
                            <Link href="/dashboard/config" className="underline">Configurações</Link>.
                        </p>
                    )}
                    {removeError && <p role="alert" className="text-sm font-bold text-alert">{removeError}</p>}
                    <div className="flex gap-2">
                        <button type="button" disabled={removeBusy || !hasHost} onClick={confirmRemove} className={`${button} bg-alert text-white hover:bg-alert/90`}>
                            {removeBusy ? "Removendo..." : "Confirmar remoção"}
                        </button>
                        <button type="button" disabled={removeBusy} onClick={() => { setRemoving(false); setRemoveError(null); }} className={secondary}>Cancelar</button>
                    </div>
                </div>
            )}

            {status === "unconfigured" && (
                <p className={card}>
                    Nenhum servidor configurado. Informe o IP do FIWARE em{" "}
                    <Link href="/dashboard/config" className="font-semibold text-blue-mobi underline">Configurações</Link>.
                </p>
            )}
            {(status === "offline" || status === "missing") && error && (
                <p role="alert" className="flex items-center gap-2 rounded-xl bg-alert/20 p-4 text-sm font-bold text-alert">
                    <TriangleAlert size={18} className="shrink-0" /> {error}
                </p>
            )}

            {reading && !connected && (
                <p role="status" className="rounded-xl bg-attention/25 p-3 text-sm font-bold">
                    Os botões de comando estão desabilitados porque não há conexão com o Orion neste momento
                    (os valores abaixo são os últimos recebidos).
                </p>
            )}

            {reading && (
                <>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className={`${card} ${alerts.tempInterna ? "border-alert bg-alert/10" : ""}`}>
                            <span className="flex items-center gap-2 text-sm text-zinc-600"><Thermometer size={18} /> Temperatura interna</span>
                            {alerts.tempInterna && <span className="text-xs font-bold text-alert">Acima do limite de {TEMP_INTERNA_MAX} °C</span>}
                            <span className={`text-3xl font-bold ${alerts.tempInterna ? "text-alert" : ""}`}>{fmt(reading.temperaturaInterna, "°C")}</span>
                        </div>
                        <div className={card}>
                            <span className="flex items-center gap-2 text-sm text-zinc-600"><Droplets size={18} /> Umidade interna</span>
                            <span className="text-3xl font-bold">{fmt(reading.umidadeInterna, "%")}</span>
                        </div>
                        <div className={`${card} ${alerts.tempMotor ? "border-alert bg-alert/10" : ""}`}>
                            <span className="flex items-center gap-2 text-sm text-zinc-600"><Cog size={18} /> Temperatura do motor</span>
                            {alerts.tempMotor && <span className="text-xs font-bold text-alert">Acima do limite de {TEMP_MOTOR_MAX} °C</span>}
                            <span className={`text-3xl font-bold ${alerts.tempMotor ? "text-alert" : ""}`}>{fmt(reading.temperaturaMotor, "°C")}</span>
                        </div>
                    </div>

                    <div className={card}>
                        <span className="flex items-center gap-2 text-sm text-zinc-600"><Gauge size={18} /> Pressão dos pneus</span>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {TIRES.map((t, i) => (
                                <div key={t.name} className="flex flex-col rounded-xl bg-zinc-200/60 p-3">
                                    <span className="text-xs text-zinc-600">{t.object_id.toUpperCase()} · {t.label}</span>
                                    <span className="text-2xl font-bold">{fmt(reading.pneus[i], "PSI")}</span>
                                </div>
                            ))}
                        </div>
                        {reading.pneus.every((p) => p === null) && (
                            <p className="text-xs text-zinc-600">
                                Sem leitura de pneus no Orion. Se o dispositivo já estava provisionado, acrescente os atributos
                                p1 a p6 (pressaoPneu1 a pressaoPneu6, Number) no IoT Agent.
                            </p>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className={`${card} ${reading.alerta ? "border-alert bg-alert/10" : ""}`}>
                            <span className="flex items-center gap-2 text-sm text-zinc-600"><TriangleAlert size={18} /> Alerta do botão do motorista</span>
                            <span className={`text-xl font-bold ${reading.alerta ? "text-alert" : "text-active"}`}>
                                {reading.alerta ? "Ônibus solicitou suporte" : "Sem alertas"}
                            </span>
                            <button type="button" disabled={!canSend} onClick={() => run("resolverAlerta")}
                                className={`${button} bg-blue-mobi text-white hover:bg-blue-mobi/90`}>
                                {busy === "resolverAlerta" ? "Aguardando o firmware..." : "Resolver alerta"}
                            </button>
                        </div>

                        <div className={card}>
                            <span className="flex items-center gap-2 text-sm text-zinc-600"><BellRing size={18} /> Buzzer</span>
                            <span className="text-xl font-bold">{reading.buzzer ? "Ligado" : "Desligado"}</span>
                            <div className="flex gap-2">
                                <button type="button" disabled={!canSend} onClick={() => run("buzzer_on")} className={`${secondary} flex-1`}>
                                    <Volume2 size={16} /> {busy === "buzzer_on" ? "Enviando..." : "Ligar buzzer"}
                                </button>
                                <button type="button" disabled={!canSend} onClick={() => run("buzzer_off")} className={`${secondary} flex-1`}>
                                    <VolumeX size={16} /> {busy === "buzzer_off" ? "Enviando..." : "Desligar buzzer"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={card}>
                        <span className="flex items-center gap-2 text-sm text-zinc-600"><TriangleAlert size={18} /> Alarme de temperatura (remoto)</span>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <button type="button" disabled={!canSend} onClick={() => run("alertTemp")} className={`${secondary} flex-1`}>
                                {busy === "alertTemp" ? "Enviando..." : "Disparar alarme de temperatura"}
                            </button>
                            <button type="button" disabled={!canSend} onClick={() => run("alertOff")} className={`${secondary} flex-1`}>
                                {busy === "alertOff" ? "Enviando..." : "Cancelar alarme de temperatura"}
                            </button>
                        </div>
                        <p className="text-xs text-zinc-600">
                            Disparar toca o alarme de temperatura mesmo com o buzzer silenciado. Cancelar desliga só o alarme remoto:
                            se o sensor local ainda estiver em alarme, o buzzer continua soando. Esses comandos não alteram o alerta do motorista.
                        </p>
                    </div>

                    {feedback && (
                        <p role="status" className={`rounded-xl p-3 text-sm font-bold ${feedback.kind === "ok" ? "bg-active/20 text-active" : feedback.kind === "warn" ? "bg-attention/25" : "bg-alert/20 text-alert"}`}>{feedback.text}</p>
                    )}
                </>
            )}
        </div>
    )
}

export default BusPanel
