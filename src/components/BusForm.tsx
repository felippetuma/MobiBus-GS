"use client"
import { ArrowLeft, CircleCheck, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addBus, saveBuses, updateBus, validateBus } from "@/lib/fiware/buses";
import { useBuses, useBusList, useProvision } from "@/lib/fiware/hooks";
import { syncAdd, syncEdit } from "@/lib/fiware/sync";

const input = "w-full px-4 py-2.5 text-sm sm:text-base placeholder-black/40 border border-white/10 text-center bg-zinc-300 rounded-xl focus:outline-none focus:border-blue-mobi focus:ring-1 focus:ring-blue-mobi transition-all";
const label = "text-sm sm:text-base font-medium block";

const BusForm = ({ editing }: { editing?: string }) => {
    const router = useRouter();
    const { list } = useBusList();
    const { entries, loaded } = useBuses();
    const { hasHost, api } = useProvision();
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState<{ route: string; notes: string[] } | null>(null);
    const all = entries.map((e) => e.bus);
    const current = editing === undefined ? undefined : all.find((b) => b.route === editing);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const bus = { route: String(data.get("route") ?? "").trim(), name: String(data.get("name") ?? "").trim() };

        const problem = validateBus(all, bus, editing);
        if (problem) return setError(problem);

        const touchesFiware = editing === undefined || bus.route !== editing || bus.name !== (current?.name ?? "");
        if (touchesFiware && !hasHost) return setError("Configure o IP do servidor FIWARE em Configurações antes de continuar.");

        setBusy(true);
        const result = editing === undefined
            ? await syncAdd(api, bus.route, bus.name)
            : await syncEdit(api, editing, bus.route, bus.name, current?.name ?? "");
        setBusy(false);
        if (result.error) return setError(result.error);

        const next = editing === undefined ? addBus(list, bus) : updateBus(list, editing, bus);
        if (!saveBuses(next)) return setError("Não foi possível salvar: o navegador bloqueou o armazenamento local.");

        if (result.notes.length > 0) return setDone({ route: bus.route, notes: result.notes });
        router.push(editing === undefined ? "/dashboard" : `/dashboard/onibus/${encodeURIComponent(bus.route)}`);
    };

    const back = editing === undefined ? "/dashboard" : `/dashboard/onibus/${encodeURIComponent(editing)}`;

    return (
        <div className="flex w-full flex-col gap-4 p-6 pt-8 md:p-12 md:pt-10">
            <Link href={back} className="inline-flex w-fit items-center gap-2 text-sm text-zinc-600 hover:text-blue-mobi">
                <ArrowLeft size={16} /> Voltar
            </Link>
            <h1 className="text-2xl font-bold md:text-3xl">{editing === undefined ? "Cadastrar ônibus" : "Editar ônibus"}</h1>

            {done ? (
                <div className="flex w-full max-w-md flex-col gap-4 self-center rounded-xl border border-zinc-300 bg-zinc-100 p-4">
                    <p className="flex items-center gap-2 font-bold text-active">
                        <CircleCheck size={18} /> Ônibus {done.route} {editing === undefined ? "cadastrado" : "salvo"}.
                    </p>
                    {done.notes.map((note) => (
                        <p key={note} role="alert" className="flex items-start gap-2 rounded-xl bg-attention/25 p-3 text-sm font-bold">
                            <TriangleAlert size={18} className="mt-0.5 shrink-0" /> {note}
                        </p>
                    ))}
                    <Link href="/dashboard" className="w-full rounded-xl bg-blue-mobi px-4 py-2.5 text-center text-sm text-white hover:font-medium sm:text-base">Continuar</Link>
                </div>
            ) : editing !== undefined && !current ? (
                <p className="rounded-xl border border-zinc-300 bg-zinc-100 p-4 text-sm">
                    {loaded ? `Ônibus ${editing} não está cadastrado.` : "Carregando..."}
                </p>
            ) : (
                <form key={current?.route ?? "novo"} onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-4 self-center rounded-xl border border-zinc-300 bg-zinc-100 p-4">
                    <div className="w-full space-y-2">
                        <label htmlFor="route" className={label}>Número do ônibus: <span className="text-red-600">*</span></label>
                        <input id="route" type="text" name="route" defaultValue={current?.route ?? ""} placeholder="001" maxLength={20} onChange={() => setError(null)} className={input} />
                    </div>
                    <div className="w-full space-y-2">
                        <label htmlFor="name" className={label}>Nome / descrição:</label>
                        <input id="name" type="text" name="name" defaultValue={current?.name ?? ""} placeholder="Ex.: Terminal Central - Centro" maxLength={60} onChange={() => setError(null)} className={input} />
                    </div>
                    <p className="text-xs text-zinc-600">
                        {editing === undefined
                            ? "O ônibus é cadastrado no dashboard e no FIWARE (dispositivo no IoT Agent, com o nome, e assinatura do STH-Comet)."
                            : "O nome de cadastro fica gravado no FIWARE. Trocar o número do ônibus cadastra o novo número e remove o antigo."}
                    </p>
                    {!hasHost && (
                        <p className="rounded-xl bg-attention/25 p-3 text-sm font-bold">
                            Nenhum servidor FIWARE configurado. Informe o IP em{" "}
                            <Link href="/dashboard/config" className="underline">Configurações</Link>.
                        </p>
                    )}
                    {error && <p role="alert" className="text-sm text-center font-bold text-alert">{error}</p>}
                    <button type="submit" disabled={busy} className="w-full cursor-pointer rounded-xl bg-blue-mobi px-4 py-2.5 text-sm text-white hover:font-medium disabled:cursor-not-allowed disabled:opacity-50 sm:text-base">
                        {busy ? "Aplicando no FIWARE..." : editing === undefined ? "Cadastrar" : "Salvar"}
                    </button>
                </form>
            )}
        </div>
    )
}

export default BusForm
