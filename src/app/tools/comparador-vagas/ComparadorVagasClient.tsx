"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Plus, Trash2, CheckCircle2, AlertTriangle, Trophy, Zap } from "lucide-react";

interface JobInput {
  title: string;
  description: string;
}

interface JobComparisonResult {
  comparisons: Array<{
    jobTitle: string;
    companyName: string;
    matchScore: number;
    effortToAdapt: "Baixo" | "Médio" | "Alto";
    keyRequirementsFound: string[];
    criticalGaps: string[];
    recommendationVerdict: string;
    tag: "Melhor aposta agora" | "Mais fácil de aplicar hoje" | "Melhor crescimento futuro" | "Exige preparação antes";
  }>;
  overallWinnerIndex: number;
  comparisonSummary: string;
}

export function ComparadorVagasClient() {
  const [jobs, setJobs] = useState<JobInput[]>([
    { title: "", description: "" },
    { title: "", description: "" },
  ]);
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addJobInput = () => {
    if (jobs.length >= 5) return;
    setJobs((prev) => [...prev, { title: "", description: "" }]);
  };

  const removeJobInput = (index: number) => {
    if (jobs.length <= 2) return;
    setJobs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateJob = (index: number, field: keyof JobInput, value: string) => {
    setJobs((prev) =>
      prev.map((j, i) => (i === index ? { ...j, [field]: value } : j))
    );
  };

  async function handleCompare() {
    const validJobs = jobs.filter((j) => j.title.trim() && j.description.trim());
    if (validJobs.length < 2) {
      setError("Preencha pelo menos 2 vagas (título e descrição) para realizar a comparação.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/tools/compare-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: validJobs, resumeText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao comparar vagas.");
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Dashboard
          </Link>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium">
            Ferramenta Decisória de Carreira
          </span>
        </div>

        {/* Hero Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-title font-bold text-neutral-900 dark:text-white">
                Comparador Avançado de Vagas
              </h1>
              <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400">
                Compare de 2 a 5 vagas lado a lado e descubra qual oportunidade oferece o maior retorno e menor esforço de adaptação.
              </p>
            </div>
          </div>
        </div>

        {/* Input Forms */}
        <div className="space-y-5">
          {/* Resume optional text */}
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2 shadow-sm">
            <label className="text-xs font-semibold text-neutral-900 dark:text-white block">
              Seu Currículo ou Resumo Profissional (Opcional):
            </label>
            <textarea
              rows={3}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Cole o texto do seu currículo para calcular o match exato contra as vagas..."
              className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
            />
          </div>

          {/* Job slots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-sm relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    Vaga #{idx + 1}
                  </span>
                  {jobs.length > 2 && (
                    <button
                      onClick={() => removeJobInput(idx)}
                      className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                      title="Remover vaga"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={job.title}
                  onChange={(e) => updateJob(idx, "title", e.target.value)}
                  placeholder="Título da vaga (ex: Analista de Marketing)"
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />

                <textarea
                  rows={5}
                  value={job.description}
                  onChange={(e) => updateJob(idx, "description", e.target.value)}
                  placeholder="Cole aqui a descrição completa da vaga..."
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
                />
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-4 pt-2">
            {jobs.length < 5 ? (
              <button
                onClick={addJobInput}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Adicionar Mais Uma Vaga ({jobs.length}/5)
              </button>
            ) : <div />}

            <button
              onClick={handleCompare}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" /> Comparando Oportunidades...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" /> Rodar Comparação Lado a Lado
                </>
              )}
            </button>
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>

        {/* Results Matrix */}
        {result && (
          <div className="space-y-6 pt-6 animate-in fade-in">
            {/* Summary Box */}
            <div className="p-5 rounded-3xl bg-purple-500/10 border border-purple-500/20 text-xs leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-purple-900 dark:text-purple-200">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Veredito de Decisão: {result.comparisons[result.overallWinnerIndex]?.jobTitle}</span>
              </div>
              <p className="text-neutral-700 dark:text-neutral-300">
                {result.comparisonSummary}
              </p>
            </div>

            {/* Side-by-side Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {result.comparisons.map((c, idx) => {
                const isWinner = idx === result.overallWinnerIndex;
                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-3xl border space-y-4 flex flex-col justify-between transition-all ${
                      isWinner
                        ? "bg-gradient-to-b from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-neutral-900 dark:to-neutral-900 border-amber-300 dark:border-amber-700/60 shadow-md ring-1 ring-amber-400/30"
                        : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-neutral-400 font-semibold">
                            Vaga #{idx + 1}
                          </span>
                          <h3 className="font-bold text-sm text-neutral-900 dark:text-white leading-snug">
                            {c.jobTitle}
                          </h3>
                        </div>
                        {isWinner && (
                          <span className="p-1.5 rounded-full bg-amber-500 text-white shadow-sm" title="Melhor Oportunidade">
                            <Trophy className="w-4 h-4" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-850">
                        <span className="text-[10px] uppercase font-semibold text-neutral-500">Match Estimado</span>
                        <span className="text-base font-bold font-mono text-purple-600 dark:text-purple-400">
                          {c.matchScore}%
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Status da Oportunidade</span>
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                          {c.tag}
                        </span>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                        <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Requisitos Atendidos
                        </span>
                        <ul className="space-y-1 text-neutral-700 dark:text-neutral-300">
                          {c.keyRequirementsFound.map((req, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[11px]">
                              <span>•</span> <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                        <span className="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Lacunas Identificadas
                        </span>
                        <ul className="space-y-1 text-neutral-700 dark:text-neutral-300">
                          {c.criticalGaps.map((gap, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[11px]">
                              <span>•</span> <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      <strong>Recomendação:</strong> {c.recommendationVerdict}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
