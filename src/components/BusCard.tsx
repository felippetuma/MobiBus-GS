"use client"
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { alertsOf, describeCommand, type BusEntry, type CommandResult } from "@/lib/fiware/reading";
import { TEMP_INTERNA_MAX, TEMP_MOTOR_MAX } from "@/lib/fiware/config";
import BusStatusBadge from "./BusStatusBadge";

type Props = { entry: BusEntry; onResolve: (route: string) => Promise<CommandResult> };

const BusCard = ({ entry, onResolve }: Props) => {
    const { bus, status, reading } = entry;
    const [busy, setBusy] = useState(false);
    const [feedback, setFeedback] = useState<{ kind: "ok" | "warn" | "error"; text: string } | null>(null);
    const alerts = alertsOf(reading);
    const alerta = alerts.driver;
    const anyAlert = alerta || alerts.tempInterna || alerts.tempMotor;

    const resolve = async () => {
        setBusy(true);
        setFeedback(null);
        try {
            setFeedback(describeCommand("resolverAlerta", await onResolve(bus.route)));
        } catch (e) {
            setFeedback({ kind: "error", text: e instanceof Error ? e.message : "Falha ao enviar o comando." });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className={`flex flex-col rounded-xl border bg-zinc-100 ${anyAlert ? "border-alert shadow-md shadow-alert/30" : "border-zinc-300"}`}>
            <Link href={`/dashboard/onibus/${encodeURIComponent(bus.route)}`} className="flex flex-col gap-3 rounded-xl p-4 transition-colors hover:bg-zinc-200/60">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-xl font-bold">Ônibus {bus.route}</p>
                        {entry.displayName && <p className="truncate text-sm text-zinc-600">{entry.displayName}</p>}
                    </div>
                    <BusStatusBadge status={status} />
                </div>
                {[
                    [alerts.driver, "Ônibus solicitou suporte"],
                    [alerts.tempInterna, `Temperatura interna acima de ${TEMP_INTERNA_MAX} °C`],
                    [alerts.tempMotor, `Temperatura do motor acima de ${TEMP_MOTOR_MAX} °C`],
                ].filter(([on]) => on).map(([, text]) => (
                    <p key={text as string} className="flex items-center gap-2 rounded-xl bg-alert/20 p-3 text-sm font-bold text-alert">
                        <TriangleAlert size={18} className="shrink-0" /> {text}
                    </p>
                ))}
            </Link>
            {alerta && (
                <div className="flex flex-col gap-2 px-4 pb-4">
                    <button type="button" disabled={busy} onClick={resolve}
                        className="rounded-xl bg-blue-mobi px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-mobi/90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50">
                        {busy ? "Aguardando o firmware..." : "Resolver alerta"}
                    </button>
                    {feedback && <p role="status" className={`rounded-xl p-2 text-xs font-bold ${feedback.kind === "ok" ? "bg-active/20 text-active" : feedback.kind === "warn" ? "bg-attention/25" : "bg-alert/20 text-alert"}`}>{feedback.text}</p>}
                </div>
            )}
        </div>
    )
}

export default BusCard
