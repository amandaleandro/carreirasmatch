"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import { JOURNEYS } from "@/lib/journeys";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

type JobDiagnosticResult = {
  clarityScore: number;
  clarityLabel: string;
  mainRequirements: string[];
  ambiguities: string[];
  suggestions: string[];
};

export default function DiagnosticoDaVagaPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JobDiagnosticResult | null>(null);
  const journey = JOURNEYS.company;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (jobDescription.trim().length < 40) {
      setError("Cole o texto completo da vaga (mínimo 40 caracteres).");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/tools/job-diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar diagnóstico.");
      setResult(data);
      track(ANALYTICS_EVENTS.DIAGNOSTIC_COMPLETED, { journey: "company" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao gerar diagnóstico.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setJobDescription("");
    setError(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700">
            {journey.free.label} — Gratuito
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            {journey.promise}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
            Cole o texto da sua vaga e veja em segundos onde ela está clara, o que pode confundir
            candidatos e o que ajustar antes de publicar.
          </p>
        </div>

        {!result ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Cole o texto da vaga
                </label>
                <textarea
                  rows={10}
                  placeholder="Cole aqui a descrição completa da vaga (responsabilidades, requisitos, benefícios)..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? "Analisando sua vaga..." : "Gerar diagnóstico grátis"}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={handleReset}
                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 flex items-center gap-1"
              >
                ← Analisar outra vaga
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
              <div className="text-center space-y-2">
                <div className="text-5xl font-extrabold text-blue-600 dark:text-blue-400">{result.clarityScore}%</div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{result.clarityLabel}</p>
              </div>

              {result.mainRequirements.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3">
                    Requisitos já claros
                  </h2>
                  <ul className="space-y-2">
                    {result.mainRequirements.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.ambiguities.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3">
                    Pontos ambíguos
                  </h2>
                  <ul className="space-y-2">
                    {result.ambiguities.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.suggestions.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
                    Sugestões de ajuste
                  </h2>
                  <ul className="space-y-2">
                    {result.suggestions.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-blue-100 bg-blue-50/60 dark:border-blue-950/60 dark:bg-blue-950/20 p-6 text-center space-y-3">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Pronta pra publicar e ranquear candidatos automaticamente por IA?
              </p>
              <Link
                href="/empresa/cadastro"
                onClick={() => track(ANALYTICS_EVENTS.LANDING_CTA_CLICKED, { journey: "company", tier: "signup" })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all"
              >
                Cadastrar minha empresa grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
