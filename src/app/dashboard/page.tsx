import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CircularScore } from "@/components/circular-score";
import { TRACK_LABELS, CareerTrack } from "@/components/analysis-display";
import { normalizeCareerSegment } from "@/lib/career-segments";
import { findObjective, OBJECTIVE_DEADLINE_OPTIONS } from "@/lib/onboarding-objectives";
import { toolsForSegment } from "@/lib/tools-catalog";
import { STUDY_ACTIVITY_TOOLS, type StudyActivityTool } from "@/lib/study-activity";
import { matchAreaSlug } from "@/lib/vocation-areas";
import { computeJourneyMetrics, getWeekStart } from "@/lib/applications";
import { formatBrazilDate, formatBrazilDateTime, getBrazilGreeting } from "@/lib/brazil";
import { hasActiveSubscriptionAccess } from "@/lib/entitlements";
import { Trophy, ArrowRight, Sparkles, Target, CheckCircle2 } from "lucide-react";
import { CareerScoreEvolutionChart } from "@/components/career-score-evolution-chart";
import { DailyMotivationCard } from "@/components/daily-motivation-card";
import { updateEmploymentStatusAction } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_CONFIG = {
  apply_now: { label: "Aplicar agora", dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  adjust_first: { label: "Ajustar antes de aplicar", dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  deprioritize: { label: "Não priorizar agora", dot: "bg-rose-500", chip: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800" },
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
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        careerSegment: true,
        professionalArea: true,
        currentProfessionalArea: true,
        targetProfessionalArea: true,
        studyCourse: true,
        name: true,
        employmentStatus: true,
        objective: true,
        objectiveDeadline: true,
      },
    }),
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

  const isTopPlayer =
    topMonthlyScores.some((s) => s.userId === session.user.id) &&
    (await hasActiveSubscriptionAccess(session.user.id));

  const topVagas = isTopPlayer
    ? await prisma.companyVaga.findMany({
        where: { status: "open", publishedToFeed: true },
        take: 3,
        include: { company: { select: { name: true } } },
      })
    : [];

  const segment = normalizeCareerSegment(user?.careerSegment);
  const isStudySegment = segment === "student" || segment === "concurseiro" || segment === "oab";
  const weekStart = getWeekStart();

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });
  const upcomingDeadlines = await prisma.application.findMany({
    where: { userId: session.user.id, deadline: { gte: now } },
    orderBy: { deadline: "asc" },
    take: 3,
  });
  const upcomingInterviews = await prisma.application.findMany({
    where: { userId: session.user.id, interviewAt: { gte: now } },
    orderBy: { interviewAt: "asc" },
    take: 3,
  });

  const [studyScheduleItems, studyActivitiesThisWeek] = isStudySegment
    ? await Promise.all([
        prisma.studyScheduleItem.findMany({
          where: { userId: session.user.id, weekStart },
          orderBy: { createdAt: "asc" },
        }),
        prisma.studyActivityLog.findMany({
          where: { userId: session.user.id, createdAt: { gte: weekStart } },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ])
    : [[], []];

  const weeklyPlan = isStudySegment
    ? []
    : await (async () => {
        const [weeklyGoal, resumeTweaksThisWeek, appliedThisWeekCount, interviewsActiveCount] = await Promise.all([
          prisma.weeklyGoal.findUnique({
            where: { userId_weekStart: { userId: session.user.id, weekStart } },
          }),
          prisma.analysis.count({
            where: { resume: { userId: session.user.id }, createdAt: { gte: weekStart } },
          }),
          prisma.application.count({
            where: { userId: session.user.id, appliedAt: { gte: weekStart } },
          }),
          prisma.application.count({
            where: { userId: session.user.id, status: { in: ["interview", "technical_test", "offer"] } },
          }),
        ]);
        const currentWeeklyGoal = weeklyGoal ?? { targetApplications: 8, targetResumeTweaks: 2, targetInterviews: 3 };
        return [
          { label: "Candidaturas na semana", done: appliedThisWeekCount, target: currentWeeklyGoal.targetApplications },
          { label: "Currículos ajustados", done: resumeTweaksThisWeek, target: currentWeeklyGoal.targetResumeTweaks },
          { label: "Entrevistas em andamento", done: interviewsActiveCount, target: currentWeeklyGoal.targetInterviews },
        ];
      })();

  const allApplicationsForMetrics = await prisma.application.findMany({
    where: { userId: session.user.id },
    select: { status: true, createdAt: true },
  });
  const journey = computeJourneyMetrics(allApplicationsForMetrics);
  const currentObjective = findObjective(segment, user?.objective ?? "");
  const deadlineLabel = OBJECTIVE_DEADLINE_OPTIONS.find((o) => o.value === user?.objectiveDeadline)?.label ?? null;
  const userAreaSlug = matchAreaSlug(user?.targetProfessionalArea || user?.professionalArea || user?.studyCourse);
  const motivationProfile = {
    careerSegment: user?.careerSegment,
    area: user?.targetProfessionalArea || user?.professionalArea,
    currentArea: user?.currentProfessionalArea,
    studyCourse: user?.studyCourse,
  };
  const { recommended: recommendedTools } = toolsForSegment(segment, userAreaSlug);
  const topRecommendedTool = recommendedTools[0];

  const greeting = getBrazilGreeting(session.user.name ?? user?.name ?? undefined);

  const weeklyPlanSection = isStudySegment ? (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-bold text-slate-900 dark:text-white text-base">Plano de estudos da semana</p>
        <Link href="/ensino-medio/cronograma" className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
          Editar cronograma →
        </Link>
      </div>
      {studyScheduleItems.length > 0 ? (
        <ul className="space-y-2">
          {studyScheduleItems.map((item) => (
            <li key={item.id} className="flex items-center gap-3 text-sm">
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${item.done ? "border-blue-600 bg-blue-600" : "border-slate-300 dark:border-slate-700"}`}>
                {item.done && <CheckCircle2 className="h-3 w-3 text-white" />}
              </span>
              <span className={item.done ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200"}>
                {item.task}{item.focus ? ` — ${item.focus}` : ""}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Você ainda não montou seu cronograma desta semana.
        </p>
      )}

      <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Atividades de estudo nesta semana ({studyActivitiesThisWeek.length})
        </p>
        {studyActivitiesThisWeek.length > 0 ? (
          <ul className="space-y-1.5">
            {studyActivitiesThisWeek.map((activity) => (
              <li key={activity.id} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>{STUDY_ACTIVITY_TOOLS[activity.tool as StudyActivityTool] ?? activity.tool}</span>
                {typeof activity.score === "number" && (
                  <span className="font-semibold text-slate-900 dark:text-white">{activity.score}/1000</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Nenhum simulado, redação ou flashcard feito ainda esta semana.
          </p>
        )}
      </div>
    </div>
  ) : (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-bold text-slate-900 dark:text-white text-base">Plano da semana</p>
        <Link href="/applications" className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
          Ajustar metas →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {weeklyPlan.map((item) => {
          const pct = item.target > 0 ? Math.min(100, Math.round((item.done / item.target) * 100)) : item.done > 0 ? 100 : 0;
          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{item.done}/{item.target}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Prioriza os atalhos do objetivo específico escolhido no onboarding; completa com
  // os atalhos genéricos do segmento (evitando repetir a mesma rota nas duas listas).
  const objectiveShortcuts = currentObjective?.shortcuts ?? [];
  const objectiveShortcutHrefs = new Set(objectiveShortcuts.map((s) => s.href));
  const fallbackShortcuts = recommendedTools
    .filter((tool) => !objectiveShortcutHrefs.has(tool.href))
    .map((tool) => ({ title: tool.title, description: tool.description, href: tool.href }));
  const combinedShortcuts = [...objectiveShortcuts, ...fallbackShortcuts].slice(0, 4);

  const shortcutsSection = combinedShortcuts.length > 0 && (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-bold text-slate-900 dark:text-white text-base">Atalhos para o seu momento</p>
        <Link href="/tools" className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
          Ver todas →
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {combinedShortcuts.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 p-4 hover:border-blue-300 dark:hover:border-blue-800 transition-all"
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">{tool.title}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );

  if (analyses.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16 w-full text-center space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          {greeting}
        </h1>
        {currentObjective ? (
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Seu objetivo é <span className="font-semibold text-slate-800 dark:text-slate-200">{currentObjective.label.toLowerCase()}</span>.
            Seu primeiro passo recomendado é {currentObjective.cta.label.toLowerCase()}.
          </p>
        ) : (
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Você ainda não fez nenhum diagnóstico. Envie seu currículo e uma vaga
            para ver sua aderência e seu plano de ação aqui.
          </p>
        )}

        <div className="text-left">
          <DailyMotivationCard
            initialStatus={user?.employmentStatus}
            profile={motivationProfile}
            onStatusChange={async (newStatus) => {
              "use server";
              await updateEmploymentStatusAction(newStatus);
            }}
          />
        </div>

        <Link
          href={currentObjective?.cta.href ?? "/analise"}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-6 py-3.5 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
        >
          <span>{currentObjective ? currentObjective.cta.label : "Fazer meu primeiro diagnóstico"}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <div className="text-left space-y-6">
          {weeklyPlanSection}
          {shortcutsSection}
        </div>
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

  const scoreDataPoints = analyses.map((a) => ({
    id: a.id,
    jobTitle: a.jobTitle,
    overallScore: a.overallScore,
    atsScore: a.atsScore,
    dateLabel: formatBrazilDate(a.createdAt).slice(0, 5),
  })).reverse();

  return (
    <div className="px-4 sm:px-6 md:px-8 py-8 md:py-12 max-w-7xl mx-auto w-full space-y-8">
      {/* Gráfico de Evolução */}
      <CareerScoreEvolutionChart dataPoints={scoreDataPoints} />

      <div data-tour="dash-overview" className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Minha Jornada</span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {greeting}
        </h1>
        {currentObjective ? (
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Objetivo atual: <span className="font-semibold text-slate-800 dark:text-slate-200">{currentObjective.label}</span>
            {deadlineLabel && <> · {deadlineLabel}</>}
            {" · "}
            <Link href="/onboarding" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">Editar objetivo</Link>
          </p>
        ) : (
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Seu mapa estratégico para a próxima candidatura.{" "}
            <Link href="/onboarding" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">Definir meu objetivo</Link>
          </p>
        )}
      </div>

      <section aria-labelledby="prioridade-heading" className="rounded-2xl border border-blue-200/80 bg-blue-50/60 p-5 dark:border-blue-900/60 dark:bg-blue-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Seu próximo passo</p>
            <h2 id="prioridade-heading" className="mt-1 text-base font-bold text-slate-900 dark:text-white">
              {currentObjective ? currentObjective.cta.label : "Escolha uma próxima ação"}
            </h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {currentObjective
                ? `Recomendado para seu objetivo: "${currentObjective.label}".`
                : "Seu histórico está salvo. Você pode revisar o último match ou encontrar novas oportunidades."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {currentObjective ? (
              <Link href={currentObjective.cta.href} className="rounded-xl bg-blue-600 px-4 py-2.5 text-center text-xs font-semibold text-white transition-colors hover:bg-blue-700">{currentObjective.cta.label}</Link>
            ) : (
              <Link href={`/report/${latest.id}`} className="rounded-xl bg-slate-900 px-4 py-2.5 text-center text-xs font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">Revisar último match</Link>
            )}
            <Link href="/feed" className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-center text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50 dark:border-blue-900 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-blue-950/40">Ver vagas recomendadas</Link>
          </div>
        </div>
      </section>

      {/* Card da Dose Diária */}
      <DailyMotivationCard
        initialStatus={user?.employmentStatus}
        profile={motivationProfile}
        onStatusChange={async (newStatus) => {
          "use server";
          await updateEmploymentStatusAction(newStatus);
        }}
      />

      {isTopPlayer && (
        <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Você está entre os 10 melhores do mês
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Vagas exclusivas recomendadas com prioridade para você:
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mt-2">
            {topVagas.map((vaga) => (
              <Link
                key={vaga.id}
                href={`/vagas/empresa/${vaga.id}`}
                className="group rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-white dark:bg-slate-900 p-4 hover:border-amber-400 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {vaga.area}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                      Prioritária
                    </span>
                  </div>
                  <h3 className="mt-2.5 font-bold text-sm text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors line-clamp-2 leading-tight">
                    {vaga.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{vaga.company.name}</p>
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-4 inline-flex items-center gap-1">
                  Ver vaga exclusiva →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Grid de Score e Semáforo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Aderência Média às Vagas</p>
            <p className="text-4xl font-bold text-slate-900 dark:text-white mt-2">
              {averageAdherence}%
            </p>
            <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
              {averageAdherence >= 75
                ? "Boa aderência, pronto para aplicar."
                : averageAdherence >= 50
                ? "Aderência moderada, alguns ajustes recomendados."
                : "Aderência baixa, mapeie novos diferenciais."}
            </p>
          </div>
          <div className="sm:ml-auto">
            <CircularScore value={averageAdherence} size={110} strokeWidth={9} />
          </div>
        </div>

        {/* Semáforo */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Semáforo de Prioridade</p>
          <div className="space-y-2">
            {(Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[]).map(
              (status) => (
                <div
                  key={status}
                  className="flex items-center justify-between py-2 text-sm border-b border-slate-100 dark:border-slate-800/80 last:border-0"
                >
                  <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                    <span className={`h-2 w-2 rounded-full ${STATUS_CONFIG[status].dot}`} />
                    {STATUS_CONFIG[status].label}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{priorityCounts[status]}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Grid de Recomendações e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Melhores Vagas */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <p className="font-bold text-slate-900 dark:text-white text-base">Melhores Oportunidades</p>
              <Link href="/history" className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                Ver todas →
              </Link>
            </div>
            <div className="space-y-3 mt-4">
              {topAnalyses.map((a) => (
                <Link
                  key={a.id}
                  href={`/report/${a.id}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 p-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{a.jobTitle}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {TRACK_LABELS[a.careerTrack as CareerTrack]}
                    </p>
                  </div>
                  <CircularScore value={a.overallScore} size={38} strokeWidth={4} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Próximo Passo */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-base mb-2">Próximo Passo Recomendado</p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ajuste para: {TRACK_LABELS[weakestAnalysis.careerTrack as CareerTrack]}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              {nextStep ?? "Continue analisando suas vagas para calibrar seu roteiro personalizado."}
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <Link
              href="/"
              className="block text-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold py-2.5 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm text-xs sm:text-sm"
            >
              Ajustar Currículo
            </Link>
            {topRecommendedTool && (
              <Link
                href={topRecommendedTool.href}
                className="block text-center rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold py-2.5 transition-colors text-xs sm:text-sm"
              >
                {topRecommendedTool.title}
              </Link>
            )}
          </div>
        </div>

        {/* Resumo do Currículo */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-base mb-2">Resumo do Currículo</p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {latest.atsScore >= 75
                ? "Seu currículo atende os critérios ATS"
                : "Seu currículo possui pontos de melhoria"}
            </p>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Baseado em &quot;{latestResume.fileName}&quot;, analisado em{" "}
              {formatBrazilDate(latest.createdAt)}.
            </p>
          </div>
          <Link
            href={`/report/${latest.id}`}
            className="block text-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-semibold py-2.5 transition-colors text-xs sm:text-sm"
          >
            Ver Análise Completa
          </Link>
        </div>
      </div>

      {/* Perfil Comportamental */}
      {behavioralResult && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Perfil Comportamental</h3>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Mapeamento de Soft Skills</p>
            </div>
            <Link
              href="/tools/behavioral-test"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Refazer Teste →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-5 space-y-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Perfil Dominante</p>
              <p className="font-bold text-base text-slate-900 dark:text-white">{behavioralResult.personalityLabel}</p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {behavioralResult.summary}
              </p>
            </div>
            <div className="md:col-span-7">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Competências</p>
              {(() => {
                let skills: Record<string, number> = {};
                try {
                  skills = JSON.parse(behavioralResult.skillScores);
                } catch {}
                const labels: Record<string, string> = {
                  comunicacao: "Comunicação",
                  trabalho_em_equipe: "Trabalho em equipe",
                  proatividade: "Proatividade",
                  adaptabilidade: "Adaptabilidade",
                  resolucao_problemas: "Resolução de problemas",
                };
                return (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(skills).map(([dim, score]) => (
                      <div key={dim} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                          <span>{labels[dim] || dim}</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{score}/100</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-slate-900 dark:bg-white"
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

      {/* Plano da Semana */}
      {weeklyPlanSection}

      {/* Atalhos para o seu momento */}
      {shortcutsSection}

      {/* Jornada de Busca */}
      {!isStudySegment && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <p className="font-bold text-slate-900 dark:text-white text-base">Jornada de Busca</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {journey.daysSearching !== null ? journey.daysSearching : "-"}
              </p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">Dias em busca</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {journey.responseRate !== null ? `${journey.responseRate}%` : "-"}
              </p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">Taxa de resposta</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {journey.rejectionRate !== null ? `${journey.rejectionRate}%` : "-"}
              </p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">Taxa de rejeição</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
