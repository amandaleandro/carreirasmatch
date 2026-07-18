"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import type { OabSecondPhaseResult } from "@/lib/tools";

const AREAS = [
  "Direito Civil",
  "Direito Penal",
  "Direito do Trabalho",
  "Direito Constitucional",
  "Direito Administrativo",
  "Direito Tributário",
  "Direito Empresarial",
];

function ResultView({ result }: { result: OabSecondPhaseResult }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5 text-center">
        <p className="text-3xl font-bold">{result.totalScore.toFixed(1)}</p>
        <p className="text-sm text-neutral-500">de 5,0 pontos (estimativa)</p>
      </div>

      <div className="space-y-3">
        {result.criterionScores.map((c, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 hover:border-violet-300 dark:hover:border-violet-800 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-sm font-medium">{c.criterion}</p>
              <span className="text-sm font-semibold shrink-0">
                {c.score.toFixed(1)}/{c.maxScore.toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{c.feedback}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <h3 className="font-semibold mb-2">Resumo</h3>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{result.generalFeedback}</p>
      </div>

      {result.missingArguments.length > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 p-6">
          <h3 className="font-semibold mb-2 text-amber-900 dark:text-amber-200">O que faltou (a FGV costuma cobrar)</h3>
          <ul className="space-y-1 list-disc list-inside text-sm text-amber-900 dark:text-amber-200">
            {result.missingArguments.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <h3 className="font-semibold mb-3">Prioridades para a próxima tentativa</h3>
        <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
          {result.topFixes.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-neutral-400">
        Correção gerada por IA como treino. É uma estimativa nos critérios da FGV, não substitui a
        correção oficial da banca.
      </p>
    </div>
  );
}

export function OabSecondPhaseForm() {
  const [area, setArea] = useState(AREAS[0]);
  const [pecaText, setPecaText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OabSecondPhaseResult | null>(null);
  const [showForm, setShowForm] = useState(true);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!pecaText.trim()) {
      setError("Cole o texto da sua peça ou resposta discursiva.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/tools/oab/segunda-fase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area, pecaText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");
      setResult(data as OabSecondPhaseResult);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-colors";

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link href="/tools/oab" className="text-sm text-violet-600 dark:text-violet-400 hover:underline">
        ← Voltar para OAB
      </Link>
      <header className="mt-4 mb-10">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-violet-50 text-violet-600 border border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900">
          OAB 2ª fase
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Corretor de peça e discursivas</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Cole sua peça prático-profissional ou resposta discursiva e receba correção pelos 5 critérios da
          FGV, com nota estimada, o que faltou e o que priorizar.
        </p>
      </header>

      {result && !showForm && (
        <div className="mb-10 space-y-4">
          <ResultView result={result} />
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
          >
            Corrigir outra peça
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Área da 2ª fase</label>
            <select value={area} onChange={(e) => setArea(e.target.value)} className={inputClass}>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Texto da peça ou resposta discursiva</label>
            <textarea
              value={pecaText}
              onChange={(e) => setPecaText(e.target.value)}
              rows={16}
              placeholder="Cole aqui o texto completo da sua peça (endereçamento, fatos, fundamentação e pedidos) ou da resposta discursiva..."
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 text-white font-semibold px-5 py-2.5 shadow-sm shadow-violet-600/20 hover:bg-violet-700 transition-all disabled:opacity-50"
          >
            {loading ? "Corrigindo..." : "Corrigir minha peça"}
          </button>
        </form>
      )}
    </main>
  );
}
