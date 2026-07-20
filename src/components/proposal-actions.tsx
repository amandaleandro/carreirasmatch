"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Botões do contratante numa proposta pendente: aceitar (contrata) ou recusar.
export function ProposalActions({ proposalId }: { proposalId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "accept" | "reject") {
    if (action === "accept" && !confirm("Aceitar esta proposta contrata este freelancer e recusa as demais. Continuar?")) {
      return;
    }
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/freelance/proposals/${proposalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-500 mr-2">{error}</span>}
      <button onClick={() => act("reject")} disabled={loading !== null} className="rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-white/5 disabled:opacity-50">
        {loading === "reject" ? "..." : "Recusar"}
      </button>
      <button onClick={() => act("accept")} disabled={loading !== null} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
        {loading === "accept" ? "..." : "Aceitar e contratar"}
      </button>
    </div>
  );
}
