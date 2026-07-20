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
  apply_now: { label: "Aplicar agora", dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900" },
  adjust_first: { label: "Ajustar antes de aplicar", dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900" },
  deprioritize: { label: "Não priorizar agora", dot: "bg-red-500", chip: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900" },
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
      <div className="max-w-3xl mx-auto px-4 py-16 w-full text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Bem-vindo{firstName ? `, ${firstName}` : ""}!
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Você ainda não fez nenhum diagnóstico. Envie seu currículo e uma vaga
          para ver sua aderência e seu plano de ação aqui.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 rounded-xl bg-blue-600 text-white font-semibold px-6 py-3 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all"
        >
          Fazer meu primeiro diagnóstico
        </Link>
        <p className="text-sm text-neutral-500 mt-4">
          {segment ? (
            <>Seu momento: {CAREER_SEGMENT_LABELS[segment]}</>
          ) : (
            <>
              <Link href="/settings" className="text-blue-600 dark:text-blue-400 hover:underline">
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
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full space-y-8">
      <div data-tour="dash-overview">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
          Visão geral
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Seu mapa da próxima oportunidade
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Clareza sobre seu momento e direção certa para avançar com confiança
          na sua carreira.
        </p>
      </div>

      {isTopPlayer && (
        <div className="rounded-3xl border border-amber-300 dark:border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent p-6 space-y-4 shadow-sm relative overflow-hidden animate-in fade-in duration-250">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-amber-500 fill-amber-500 shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Você é um dos 10 melhores jogadores do mês! 🏆
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Como recompensa por sua dedicação, aqui estão vagas exclusivas recomendadas com prioridade para você:
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mt-2">
            {topVagas.map((vaga) => (
              <Link
                key={vaga.id}
                href={`/vagas/empresa/${vaga.id}`}
                className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-neutral-900 p-4 shadow-sm hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                    {vaga.area}
                  </span>
                  <h3 className="mt-2 font-bold text-sm text-neutral-900 dark:text-white line-clamp-2 leading-tight">
                    {vaga.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">{vaga.company.name}</p>
                </div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-3 inline-block">
                  Ver Vaga Exclusiva →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-premium p-6 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left">
          <div>
            <p className="text-sm text-neutral-500">Aderência média às vagas</p>
            <p className="text-5xl font-bold text-blue-600 mt-2">
              {averageAdherence}%
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
              {averageAdherence >= 75
                ? "Boa aderência!"
                : averageAdherence >= 50
                ? "Aderência moderada"
                : "Aderência baixa"}
            </p>
          </div>
          <div className="sm:ml-auto">
            <CircularScore value={averageAdherence} size={120} strokeWidth={10} />
          </div>
        </div>

        <div className="card-premium p-6">
          <p className="text-sm font-semibold mb-4">Semáforo de prioridade</p>
          <div className="space-y-3">
            {(Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[]).map(
              (status) => (
                <div
                  key={status}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${STATUS_CONFIG[status].chip}`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${STATUS_CONFIG[status].dot}`} />
                    {STATUS_CONFIG[status].label}
                  </span>
                  <span className="font-semibold">{priorityCounts[status]}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold">Melhores vagas para você agora</p>
            <Link href="/history" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {topAnalyses.map((a) => (
              <Link
                key={a.id}
                href={`/report/${a.id}`}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-sm transition-all"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{a.jobTitle}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {TRACK_LABELS[a.careerTrack as CareerTrack]}
                  </p>
                </div>
                <CircularScore value={a.overallScore} size={44} strokeWidth={5} />
              </Link>
            ))}
          </div>
        </div>

        <div className="card-premium p-6 flex flex-col">
          <p className="font-semibold mb-4">Próximo passo recomendado</p>
          <p className="text-sm font-medium">
            Ajuste seu currículo para vagas de{" "}
            {TRACK_LABELS[weakestAnalysis.careerTrack as CareerTrack]}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 flex-1">
            {nextStep ?? "Continue enviando vagas para receber recomendações personalizadas."}
          </p>
          <Link
            href="/"
            className="mt-4 block text-center rounded-xl bg-blue-600 text-white font-semibold py-3 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all"
          >
            Ajustar currículo
          </Link>
          {topRecommendedTool && (
            <Link
              href={topRecommendedTool.href}
              className="mt-2 block text-center rounded-xl border border-blue-600 text-blue-600 dark:text-blue-400 font-semibold py-3 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            >
              {topRecommendedTool.title}
            </Link>
          )}
        </div>

        <div className="card-premium p-6 flex flex-col">
          <p className="font-semibold mb-4">Resumo do currículo</p>
          <p className="text-sm font-medium">
            {latest.atsScore >= 75
              ? "Seu currículo está muito bom!"
              : "Seu currículo pode melhorar"}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 flex-1">
            Última análise com base em &quot;{latestResume.fileName}&quot;, em{" "}
            {formatBrazilDate(latest.createdAt)}.
          </p>
          <Link
            href={`/report/${latest.id}`}
            className="mt-4 block text-center rounded-xl border border-blue-600 text-blue-600 dark:text-blue-400 font-semibold py-3 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
          >
            Ver análise completa
          </Link>
        </div>
      </div>

      {behavioralResult && (
        <div className="card-premium p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 dark:border-neutral-900 pb-4">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 text-lg">
                🧠
              </span>
              <div>
                <h3 className="font-semibold text-lg">Seu perfil comportamental</h3>
                <p className="text-xs text-neutral-500">Última avaliação de soft skills realizada</p>
              </div>
            </div>
            <Link
              href="/tools/behavioral-test"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              Refazer teste comportamental →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-5 space-y-2">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider font-medium">Perfil Dominante</p>
              <p className="font-bold text-base text-blue-600 dark:text-blue-400">{behavioralResult.personalityLabel}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {behavioralResult.summary}
              </p>
            </div>
            <div className="md:col-span-7">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider font-medium mb-3">Mapeamento de Soft Skills</p>
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
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-neutral-600 dark:text-neutral-300">{labels[dim] || dim}</span>
                          <span className="font-semibold">{score}/100</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-600"
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

      {upcomingDeadlines.length > 0 && (
        <div className="card-premium p-6">
          <p className="font-semibold mb-4">Prazos próximos</p>
          <div className="space-y-2">
            {upcomingDeadlines.map((item) => {
              // Dynamic deadline countdown intentionally uses the current clock on each request.
              // eslint-disable-next-line react-hooks/purity
              const days = Math.ceil((item.deadline!.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <Link
                  href="/applications"
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-sm transition-all text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.jobTitle}</p>
                    {item.company && <p className="text-xs text-neutral-500">{item.company}</p>}
                  </div>
                  <span
                    className={`text-xs font-semibold rounded-full px-2.5 py-1 shrink-0 ${
                      days <= 3
                        ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                        : days <= 7
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                        : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                    }`}
                  >
                    {days <= 0 ? "Encerra hoje" : `Encerra em ${days}d`}
                  </span>
                </Link>
              );
            })}
          </div>
          <p className="text-xs text-neutral-500 mt-3">
            Confira sempre no site da empresa, não enviamos lembrete automático por e-mail.
          </p>
        </div>
      )}

      {upcomingInterviews.length > 0 && (
        <div className="card-premium p-6">
          <p className="font-semibold mb-4">Próximas entrevistas</p>
          <div className="space-y-2">
            {upcomingInterviews.map((item) => (
              <Link
                href={`/interviews/${item.id}`}
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 hover:border-violet-300 dark:hover:border-violet-800 hover:shadow-sm transition-all text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{item.jobTitle}</p>
                  {item.company && <p className="text-xs text-neutral-500">{item.company}</p>}
                </div>
                <span className="text-xs font-semibold rounded-full px-2.5 py-1 shrink-0 bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                  {formatBrazilDateTime(item.interviewAt!, { year: undefined })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="card-premium p-6">
        <p className="font-semibold mb-4">Sua jornada de busca</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-3xl font-bold text-blue-600">
              {journey.daysSearching !== null ? journey.daysSearching : ", "}
            </p>
            <p className="text-xs text-neutral-500 mt-1">Dias em busca</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600">
              {journey.responseRate !== null ? `${journey.responseRate}%` : ", "}
            </p>
            <p className="text-xs text-neutral-500 mt-1">Taxa de resposta</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600">
              {journey.rejectionRate !== null ? `${journey.rejectionRate}%` : ", "}
            </p>
            <p className="text-xs text-neutral-500 mt-1">Taxa de rejeição</p>
          </div>
        </div>
      </div>

      <div className="card-premium p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <p className="font-semibold">Pipeline de candidaturas</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {activeApplications} processo{activeApplications === 1 ? "" : "s"} em andamento.
            </p>
          </div>
          <Link
            href="/applications"
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Abrir kanban →
          </Link>
        </div>
        {applications.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Salve vagas do feed ou adicione candidaturas manualmente para acompanhar seu avanço.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {applications.map((item) => (
              <Link
                href="/applications"
                key={item.id}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-sm transition-all"
              >
                <p className="text-sm font-medium truncate">{item.jobTitle}</p>
                <p className="text-xs text-neutral-500 mt-1 truncate">
                  {item.company || "Sem empresa informada"}
                </p>
                {item.fitScore !== null && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">
                    {item.fitScore}% de aderência
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="card-premium p-6">
        <p className="font-semibold mb-6">Plano de evolução</p>
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {[
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
          ].map((step, i, arr) => (
            <div key={step.n} className="flex items-center flex-1 last:flex-none min-w-[84px]">
              <div className="flex flex-col items-center text-center">
                <span
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                    step.done
                      ? "bg-emerald-500 text-white"
                      : step.status === "Em andamento"
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {step.done ? "✓" : step.n}
                </span>
                <p className="text-sm font-medium mt-2 whitespace-nowrap">{step.label}</p>
                <p
                  className={`text-xs mt-0.5 whitespace-nowrap ${
                    step.done
                      ? "text-emerald-600 dark:text-emerald-400"
                      : step.status === "Em andamento"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-neutral-500"
                  }`}
                >
                  {step.status}
                </p>
              </div>
              {i < arr.length - 1 && (
                <div className="h-0.5 flex-1 mx-2 min-w-[16px] bg-neutral-200 dark:bg-neutral-800" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
