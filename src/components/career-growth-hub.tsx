"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, Sparkles, MessageSquareText, Users, CheckCircle2, PartyPopper } from "lucide-react";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";

type PlanResult = {
  competencyGaps: string[];
  developmentActions: { action: string; timeframe: string }[];
  negotiationTalkingPoints: string[];
  leadershipReadiness: string;
};

type Plan = {
  currentRole: string;
  currentSeniority: string;
  targetRole: string;
  result: PlanResult | null;
} | null;

const INPUT_CLASS =
  "w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors";

export function CareerGrowthHub({ plan }: { plan: Plan }) {
  const [editing, setEditing] = useState(!plan);
  const [currentRole, setCurrentRole] = useState(plan?.currentRole ?? "");
  const [currentSeniority, setCurrentSeniority] = useState(plan?.currentSeniority ?? "");
  const [targetRole, setTargetRole] = useState(plan?.targetRole ?? "");
  const [result, setResult] = useState<PlanResult | null>(plan?.result ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promotionReported, setPromotionReported] = useState(false);

  function reportPromotion() {
    setPromotionReported(true);
    track(ANALYTICS_EVENTS.PROMOTION_REPORTED, { targetRole });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!currentRole.trim() || !targetRole.trim()) {
      setError("Informe o cargo atual e o próximo cargo desejado.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/career-growth/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentRole, currentSeniority, targetRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar o plano.");
      setResult({
        competencyGaps: JSON.parse(data.plan.competencyGaps),
        developmentActions: JSON.parse(data.plan.developmentActions),
        negotiationTalkingPoints: JSON.parse(data.plan.negotiationTalkingPoints),
        leadershipReadiness: data.plan.leadershipReadiness,
      });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-6 font-sans">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Evolução Profissional</h1>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 -mt-4">
        Do seu cargo atual ao próximo: gaps de competência, plano de desenvolvimento e argumentos de negociação.
      </p>

      {!editing && result ? (
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {currentRole} {currentSeniority && `(${currentSeniority})`} → {targetRole}
            </p>
          </div>
          <button type="button" onClick={() => setEditing(true)} className="text-xs font-semibold text-blue-600 hover:underline shrink-0">
            Editar / gerar de novo
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Cargo atual</label>
            <input type="text" value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} placeholder="Ex: Analista de Marketing Pleno" className={INPUT_CLASS} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Senioridade atual (opcional)</label>
            <input type="text" value={currentSeniority} onChange={(e) => setCurrentSeniority(e.target.value)} placeholder="Ex: Pleno, há 2 anos no cargo" className={INPUT_CLASS} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Próximo cargo desejado</label>
            <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Ex: Coordenador de Marketing" className={INPUT_CLASS} />
          </div>

          {error && <p className="text-xs font-bold text-red-600">{error}</p>}

          <div className="flex gap-2">
            {plan && (
              <button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold px-4 py-2.5 text-slate-600 dark:text-slate-300">
                Cancelar
              </button>
            )}
            <button type="submit" disabled={loading} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 disabled:opacity-50">
              <Sparkles className="h-3.5 w-3.5" />
              {loading ? "Gerando..." : "Gerar meu plano"}
            </button>
          </div>
        </form>
      )}

      {result && !editing && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Competências que separam você do próximo cargo</h2>
            <div className="flex flex-wrap gap-1.5">
              {result.competencyGaps.map((c) => (
                <span key={c} className="rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2.5 py-1 text-xs font-semibold">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Plano de desenvolvimento</h2>
            <ul className="space-y-2.5">
              {result.developmentActions.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{item.action}</span>
                    <span className="block text-slate-400 mt-0.5">{item.timeframe}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <MessageSquareText className="h-4 w-4 text-blue-600" /> Argumentos para a conversa de promoção
            </h2>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
              {result.negotiationTalkingPoints.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <Link href="/tools/salary-calculator" className="inline-block text-xs font-semibold text-blue-600 hover:underline">
              Calcular pacote salarial →
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-600" /> Prontidão para liderança
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{result.leadershipReadiness}</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/20 p-5 text-center space-y-2">
            {promotionReported ? (
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                Parabéns! Ficamos felizes em ter ajudado 🎉
              </p>
            ) : (
              <>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Já conseguiu essa promoção?</p>
                <button
                  type="button"
                  onClick={reportPromotion}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 transition-all"
                >
                  <PartyPopper className="h-3.5 w-3.5" /> Sim, consegui!
                </button>
              </>
            )}
          </div>

          <Link href="/tools/career-growth-guide" className="block text-center text-xs font-semibold text-blue-600 hover:underline">
            Ver guia completo de crescimento de carreira →
          </Link>
        </div>
      )}
    </main>
  );
}
