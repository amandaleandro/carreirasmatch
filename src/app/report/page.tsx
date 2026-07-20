import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TRACK_LABELS, CareerTrack } from "@/components/analysis-display";
import { CircularScore } from "@/components/circular-score";
import { DeleteAnalysisButton } from "@/components/delete-analysis-button";

export const dynamic = "force-dynamic";

export default async function GeneralReportDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const analyses = await prisma.analysis.findMany({
    where: { resume: { userId: session.user.id } },
    orderBy: { createdAt: "asc" }, // Ascending order to trace chronological evolution
  });

  if (analyses.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 w-full text-center">
        <h1 className="text-2xl font-bold tracking-tight">Seus relatórios de evolução</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Faça sua primeira análise de vaga para acompanhar sua evolução de aderência aqui.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 rounded-xl bg-blue-600 text-white font-semibold px-6 py-3 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all"
        >
          Fazer minha primeira análise
        </Link>
      </div>
    );
  }

  // Calculate stats
  const totalAnalyses = analyses.length;
  const latestAnalysis = analyses[totalAnalyses - 1];
  const firstAnalysis = analyses[0];

  const overallScores = analyses.map((a) => a.overallScore);
  const technicalScores = analyses.map((a) => a.technicalScore);
  const experienceScores = analyses.map((a) => a.experienceScore);
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
    <main className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full space-y-8">
      <div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
          Evolução
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Relatório de Evolução Profissional</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Acompanhe o crescimento da sua aderência e o preenchimento de lacunas técnicas ao longo das candidaturas.
        </p>
      </div>

      {/* Grid summarizing highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950 shadow-sm shadow-slate-900/5 flex flex-col justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-500">Média de Aderência</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{averageAdherence}%</p>
          </div>
          <span className="text-xs text-neutral-400 mt-4">Cálculo de todas as {totalAnalyses} análises</span>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950 shadow-sm shadow-slate-900/5 flex flex-col justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-500">Média Técnica</p>
            <p className="text-4xl font-bold text-amber-500 mt-2">{averageTechnical}%</p>
          </div>
          <span className="text-xs text-neutral-400 mt-4">Avaliação de competências hard-skills</span>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950 shadow-sm shadow-slate-900/5 flex flex-col justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-500">Otimização ATS</p>
            <p className="text-4xl font-bold text-emerald-500 mt-2">{averageATS}%</p>
          </div>
          <span className="text-xs text-neutral-400 mt-4">Legibilidade por robôs de recrutamento</span>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950 shadow-sm shadow-slate-900/5 flex flex-col justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-500">Evolução do Score</p>
            <p className={`text-4xl font-bold mt-2 ${scoreEvolution >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {scoreEvolution >= 0 ? `+${scoreEvolution}` : scoreEvolution}%
            </p>
          </div>
          <span className="text-xs text-neutral-400 mt-4">Comparativo da primeira à última vaga</span>
        </div>
      </div>

      {/* Evolution Chart (Simulated beautiful SVG chart representing the data points) */}
      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950 shadow-sm shadow-slate-900/5">
        <h3 className="font-bold text-lg mb-2">Linha de Evolução do Score</h3>
        <p className="text-sm text-neutral-500 mb-6">Gráfico cronológico das suas análises de vagas</p>

        <div className="relative h-64 w-full flex flex-col justify-between">
          {/* Chart lines background */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="border-b border-neutral-100 dark:border-neutral-900 w-full h-0 text-right pr-2 text-xs text-neutral-400">100%</div>
            <div className="border-b border-neutral-100 dark:border-neutral-900 w-full h-0 text-right pr-2 text-xs text-neutral-400">75%</div>
            <div className="border-b border-neutral-100 dark:border-neutral-900 w-full h-0 text-right pr-2 text-xs text-neutral-400">50%</div>
            <div className="border-b border-neutral-100 dark:border-neutral-900 w-full h-0 text-right pr-2 text-xs text-neutral-400">25%</div>
            <div className="w-full h-0 text-right pr-2 text-xs text-neutral-400">0%</div>
          </div>

          {/* SVG Line */}
          {analyses.length > 1 ? (
            <div className="absolute inset-0 px-8 py-4">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Path for gradient area */}
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

                {/* Path for line */}
                <path
                  d={analyses
                    .map(
                      (a, idx) =>
                        `${idx === 0 ? "M" : "L"} ${(idx / (totalAnalyses - 1)) * 100} ${100 - a.overallScore}`
                    )
                    .join(" ")}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-neutral-400">Analise mais vagas para renderizar o gráfico de evolução.</p>
            </div>
          )}

          {/* Timeline points names below chart */}
          <div className="flex justify-between px-8 text-[11px] text-neutral-500 font-medium z-10 pt-4 border-t border-neutral-100 dark:border-neutral-900">
            {analyses.map((a, i) => (
              <span key={a.id} className="max-w-[70px] truncate" title={a.jobTitle}>
                {a.jobTitle}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown keyword coverage and history list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Keywords Evolution */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950 shadow-sm shadow-slate-900/5 space-y-4">
          <div>
            <h3 className="font-bold text-lg">Habilidades & Palavras-chave</h3>
            <p className="text-sm text-neutral-500 mt-1">Evolução do seu repositório de conhecimentos.</p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Já contempladas em seu perfil ({acquiredList.length})
              </p>
              {acquiredList.length === 0 ? (
                <p className="text-xs text-neutral-400 mt-2">Nenhuma detectada ainda.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {acquiredList.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-block text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/50"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-red-500">
                Ainda ausentes para sua última vaga ({missingList.length})
              </p>
              {missingList.length === 0 ? (
                <p className="text-xs text-neutral-400 mt-2">Tudo em dia para o último objetivo!</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {missingList.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-block text-xs bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded border border-red-100 dark:border-red-900/50"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chronological list of analyses */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950 shadow-sm shadow-slate-900/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Histórico de Avanço</h3>
              <p className="text-sm text-neutral-500 mt-1">Status de aderência por candidatura realizada.</p>
            </div>
            <Link href="/history" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              Ver tudo
            </Link>
          </div>

          <div className="space-y-3">
            {[...analyses].reverse().slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 dark:border-neutral-900 hover:border-blue-500/50 transition-colors bg-neutral-50/30 dark:bg-neutral-900/10"
              >
                <Link href={`/report/${a.id}`} className="min-w-0 flex-1 pr-4">
                  <p className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 truncate">
                    {a.jobTitle}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {TRACK_LABELS[a.careerTrack as CareerTrack]} · {new Date(a.createdAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                  </p>
                </Link>
                <div className="flex items-center gap-3">
                  <Link href={`/report/${a.id}`} className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                      {a.overallScore}%
                    </span>
                    <span className="text-xs">
                      {a.applicationStatus === "apply_now" ? "🟢" : a.applicationStatus === "adjust_first" ? "🟡" : "🔴"}
                    </span>
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
