"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

type Result = {
  overallImpression: string;
  strongestRepos: string[];
  fixes: string[];
};

export function GithubReviewForm() {
  const [githubText, setGithubText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!githubText.trim()) {
      setError("Cole a lista de repositórios/descrições do seu GitHub.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/tools/github-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubText, targetRole }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");

      setResult(data as Result);
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
          Análise de perfil
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Análise de GitHub</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Cole os nomes e descrições dos seus repositórios (ou o conteúdo dos
          READMEs) para receber uma avaliação de recrutador técnico.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Cargo-alvo</label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Ex: DevOps Júnior"
            className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Repositórios (nome + descrição/README de cada um)
          </label>
          <textarea
            value={githubText}
            onChange={(e) => setGithubText(e.target.value)}
            rows={10}
            placeholder="Ex: 'todo-app' - Aplicação de lista de tarefas em React e Node.js. 'scripts-python' - Scripts de automação..."
            className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 text-white font-semibold px-5 py-2.5 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? "Analisando..." : "Analisar GitHub"}
        </button>
      </form>

      {result && (
        <div className="mt-10 space-y-6">
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <h3 className="font-semibold mb-3">Impressão geral</h3>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {result.overallImpression}
            </p>
          </div>
          {result.strongestRepos.length > 0 && (
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
              <h3 className="font-semibold mb-3">
                Repositórios que vale destacar no currículo
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.strongestRepos.map((r, i) => (
                  <span
                    key={i}
                    className="text-xs rounded-full px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <h3 className="font-semibold mb-3">O que ajustar</h3>
            <ul className="space-y-2 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
              {result.fixes.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
