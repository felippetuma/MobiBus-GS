import type { BusStatus } from "@/lib/fiware/reading";

const styles: Record<BusStatus, { label: string; box: string; dot: string; text: string }> = {
    online: { label: "Ativo", box: "bg-active/25", dot: "bg-active animate-pulse", text: "text-active" },
    stale: { label: "Sem dados recentes", box: "bg-attention/25", dot: "bg-attention", text: "text-attention" },
    missing: { label: "Sem registro", box: "bg-zinc-200", dot: "bg-zinc-400", text: "text-zinc-600" },
    offline: { label: "Offline", box: "bg-alert/20", dot: "bg-alert", text: "text-alert" },
    loading: { label: "Conectando", box: "bg-zinc-200", dot: "bg-zinc-400 animate-pulse", text: "text-zinc-500" },
    unconfigured: { label: "Sem servidor", box: "bg-zinc-200", dot: "bg-zinc-400", text: "text-zinc-500" },
};

const BusStatusBadge = ({ status }: { status: BusStatus }) => {
    const s = styles[status];
    return (
        <div className={`flex w-fit shrink-0 items-center gap-2 rounded-full p-2 pr-3 ${s.box}`}>
            <span className={`block size-3 shrink-0 rounded-full ${s.dot}`} />
            <span className={`text-xs sm:text-sm font-semibold uppercase ${s.text}`}>{s.label}</span>
        </div>
    )
}

export default BusStatusBadge
