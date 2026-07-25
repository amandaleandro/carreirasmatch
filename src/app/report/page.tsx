import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TRACK_LABELS, CareerTrack } from "@/components/analysis-display";
import { DeleteAnalysisButton } from "@/components/delete-analysis-button";
import {
  TrendingUp,
  Award,
  Target,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  PlusCircle,
  BarChart3,
  Check,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Relatório de Evolução Profissional | CarreirasMatch",
  description: "Acompanhe a evolução do seu score de aderência e preenchimento de lacunas técnicas.",
};

export default async function GeneralReportDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const analyses = await prisma.analysis.findMany({
    where: { resume: { userId: session.user.id } },
    orderBy: { createdAt: "asc" }, // Order chronologically
  });

  if (analyses.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 w-full text-center">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-8 sm:p-12 shadow-sm space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Seu Relatório de Evolução
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
              Realize sua primeira análise de compatibilidade com uma vaga para visualizar seus scores, evolução de competências e histórico de relatórios.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Fazer minha primeira análise</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Calculate stats
  const totalAnalyses = analyses.length;
  const latestAnalysis = analyses[totalAnalyses - 1];
  const firstAnalysis = analyses[0];

  const overallScores = analyses.map((a) => a.overallScore);
  const technicalScores = analyses.map((a) => a.technicalScore);
  const atsScores = analyses.map((a) => a.atsScore);

  const averageAdherence = Math.round(overallScores.reduce((a, b) => a + b, 0) / totalAnalyses);
  const averageTechnical = Math.round(technicalScores.reduce((a, b) => a + b, 0) / totalAnalyses);
  const averageATS = Math.round(atsScores.reduce((a, b) => a + b, 0) / totalAnalyses);

  const scoreEvolution = latestAnalysis.overallScore - firstAnalysis.overallScore;

  // Process Keyword coverage evolution
  const allAcquiredKeywords = new Set<string>();
  const currentMissingKeywords = new Set<string>();

  analyses.forEach((a) => {
    const found: string[] = JSON.parse(a.keywordsFound || "[]");
    found.forEach((k) => allAcquiredKeywords.add(k.toLowerCase()));
  });

  const latestMissing: string[] = JSON.parse(latestAnalysis.keywordsMissing || "[]");
  latestMissing.forEach((k) => currentMissingKeywords.add(k.toLowerCase()));

  // Deduplicate and match original casing
  const originalCasing: Record<string, string> = {};
  analyses.forEach((a) => {
    const found: string[] = JSON.parse(a.keywordsFound || "[]");
    const missing: string[] = JSON.parse(a.keywordsMissing || "[]");
    [...found, ...missing].forEach((k) => {
      originalCasing[k.toLowerCase()] = k;
    });
  });

  const acquiredList = Array.from(allAcquiredKeywords).map((k) => originalCasing[k] || k);
  const missingList = Array.from(currentMissingKeywords).map((k) => originalCasing[k] || k);

  return (
    <main className="px-4 md:px-8 py-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <TrendingUp className="w-3.5 h-3.5" />
            Evolução de Carreira
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Painel de Evolução Profissional
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Monitore a evolução do seu score de aderência e o preenchimento de palavras-chave.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 text-sm transition-colors shadow-md shadow-blue-500/20 shrink-0 self-start sm:self-center"
        >
          <Sparkles className="w-4 h-4" />
          <span>Nova Análise</span>
        </Link>
      </div>

      {/* Grid summarizing highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Média de Aderência
            </p>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{averageAdherence}%</p>
          <p className="text-xs text-slate-400">Média de {totalAnalyses} análises realizadas</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Média Técnica
            </p>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-500">{averageTechnical}%</p>
          <p className="text-xs text-slate-400">Competências técnicas hard-skills</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Otimização ATS
            </p>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-500">{averageATS}%</p>
          <p className="text-xs text-slate-400">Legibilidade por softwares ATS</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Evolução Total
            </p>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-3xl font-extrabold ${scoreEvolution >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
            {scoreEvolution >= 0 ? `+${scoreEvolution}` : scoreEvolution}%
          </p>
          <p className="text-xs text-slate-400">Evolução do 1º ao último teste</p>
        </div>
      </div>

      {/* Evolution Chart Visual Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Linha de Evolução do Score</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Trajetória cronológica de compatibilidade ao longo do tempo.
            </p>
          </div>
        </div>

        <div className="relative h-64 w-full flex flex-col justify-between pt-2">
          {/* Grid background lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="border-b border-slate-100 dark:border-slate-800/80 w-full text-right pr-2 text-[10px] text-slate-400">100%</div>
            <div className="border-b border-slate-100 dark:border-slate-800/80 w-full text-right pr-2 text-[10px] text-slate-400">75%</div>
            <div className="border-b border-slate-100 dark:border-slate-800/80 w-full text-right pr-2 text-[10px] text-slate-400">50%</div>
            <div className="border-b border-slate-100 dark:border-slate-800/80 w-full text-right pr-2 text-[10px] text-slate-400">25%</div>
            <div className="w-full text-right pr-2 text-[10px] text-slate-400">0%</div>
          </div>

          {/* SVG Line */}
          {analyses.length > 1 ? (
            <div className="absolute inset-0 px-8 py-4">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <path
                  d={`
                    M 0 100
                    ${analyses
                      .map(
                        (a, idx) =>
                          `L ${(idx / (totalAnalyses - 1)) * 100} ${100 - a.overallScore}`
                      )
                      .join(" ")}
                    L 100 100 Z
                  `}
                  fill="url(#chartGradient)"
                />

                <path
                  d={analyses
                    .map(
                      (a, idx) =>
                        `${idx === 0 ? "M" : "L"} ${(idx / (totalAnalyses - 1)) * 100} ${100 - a.overallScore}`
                    )
                    .join(" ")}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xs text-slate-400">Realize mais análises para visualizar o gráfico comparativo.</p>
            </div>
          )}

          {/* Timeline points labels */}
          <div className="flex justify-between px-8 text-[11px] text-slate-500 font-medium z-10 pt-4 border-t border-slate-100 dark:border-slate-800">
            {analyses.map((a) => (
              <span key={a.id} className="max-w-[80px] truncate" title={a.jobTitle}>
                {a.jobTitle}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Keywords coverage and history list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Keywords Breakdown */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Palavras-chave & Competências</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mapeamento de competências encontradas vs lacunas em aberto.
            </p>
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Contempladas em seu perfil ({acquiredList.length})
              </p>
              {acquiredList.length === 0 ? (
                <p className="text-xs text-slate-400 mt-2">Nenhuma palavra-chave acumulada ainda.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {acquiredList.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-block text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/20 font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Pendentes para o último objetivo ({missingList.length})
              </p>
              {missingList.length === 0 ? (
                <p className="text-xs text-slate-400 mt-2">Tudo contemplado para sua última vaga!</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {missingList.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-block text-xs bg-rose-500/10 text-rose-700 dark:text-rose-400 px-2.5 py-1 rounded-md border border-rose-500/20 font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Histórico de Análises</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Relatórios salvos recentemente.
              </p>
            </div>
            <Link href="/history" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              Ver histórico completo
            </Link>
          </div>

          <div className="space-y-3">
            {[...analyses].reverse().slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 transition-colors bg-slate-50/50 dark:bg-slate-800/40"
              >
                <Link href={`/report/${a.id}`} className="min-w-0 flex-1 pr-3">
                  <p className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {a.jobTitle}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {TRACK_LABELS[a.careerTrack as CareerTrack]} · {new Date(a.createdAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                  </p>
                </Link>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/report/${a.id}`}
                    className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 dark:text-white hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <span>{a.overallScore}%</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <DeleteAnalysisButton analysisId={a.id} jobTitle={a.jobTitle} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
