"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface ContractPanelProps {
  contractId: string;
  status: string; // active | delivered | completed | cancelled
  viewerRole: "client" | "freelancer";
  agreedLabel: string;
  counterpartName: string;
  alreadyReviewed: boolean;
}

export function ContractPanel({ contractId, status, viewerRole, agreedLabel, counterpartName, alreadyReviewed }: ContractPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "deliver" | "complete" | "cancel") {
    const confirms: Record<string, string> = {
      complete: "Confirmar a conclusão fecha o projeto. Continuar?",
      cancel: "Cancelar o contrato reabre o projeto para novas propostas. Continuar?",
    };
    if (confirms[action] && !confirm(confirms[action])) return;
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/freelance/contracts/${contractId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(null);
    }
  }

  const statusLabel: Record<string, string> = {
    active: "Em andamento",
    delivered: "Entregue — aguardando confirmação",
    completed: "Concluído",
    cancelled: "Cancelado",
  };

  return (
    <section className="rounded-2xl border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Contrato</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {viewerRole === "client" ? "Freelancer" : "Contratante"}: {counterpartName} · {agreedLabel}
          </p>
        </div>
        <span className="rounded-full bg-white dark:bg-white/10 px-3 py-1 text-xs font-semibold">{statusLabel[status] ?? status}</span>
      </div>

      {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

      {status !== "completed" && status !== "cancelled" && (
        <div className="flex flex-wrap gap-2">
          {viewerRole === "freelancer" && status === "active" && (
            <button onClick={() => act("deliver")} disabled={loading !== null} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {loading === "deliver" ? "..." : "Marcar como entregue"}
            </button>
          )}
          {viewerRole === "client" && (
            <button onClick={() => act("complete")} disabled={loading !== null} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
              {loading === "complete" ? "..." : "Confirmar conclusão"}
            </button>
          )}
          <button onClick={() => act("cancel")} disabled={loading !== null} className="rounded-lg border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm font-medium hover:bg-white/50 dark:hover:bg-white/5 disabled:opacity-50">
            {loading === "cancel" ? "..." : "Cancelar contrato"}
          </button>
        </div>
      )}

      {status === "completed" && !alreadyReviewed && <ReviewForm contractId={contractId} />}
      {status === "completed" && alreadyReviewed && (
        <p className="text-sm text-green-700 dark:text-green-400 font-medium">Obrigado! Sua avaliação foi registrada.</p>
      )}
    </section>
  );
}

function ReviewForm({ contractId }: { contractId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (rating < 1) {
      setError("Escolha uma nota de 1 a 5 estrelas.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/freelance/contracts/${contractId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao enviar avaliação.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 space-y-3">
      <p className="text-sm font-semibold">Avalie o trabalho</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setRating(n)} className="text-2xl leading-none" aria-label={`${n} estrelas`}>
            <span className={n <= (hover || rating) ? "text-amber-500" : "text-neutral-300 dark:text-neutral-600"}>★</span>
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} maxLength={2000} placeholder="Comentário (opcional)" className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500" />
      {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
      <button onClick={submit} disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
        {loading ? "Enviando..." : "Enviar avaliação"}
      </button>
    </div>
  );
}
