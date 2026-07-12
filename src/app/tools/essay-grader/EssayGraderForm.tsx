"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import type { EssayGradeResult } from "@/lib/tools";

function ResultView({ result }: { result: EssayGradeResult }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5 text-center">
        <p className="text-3xl font-bold">{result.totalScore}</p>
        <p className="text-sm text-neutral-500">de 1000 pontos</p>
      </div>

      <div className="space-y-3">
        {result.competencyScores.map((c, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-sm font-medium">{c.competency}</p>
              <span className="text-sm font-semibold shrink-0">{c.score}/200</span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{c.feedback}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <h3 className="font-semibold mb-2">Resumo</h3>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{result.generalFeedback}</p>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <h3 className="font-semibold mb-3">Prioridades para a próxima versão</h3>
        <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
          {result.topFixes.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function EssayGraderForm() {
  const [theme, setTheme] = useState("");
  const [essayText, setEssayText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EssayGradeResult | null>(null);
  const [showForm, setShowForm] = useState(true);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!essayText.trim()) {
      setError("Cole o texto da redação.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/tools/essay-grader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essayText, theme }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");

      setResult(data as EssayGradeResult);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link href="/tools" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar para ferramentas
      </Link>
      <header className="mt-4 mb-10">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
          Corretor de redação
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Corretor de redação</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Cole sua redação e receba uma nota estimada nas 5 competências do ENEM, com
          feedback específico do que ajustar.
        </p>
      </header>

      {result && !showForm && (
        <div className="mb-10 space-y-4">
          <ResultView result={result} />
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Corrigir outra redação
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Tema da redação (opcional)</label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Ex: Desafios para a valorização de comunidades tradicionais no Brasil"
              className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Texto da redação</label>
            <textarea
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              rows={16}
              placeholder="Cole aqui o texto completo da sua redação..."
              className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 text-white font-semibold px-5 py-2.5 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? "Corrigindo..." : "Corrigir minha redação"}
          </button>
        </form>
      )}
    </main>
  );
}
