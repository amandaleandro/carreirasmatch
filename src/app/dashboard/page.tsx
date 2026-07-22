import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CircularScore } from "@/components/circular-score";
import { TRACK_LABELS, CareerTrack } from "@/components/analysis-display";
import { CAREER_SEGMENT_LABELS, normalizeCareerSegment } from "@/lib/career-segments";
import { toolsForSegment } from "@/lib/tools-catalog";
import { computeJourneyMetrics } from "@/lib/applications";
import { formatBrazilDate, formatBrazilDateTime } from "@/lib/brazil";
import { Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_CONFIG = {
  apply_now: { label: "Aplicar agora", dot: "bg-[#22C55E]", chip: "bg-[#22C55E]/10 text-[#071827] dark:text-emerald-300 border-[#22C55E]/20 dark:border-[#22C55E]/10" },
  adjust_first: { label: "Ajustar antes de aplicar", dot: "bg-[#F59E0B]", chip: "bg-[#F59E0B]/10 text-[#071827] dark:text-amber-300 border-[#F59E0B]/20 dark:border-[#F59E0B]/10" },
  deprioritize: { label: "Não priorizar agora", dot: "bg-[#EF4444]", chip: "bg-[#EF4444]/10 text-[#071827] dark:text-red-300 border-[#EF4444]/20 dark:border-[#EF4444]/10" },
} as const;

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [analyses, user, behavioralResult, topMonthlyScores] = await Promise.all([
    prisma.analysis.findMany({
      where: { resume: { userId: session.user.id } },
      orderBy: { createdAt: "desc" },
      include: { resume: true },
    }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { careerSegment: true } }),
    prisma.softSkillTestResult.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.gameScore.findMany({
      where: { createdAt: { gte: startOfMonth } },
      orderBy: { score: "desc" },
      take: 10,
      select: { userId: true },
    }),
  ]);

  const isTopPlayer = topMonthlyScores.some((s) => s.userId === session.user.id);

  let topVagas: any[] = [];
  if (isTopPlayer) {
    topVagas = await prisma.companyVaga.findMany({
      where: { status: "open", publishedToFeed: true },
      take: 3,
      include: { company: { select: { name: true } } },
    });
  }

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });
  const upcomingDeadlines = await prisma.application.findMany({
    where: { userId: session.user.id, deadline: { gte: new Date() } },
    orderBy: { deadline: "asc" },
    take: 3,
  });
  const upcomingInterviews = await prisma.application.findMany({
    where: { userId: session.user.id, interviewAt: { gte: new Date() } },
    orderBy: { interviewAt: "asc" },
    take: 3,
  });
  const allApplicationsForMetrics = await prisma.application.findMany({
    where: { userId: session.user.id },
    select: { status: true, createdAt: true },
  });
  const journey = computeJourneyMetrics(allApplicationsForMetrics);
  const segment = normalizeCareerSegment(user?.careerSegment);
  const { recommended: recommendedTools } = toolsForSegment(segment);
  const topRecommendedTool = recommendedTools[0];

  const firstName = (session.user.name ?? session.user.email ?? "").split(" ")[0];

  if (analyses.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 w-full text-center font-sans">
        <h1 className="text-3xl font-title font-bold tracking-tight text-[#071827] dark:text-white">
          Bem-vindo{firstName ? `, ${firstName}` : ""}!
        </h1>
        <p className="text-[#64748B] dark:text-neutral-400 mt-2">
          Você ainda não fez nenhum diagnóstico. Envie seu currículo e uma vaga
          para ver sua aderência e seu plano de ação aqui.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 rounded-xl bg-[#2563EB] text-white font-semibold px-6 py-3 hover:bg-[#1D4ED8] hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98] transition-all cursor-pointer"
        >
          Fazer meu primeiro diagnóstico
        </Link>
        <p className="text-sm text-[#64748B] mt-4">
          {segment ? (
            <>Seu momento: {CAREER_SEGMENT_LABELS[segment]}</>
          ) : (
            <>
              <Link href="/settings" className="text-[#2563EB] hover:underline">
                Conte qual é o seu momento
              </Link>{" "}
              para recomendações mais precisas.
            </>
          )}
        </p>
      </div>
    );
  }

  const averageAdherence = Math.round(
    analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length
  );

  const priorityCounts = analyses.reduce(
    (acc, a) => {
      acc[a.applicationStatus as keyof typeof acc] =
        (acc[a.applicationStatus as keyof typeof acc] ?? 0) + 1;
      return acc;
    },
    { apply_now: 0, adjust_first: 0, deprioritize: 0 } as Record<
      "apply_now" | "adjust_first" | "deprioritize",
      number
    >
  );

  const topAnalyses = [...analyses]
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 3);

  const latest = analyses[0];
  const latestResume = latest.resume;
  const weakestAnalysis = [...analyses].sort(
    (a, b) => a.overallScore - b.overallScore
  )[0];
  const fixes: string[] = JSON.parse(weakestAnalysis.fixes || "[]");
  const weakestBridgeRoles: string[] = weakestAnalysis.bridgeRoles
    ? JSON.parse(weakestAnalysis.bridgeRoles)
    : [];
  const nextStep =
    weakestAnalysis.careerTrack === "career_change" && weakestBridgeRoles[0]
      ? `Busque vagas de "${weakestBridgeRoles[0]}", o cargo-ponte mais acessível até seu objetivo.`
      : fixes[0];

  const diagnosisDone = analyses.length > 0;
  const adjustmentsDone = priorityCounts.adjust_first === 0;
  const applicationsInProgress = priorityCounts.apply_now > 0;
  const activeApplications = applications.filter((item) =>
    ["applied", "interview", "technical_test", "offer"].includes(item.status)
  ).length;

  return (
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full space-y-8 font-sans bg-[#F8FAFC] dark:bg-[#071827] text-foreground">
      <div data-tour="dash-overview" className="animate-in fade-in duration-300">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/25">
          Visão geral
        </span>
        <h1 className="text-3xl font-title font-bold tracking-tight text-[#071827] dark:text-white">
          Seu mapa da próxima oportunidade
        </h1>
        <p className="text-[#64748B] dark:text-neutral-400 mt-2 text-sm">
          Clareza sobre seu momento e direção certa para avançar com confiança na sua carreira.
        </p>
      </div>

      {isTopPlayer && (
        <div className="rounded-3xl border border-amber-300 dark:border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent p-6 space-y-4 shadow-sm relative overflow-hidden animate-in fade-in duration-250">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-amber-500 fill-amber-500 shrink-0" />
            <div>
              <h2 className="text-lg font-title font-bold text-[#071827] dark:text-white">
                Você é um dos 10 melhores jogadores do mês! 🏆
              </h2>
              <p className="text-xs text-[#64748B] dark:text-neutral-400">
                Como recompensa por sua dedicação, aqui estão vagas exclusivas recomendadas com prioridade para você:
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mt-2">
            {topVagas.map((vaga) => (
              <Link
                key={vaga.id}
                href={`/vagas/empresa/${vaga.id}`}
                className="rounded-2xl border border-[#E2E8F0] dark:border-amber-800 bg-white dark:bg-neutral-900 p-4 shadow-sm hover:border-[#2563EB] transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                    {vaga.area}
                  </span>
                  <h3 className="mt-2 font-title font-bold text-sm text-[#071827] dark:text-white line-clamp-2 leading-tight">
                    {vaga.title}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">{vaga.company.name}</p>
                </div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-3 inline-block">
                  Ver Vaga Exclusiva →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Grid Principal de Score e Semáforo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Aderência Média */}
        <div className="lg:col-span-2 rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-6 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all duration-300">
          <div>
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Aderência média às vagas</p>
            <p className="text-5xl font-black text-[#2563EB] mt-2">
              {averageAdherence}%
            </p>
            <p className="text-sm text-[#22C55E] dark:text-[#22C55E] mt-2 font-semibold">
              {averageAdherence >= 75
                ? "Boa aderência! Pronto para aplicar."
                : averageAdherence >= 50
                ? "Aderência moderada. Alguns ajustes recomendados."
                : "Aderência baixa. Mapeie novos diferenciais."}
            </p>
          </div>
          <div className="sm:ml-auto">
            <CircularScore value={averageAdherence} size={120} strokeWidth={10} />
          </div>
        </div>

        {/* Semáforo de Prioridade */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all duration-300">
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-4">Semáforo de prioridade</p>
          <div className="space-y-3">
            {(Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[]).map(
              (status) => (
                <div
                  key={status}
                  className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition-all hover:scale-[1.01] ${STATUS_CONFIG[status].chip}`}
                >
                  <span className="flex items-center gap-2 font-semibold text-[#071827] dark:text-neutral-200">
                    <span className={`h-2.5 w-2.5 rounded-full ${STATUS_CONFIG[status].dot}`} />
                    {STATUS_CONFIG[status].label}
                  </span>
                  <span className="font-extrabold text-[#071827] dark:text-white">{priorityCounts[status]}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Grid de Recomendações e Últimas Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Melhores Vagas */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E2E8F0] dark:border-neutral-800">
              <p className="font-title font-bold text-[#071827] dark:text-white">Melhores oportunidades</p>
              <Link href="/history" className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline">
                Ver todas →
              </Link>
            </div>
            <div className="space-y-3">
              {topAnalyses.map((a) => (
                <Link
                  key={a.id}
                  href={`/report/${a.id}`}
                  className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] dark:border-neutral-800 p-3 hover:border-[#2563EB] hover:shadow-sm transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-[#071827] dark:text-white truncate">{a.jobTitle}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {TRACK_LABELS[a.careerTrack as CareerTrack]}
                    </p>
                  </div>
                  <CircularScore value={a.overallScore} size={40} strokeWidth={4.5} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Próximo Passo Recomendado */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <p className="font-title font-bold text-[#071827] dark:text-white mb-3">Próximo passo recomendado</p>
            <p className="text-sm font-semibold text-[#071827] dark:text-white">
              Ajuste para: {TRACK_LABELS[weakestAnalysis.careerTrack as CareerTrack]}
            </p>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              {nextStep ?? "Continue analisando suas vagas para calibrar seu roteiro personalizado."}
            </p>
          </div>
          <div className="mt-5 space-y-2">
            <Link
              href="/"
              className="block text-center rounded-xl bg-[#2563EB] text-white font-semibold py-3 hover:bg-[#1D4ED8] hover:shadow-md hover:shadow-blue-500/10 active:scale-[0.98] transition-all cursor-pointer text-sm"
            >
              Ajustar currículo
            </Link>
            {topRecommendedTool && (
              <Link
                href={topRecommendedTool.href}
                className="block text-center rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] text-[#64748B] hover:text-[#2563EB] font-semibold py-3 transition-colors text-sm"
              >
                {topRecommendedTool.title}
              </Link>
            )}
          </div>
        </div>

        {/* Resumo do Currículo */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <p className="font-title font-bold text-[#071827] dark:text-white mb-3">Resumo do currículo</p>
            <p className="text-sm font-semibold text-[#071827] dark:text-white">
              {latest.atsScore >= 75
                ? "Seu currículo está muito bom! 🚀"
                : "Seu currículo possui pontos de melhoria ⚠️"}
            </p>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              Última análise com base em &quot;{latestResume.fileName}&quot;, feita em{" "}
              {formatBrazilDate(latest.createdAt)}.
            </p>
          </div>
          <Link
            href={`/report/${latest.id}`}
            className="mt-5 block text-center rounded-xl border border-[#2563EB] hover:bg-[#2563EB]/5 text-[#2563EB] font-semibold py-3 transition-all text-sm"
          >
            Ver análise completa
          </Link>
        </div>
      </div>

      {/* Perfil Comportamental */}
      {behavioralResult && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] dark:border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center shrink-0 text-lg">
                🧠
              </span>
              <div>
                <h3 className="font-title font-bold text-[#071827] dark:text-white">Seu perfil comportamental</h3>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Mapeamento de soft skills realizado</p>
              </div>
            </div>
            <Link
              href="/tools/behavioral-test"
              className="text-xs text-[#2563EB] hover:text-[#1D4ED8] hover:underline font-bold transition-colors cursor-pointer"
            >
              Refazer teste comportamental →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-5 space-y-2">
              <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider">Perfil Dominante</p>
              <p className="font-bold text-base text-[#2563EB]">{behavioralResult.personalityLabel}</p>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {behavioralResult.summary}
              </p>
            </div>
            <div className="md:col-span-7">
              <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider mb-3">Nível de Competências</p>
              {(() => {
                let skills: Record<string, number> = {};
                try {
                  skills = JSON.parse(behavioralResult.skillScores);
                } catch(e){}
                const labels: Record<string, string> = {
                  comunicacao: "Comunicação",
                  trabalho_em_equipe: "Trabalho em equipe",
                  proatividade: "Proatividade",
                  adaptabilidade: "Adaptabilidade",
                  resolucao_problemas: "Resolução de problemas",
                };
                return (
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    {Object.entries(skills).map(([dim, score]) => (
                      <div key={dim} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-[#071827] dark:text-neutral-300">{labels[dim] || dim}</span>
                          <span className="font-extrabold text-[#2563EB]">{score}/100</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#F8FAFC] dark:bg-neutral-800 overflow-hidden border border-[#E2E8F0] dark:border-neutral-700">
                          <div
                            className="h-full rounded-full bg-[#2563EB]"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Prazos Próximos & Entrevistas */}
      {(upcomingDeadlines.length > 0 || upcomingInterviews.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingDeadlines.length > 0 && (
            <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
              <p className="font-title font-bold text-[#071827] dark:text-white mb-4">Prazos próximos</p>
              <div className="space-y-2">
                {upcomingDeadlines.map((item) => {
                  const days = Math.ceil((item.deadline!.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <Link
                      href="/applications"
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] dark:border-neutral-800 p-3 hover:border-[#2563EB] hover:shadow-sm transition-all text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#071827] dark:text-white truncate">{item.jobTitle}</p>
                        {item.company && <p className="text-xs text-[#64748B]">{item.company}</p>}
                      </div>
                      <span
                        className={`text-xs font-semibold rounded-full px-2.5 py-1 shrink-0 ${
                          days <= 3
                            ? "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/20"
                            : days <= 7
                            ? "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20"
                            : "bg-[#F8FAFC] text-[#64748B] dark:bg-neutral-800 dark:text-neutral-300"
                        }`}
                      >
                        {days <= 0 ? "Encerra hoje" : `Encerra em ${days}d`}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {upcomingInterviews.length > 0 && (
            <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
              <p className="font-title font-bold text-[#071827] dark:text-white mb-4">Próximas entrevistas</p>
              <div className="space-y-2">
                {upcomingInterviews.map((item) => (
                  <Link
                    href={`/interviews/${item.id}`}
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] dark:border-neutral-800 p-3 hover:border-[#2563EB] hover:shadow-sm transition-all text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#071827] dark:text-white truncate">{item.jobTitle}</p>
                      {item.company && <p className="text-xs text-[#64748B]">{item.company}</p>}
                    </div>
                    <span className="text-xs font-semibold rounded-full px-2.5 py-1 shrink-0 bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
                      {formatBrazilDateTime(item.interviewAt!, { year: undefined })}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Jornada de Busca */}
      <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <p className="font-title font-bold text-[#071827] dark:text-white mb-4">Sua jornada de busca</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-3xl font-black text-[#2563EB]">
              {journey.daysSearching !== null ? journey.daysSearching : "Sem dados"}
            </p>
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mt-1">Dias em busca</p>
          </div>
          <div>
            <p className="text-3xl font-black text-[#2563EB]">
              {journey.responseRate !== null ? `${journey.responseRate}%` : "Sem dados"}
            </p>
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mt-1">Taxa de resposta</p>
          </div>
          <div>
            <p className="text-3xl font-black text-[#2563EB]">
              {journey.rejectionRate !== null ? `${journey.rejectionRate}%` : "Sem dados"}
            </p>
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mt-1">Taxa de rejeição</p>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-[#E2E8F0] dark:border-neutral-800 pb-3">
          <div>
            <p className="font-title font-bold text-[#071827] dark:text-white">Pipeline de candidaturas</p>
            <p className="text-xs text-[#64748B] mt-1">
              {activeApplications} processo{activeApplications === 1 ? "" : "s"} em andamento.
            </p>
          </div>
          <Link
            href="/applications"
            className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
          >
            Abrir kanban →
          </Link>
        </div>
        {applications.length === 0 ? (
          <p className="text-xs text-[#64748B]">
            Salve vagas do feed ou adicione candidaturas manualmente para acompanhar seu avanço.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {applications.map((item) => (
              <Link
                href="/applications"
                key={item.id}
                className="rounded-xl border border-[#E2E8F0] dark:border-neutral-800 p-3 bg-[#F8FAFC] dark:bg-neutral-800 hover:border-[#2563EB] hover:shadow-sm transition-all"
              >
                <p className="text-sm font-semibold text-[#071827] dark:text-white truncate">{item.jobTitle}</p>
                <p className="text-xs text-[#64748B] mt-1 truncate">
                  {item.company || "Sem empresa"}
                </p>
                {item.fitScore !== null && (
                  <p className="text-xs text-[#22C55E] mt-2 font-bold">
                    {item.fitScore}% de match
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Plano de Evolução */}
      <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <p className="font-title font-bold text-[#071827] dark:text-white mb-6">Plano de evolução</p>
        {(() => {
          const evolutionSteps = [
            { n: 1, label: "Diagnóstico", done: diagnosisDone, status: "Concluído" },
            {
              n: 2,
              label: "Ajustes estratégicos",
              done: adjustmentsDone,
              status: adjustmentsDone ? "Concluído" : "Em andamento",
            },
            {
              n: 3,
              label: "Aplicações qualificadas",
              done: false,
              status: applicationsInProgress ? "Em andamento" : "Próximo passo",
            },
            { n: 4, label: "Entrevistas e ofertas", done: false, status: "Seu objetivo" },
          ];
          return (
            <>
              {/* Mobile Stepper */}
              <div className="grid grid-cols-2 gap-4 sm:hidden">
                {evolutionSteps.map((step) => (
                  <div key={step.n} className="flex flex-col items-center text-center gap-2">
                    <span
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        step.done
                          ? "bg-[#22C55E] text-white"
                          : step.status === "Em andamento"
                          ? "bg-[#2563EB] text-white animate-pulse"
                          : "bg-[#F8FAFC] dark:bg-neutral-800 text-[#64748B] border border-[#E2E8F0] dark:border-neutral-700"
                      }`}
                    >
                      {step.done ? "✓" : step.n}
                    </span>
                    <p className="text-sm font-semibold leading-tight text-[#071827] dark:text-slate-200">{step.label}</p>
                    <p
                      className={`text-xs font-bold ${
                        step.done
                          ? "text-[#22C55E]"
                          : step.status === "Em andamento"
                          ? "text-[#2563EB]"
                          : "text-[#64748B]"
                      }`}
                    >
                      {step.status}
                    </p>
                  </div>
                ))}
              </div>

              {/* Desktop Stepper */}
              <div className="hidden sm:flex items-center justify-between gap-2 overflow-x-auto pb-2">
                {evolutionSteps.map((step, i, arr) => (
                  <div key={step.n} className="flex items-center flex-1 last:flex-none min-w-[84px]">
                    <div className="flex flex-col items-center text-center">
                      <span
                        className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          step.done
                            ? "bg-[#22C55E] text-white"
                            : step.status === "Em andamento"
                            ? "bg-[#2563EB] text-white animate-pulse"
                            : "bg-[#F8FAFC] dark:bg-neutral-800 text-[#64748B] border border-[#E2E8F0] dark:border-neutral-700"
                        }`}
                      >
                        {step.done ? "✓" : step.n}
                      </span>
                      <p className="text-sm font-semibold mt-2 whitespace-nowrap text-[#071827] dark:text-slate-200">{step.label}</p>
                      <p
                        className={`text-xs mt-0.5 font-bold whitespace-nowrap ${
                          step.done
                            ? "text-[#22C55E]"
                            : step.status === "Em andamento"
                            ? "text-[#2563EB]"
                            : "text-[#64748B]"
                        }`}
                      >
                        {step.status}
                      </p>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="h-0.5 flex-1 mx-2 min-w-[16px] bg-[#E2E8F0] dark:bg-neutral-800" />
                    )}
                  </div>
                ))}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
