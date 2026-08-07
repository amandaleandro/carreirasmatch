"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Target, AlertTriangle } from "lucide-react";
import { JOURNEYS } from "@/lib/journeys";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

type StudyDiagnosticResult = {
  currentSituation: string;
  mainDifficulties: string[];
  firstNextStep: string;
};

const OBJECTIVES: { value: string; label: string; toolHref: string }[] = [
  { value: "enem", label: "ENEM", toolHref: "/ensino-medio/calculadora-enem" },
  { value: "vestibular", label: "Vestibular", toolHref: "/universidade" },
  { value: "concurso", label: "Concurso público", toolHref: "/tools/concurso" },
  { value: "oab", label: "Exame da OAB", toolHref: "/tools/oab" },
  { value: "ensino_medio", label: "Ensino médio (matérias e provas)", toolHref: "/ensino-medio" },
];

export default function DiagnosticoDePreparacaoPage() {
  const [objective, setObjective] = useState<string>("");
  const [context, setContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StudyDiagnosticResult | null>(null);
  const journey = JOURNEYS.study;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!objective) {
      setError("Escolha o que você está estudando para.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/tools/study-diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar diagnóstico.");
      setResult(data);
      track(ANALYTICS_EVENTS.DIAGNOSTIC_COMPLETED, { journey: "study", objective });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao gerar diagnóstico.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setContext("");
    setError(null);
  }

  const selectedTool = OBJECTIVES.find((o) => o.value === objective);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700">
            {journey.free.label}: Gratuito
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            {journey.promise}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
            Escolha seu objetivo e conte um pouco da sua situação. Você recebe uma leitura inicial e o
            primeiro passo para começar hoje.
          </p>
        </div>

        {!result ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
                  Estou estudando para
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {OBJECTIVES.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setObjective(o.value)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                        objective === o.value
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300"
                          : "border-slate-200 text-slate-700 hover:border-blue-300 dark:border-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Conte um pouco da sua situação (opcional)
                </label>
                <textarea
                  rows={4}
                  placeholder="Ex: já estudo há 3 meses, tenho dificuldade em manter rotina, minha maior dificuldade é matemática..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                {isLoading ? "Gerando diagnóstico..." : "Gerar diagnóstico grátis"}
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
                ← Refazer diagnóstico
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                  Sua situação atual
                </h2>
                <p className="text-sm text-slate-800 dark:text-slate-200">{result.currentSituation}</p>
              </div>

              {result.mainDifficulties.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3">
                    Principais dificuldades
                  </h2>
                  <ul className="space-y-2">
                    {result.mainDifficulties.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                  Seu primeiro próximo passo
                </h2>
                <p className="flex items-start gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {result.firstNextStep}
                </p>
              </div>
            </div>

            {selectedTool && (
              <div className="rounded-3xl border border-blue-100 bg-blue-50/60 dark:border-blue-950/60 dark:bg-blue-950/20 p-6 text-center space-y-3">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Pronto para montar seu plano de estudos para {selectedTool.label}?
                </p>
                <Link
                  href={selectedTool.toolHref}
                  onClick={() => track(ANALYTICS_EVENTS.LANDING_CTA_CLICKED, { journey: "study", tier: "oneOff" })}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all"
                >
                  Continuar minha preparação
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
