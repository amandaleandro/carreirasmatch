"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Zap,
  BarChart3,
  FileText,
  Briefcase,
  Link as LinkIcon,
  Download,
  RefreshCw,
} from "lucide-react";

interface JobInput {
  url?: string;
  title: string;
  description: string;
  fetchingUrl?: boolean;
  fetchError?: string | null;
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
    { url: "", title: "", description: "" },
    { url: "", title: "", description: "" },
  ]);
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preparingIndex, setPreparingIndex] = useState<number | null>(null);
  const [preparedId, setPreparedId] = useState<string | null>(null);

  const addJobInput = () => {
    if (jobs.length >= 5) return;
    setJobs((prev) => [...prev, { url: "", title: "", description: "" }]);
  };

  const removeJobInput = (index: number) => {
    if (jobs.length <= 2) return;
    setJobs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateJob = (index: number, field: keyof JobInput, value: unknown) => {
    setJobs((prev) =>
      prev.map((j, i) => (i === index ? { ...j, [field]: value } : j))
    );
  };

  async function handleFetchJobUrl(index: number) {
    const job = jobs[index];
    if (!job.url?.trim()) return;

    updateJob(index, "fetchingUrl", true);
    updateJob(index, "fetchError", null);

    try {
      const res = await fetch("/api/tools/fetch-job-by-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: job.url.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao puxar vaga do link.");

      const formattedTitle = data.companyName
        ? `${data.jobTitle} — ${data.companyName}`
        : data.jobTitle;

      setJobs((prev) =>
        prev.map((j, i) =>
          i === index
            ? {
                ...j,
                title: formattedTitle || j.title,
                description: data.description || j.description,
                fetchingUrl: false,
                fetchError: null,
              }
            : j
        )
      );
    } catch (err) {
      setJobs((prev) =>
        prev.map((j, i) =>
          i === index
            ? {
                ...j,
                fetchingUrl: false,
                fetchError: err instanceof Error ? err.message : "Erro ao importar link.",
              }
            : j
        )
      );
    }
  }

  async function handleCompare() {
    const validJobs = jobs.filter((j) => j.title.trim() && j.description.trim());
    if (validJobs.length < 2) {
      setError("Preencha pelo menos 2 vagas (título e descrição) ou puxe os dados via link para comparar.");
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
      setError(err instanceof Error ? err.message : "Erro inesperado ao comparar vagas.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePrepare(index: number) {
    const source = jobs.filter((j) => j.title.trim() && j.description.trim())[index];
    const comparison = result?.comparisons[index];
    if (!source || !comparison) return;
    setPreparingIndex(index);
    setError(null);
    try {
      const response = await fetch("/api/tools/prepare-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: comparison.jobTitle || source.title,
          company: comparison.companyName,
          url: source.url,
          description: source.description,
          matchScore: comparison.matchScore,
          effortToAdapt: comparison.effortToAdapt,
          keyRequirementsFound: comparison.keyRequirementsFound,
          criticalGaps: comparison.criticalGaps,
          recommendationVerdict: comparison.recommendationVerdict,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível preparar a candidatura.");
      setPreparedId(data.applicationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível preparar a candidatura.");
    } finally {
      setPreparingIndex(null);
    }
  }

  return (
    <main className="px-4 md:px-8 py-8 max-w-6xl mx-auto w-full space-y-8 font-sans">
      {/* Header Navigation & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mr-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao Dashboard
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <BarChart3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Ferramenta Decisória de Carreira
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Comparador Avançado de Vagas
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Compare de 2 a 5 vagas lado a lado. Cole o texto ou insira os links das vagas (Gupy, LinkedIn, etc) para importar automaticamente dados e requisitos.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="space-y-6">
        {/* Resume (Optional) Input Box */}
        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/90 dark:border-neutral-800 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <label className="text-xs font-bold text-slate-900 dark:text-white">
              Seu Currículo ou Resumo Profissional <span className="text-slate-400 font-normal">(Opcional)</span>:
            </label>
          </div>
          <textarea
            rows={3}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Cole o texto do seu currículo para calcular o match exato e lacunas de cada vaga contra o seu perfil..."
            className="w-full p-3.5 rounded-2xl bg-slate-50/70 dark:bg-neutral-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
          />
        </div>

        {/* Job Input Slots */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map((job, idx) => (
            <div
              key={idx}
              className="p-5 md:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/90 dark:border-neutral-800 space-y-4 shadow-sm relative transition-all"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  <Briefcase className="w-3.5 h-3.5" />
                  Vaga #{idx + 1}
                </span>
                {jobs.length > 2 && (
                  <button
                    onClick={() => removeJobInput(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Remover vaga"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Import via URL */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                  <label className="text-[11px] font-bold text-purple-950 dark:text-purple-200 flex items-center justify-between">
                    <span>Puxar Dados via Link / URL da Vaga <span className="text-purple-600/70 font-normal">(Gupy, LinkedIn, etc)</span>:</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="url"
                        value={job.url || ""}
                        onChange={(e) => updateJob(idx, "url", e.target.value)}
                        placeholder="https://gupy.io/... ou https://..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFetchJobUrl(idx)}
                      disabled={!job.url?.trim() || job.fetchingUrl}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                      {job.fetchingUrl ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Puxando...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Puxar Dados</span>
                        </>
                      )}
                    </button>
                  </div>
                  {job.fetchError && (
                    <p className="text-[11px] text-rose-500 font-medium pt-0.5">{job.fetchError}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Título da Vaga / Empresa:
                  </label>
                  <input
                    type="text"
                    value={job.title}
                    onChange={(e) => updateJob(idx, "title", e.target.value)}
                    placeholder="Ex: Analista de Dados — Mercado Livre"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-neutral-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Descrição da Vaga e Requisitos:
                  </label>
                  <textarea
                    rows={6}
                    value={job.description}
                    onChange={(e) => updateJob(idx, "description", e.target.value)}
                    placeholder="Cole aqui a descrição da vaga ou use o botão 'Puxar Dados' acima..."
                    className="w-full p-3.5 rounded-xl bg-slate-50/70 dark:bg-neutral-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {jobs.length < 5 ? (
            <button
              onClick={addJobInput}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-neutral-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Adicionar Mais Uma Vaga ({jobs.length}/5)</span>
            </button>
          ) : <div />}

          <button
            onClick={handleCompare}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Analisando e Comparando Vagas...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Rodar Comparação Lado a Lado</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Matrix */}
      {result && (
        <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-300">
          {/* Winner Banner & Decision Summary */}
          <div className="p-6 rounded-3xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/50 space-y-3 shadow-sm">
            <div className="flex items-center gap-2.5 text-base font-extrabold text-purple-950 dark:text-purple-100">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <span>
                Veredito Recomendado:{" "}
                <span className="text-purple-700 dark:text-purple-300">
                  {result.comparisons[result.overallWinnerIndex]?.jobTitle}
                </span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-1">
              {result.comparisonSummary}
            </p>
            {preparedId && (
              <Link href={`/applications/${preparedId}`} className="inline-flex items-center rounded-xl bg-purple-700 px-4 py-2 text-xs font-bold text-white hover:bg-purple-800">
                Abrir candidatura preparada →
              </Link>
            )}
          </div>

          {/* Side-by-side Comparative Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            {result.comparisons.map((c, idx) => {
              const isWinner = idx === result.overallWinnerIndex;
              return (
                <div
                  key={idx}
                  className={`p-5 md:p-6 rounded-3xl border space-y-4 flex flex-col justify-between transition-all ${
                    isWinner
                      ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60 shadow-md ring-2 ring-amber-400/20"
                      : "bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 shadow-sm"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Card Top Banner */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                          Vaga #{idx + 1}
                        </span>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                          {c.jobTitle}
                        </h3>
                        {c.companyName && (
                          <p className="text-xs text-slate-500 font-medium">{c.companyName}</p>
                        )}
                      </div>
                      {isWinner && (
                        <span className="p-2 rounded-xl bg-amber-500 text-white shadow-sm shrink-0" title="Vaga Campeã">
                          <Trophy className="w-4 h-4" />
                        </span>
                      )}
                    </div>

                    {/* Match Score Display */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 dark:bg-neutral-950 border border-slate-100 dark:border-neutral-850">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Match Estimado</span>
                      <span className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400">
                        {c.matchScore}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/70 px-3 py-2 dark:border-slate-800 dark:bg-neutral-950/60">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Esforço de ajuste</span>
                      <span className={`text-xs font-extrabold ${c.effortToAdapt === "Baixo" ? "text-emerald-600" : c.effortToAdapt === "Médio" ? "text-amber-600" : "text-rose-600"}`}>{c.effortToAdapt}</span>
                    </div>

                    {/* Classification Tag */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Classificação</span>
                      <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                        {c.tag}
                      </span>
                    </div>

                    {/* Requirements Met */}
                    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Requisitos Atendidos
                      </span>
                      <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                        {c.keyRequirementsFound.map((req, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] leading-tight">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Critical Gaps */}
                    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Lacunas Identificadas
                      </span>
                      <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                        {c.criticalGaps.map((gap, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] leading-tight">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendation Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-neutral-950/50 p-3 rounded-xl">
                    <strong className="text-slate-900 dark:text-white font-bold">Veredito:</strong>{" "}
                    {c.recommendationVerdict}
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePrepare(idx)}
                    disabled={preparingIndex !== null}
                    className="w-full rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-extrabold text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {preparingIndex === idx ? "Preparando..." : "Preparar candidatura"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
