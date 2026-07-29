"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

const inputClass =
  "w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors";
const labelClass = "block text-sm font-medium mb-1.5";

export function ProposalForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [coverLetter, setCoverLetter] = useState("");
  const [bid, setBid] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!coverLetter.trim() || !bid.trim()) {
      setError("Escreva sua mensagem e informe o valor.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/freelance/projects/${projectId}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverLetter, bid, estimatedDays }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao enviar proposta.");
      track(ANALYTICS_EVENTS.FREELANCE_PROPOSAL_SUBMITTED, {
        estimated_days_provided: Boolean(estimatedDays),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6">
      <h2 className="text-lg font-semibold">Enviar proposta</h2>
      <div>
        <label className={labelClass}>Sua mensagem</label>
        <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={5} className={inputClass} maxLength={4000} placeholder="Apresente-se, explique como faria e por que é a pessoa certa." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Seu valor (R$)</label>
          <input type="number" min={0} step={50} value={bid} onChange={(e) => setBid(e.target.value)} className={inputClass} placeholder="Ex: 1500" />
        </div>
        <div>
          <label className={labelClass}>Prazo (dias), opcional</label>
          <input type="number" min={1} step={1} value={estimatedDays} onChange={(e) => setEstimatedDays(e.target.value)} className={inputClass} placeholder="Ex: 7" />
        </div>
      </div>
      {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
      <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
        {loading ? "Enviando..." : "Enviar proposta"}
      </button>
    </form>
  );
}
