"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import type { CutoffEstimateResult } from "@/lib/tools";

function ResultView({ result }: { result: CutoffEstimateResult }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 mb-1">Estimativa</p>
        <p className="text-lg font-bold">{result.estimateLabel}</p>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-2">{result.reasoning}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-sm shadow-slate-900/5">
          <h3 className="font-semibold text-sm mb-1.5">Faixa típica de corte</h3>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">{result.typicalCutoffRange}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-sm shadow-slate-900/5">
          <h3 className="font-semibold text-sm mb-1.5">Sua distância do corte</h3>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">{result.gapAnalysis}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <h3 className="font-semibold mb-3">Como melhorar sua chance</h3>
        <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
          {result.improvementTips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-neutral-400">
        Estimativa aproximada e apenas de referência. Notas de corte variam por edital, número de vagas,
        região e ano.
      </p>
    </div>
  );
}

export function ConcursoCutoffForm() {
  const [cargo, setCargo] = useState("");
  const [banca, setBanca] = useState("");
  const [regiao, setRegiao] = useState("");
  const [userScore, setUserScore] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CutoffEstimateResult | null>(null);
  const [showForm, setShowForm] = useState(true);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!cargo.trim()) {
      setError("Informe o cargo ou concurso.");
      return;
    }
    const score = Number(userScore);
    if (!Number.isFinite(score) || score < 0) {
      setError("Informe sua pontuação estimada (percentual de acerto ou nota).");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/tools/concurso/nota-de-corte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cargo, banca, regiao, userScore: score }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");
      setResult(data as CutoffEstimateResult);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-colors";

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link href="/tools/concurso" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
        ← Voltar para concurso
      </Link>
      <header className="mt-4 mb-10">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900">
          Nota de corte
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Estimativa de nota de corte</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Informe o cargo, a banca e sua pontuação estimada e veja uma referência realista de onde você
          precisa chegar.
        </p>
      </header>

      {result && !showForm && (
        <div className="mb-10 space-y-4">
          <ResultView result={result} />
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Estimar outro concurso
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Cargo ou concurso</label>
            <input
              type="text"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Ex: Analista Judiciário do TRF, Técnico do INSS"
              className={inputClass}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Banca (opcional)</label>
              <input
                type="text"
                value={banca}
                onChange={(e) => setBanca(e.target.value)}
                placeholder="Ex: FGV, CESPE"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Região / Estado (opcional)</label>
              <input
                type="text"
                value={regiao}
                onChange={(e) => setRegiao(e.target.value)}
                placeholder="Ex: SP, Nordeste"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Sua pontuação estimada (percentual de acerto ou nota)
            </label>
            <input
              type="number"
              value={userScore}
              onChange={(e) => setUserScore(e.target.value)}
              placeholder="Ex: 70"
              min={0}
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-600 text-white font-semibold px-5 py-2.5 shadow-sm shadow-amber-600/20 hover:bg-amber-700 transition-all disabled:opacity-50"
          >
            {loading ? "Estimando..." : "Estimar minha chance"}
          </button>
        </form>
      )}
    </main>
  );
}
