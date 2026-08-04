import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  APPLICATION_STATUS_CONFIG,
  APPLICATION_STATUSES,
  computeJourneyMetrics,
  getWeekStart,
} from "@/lib/applications";
import {
  createApplication,
  updateWeeklyGoal,
} from "./actions";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";
import { ApplicationsKanban } from "@/components/applications-kanban";
import { AutoApplySettingsCard } from "@/components/auto-apply-card";
import { ArrowLeft, Layers, AlertTriangle } from "lucide-react";
import { FormSubmitButton } from "@/components/form-submit-button";

export const dynamic = "force-dynamic";

function percent(done: number, target: number) {
  if (target <= 0) return done > 0 ? 100 : 0;
  return Math.min(100, Math.round((done / target) * 100));
}

function daysUntil(date: Date, referenceDate: Date) {
  const ms = date.getTime() - referenceDate.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function deadlineBadgeClass(days: number) {
  if (days <= 3) return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800";
  if (days <= 7) return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
}

export default async function ApplicationsPage() {
  const session = await requireSubscriptionPage();

  const weekStart = getWeekStart();
  const [applications, goal, resumeTweaksThisWeek] = await Promise.all([
    prisma.application.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: { activities: { orderBy: { createdAt: "desc" } } },
    }),
    prisma.weeklyGoal.findUnique({
      where: { userId_weekStart: { userId: session.user.id, weekStart } },
    }),
    prisma.analysis.count({
      where: {
        resume: { userId: session.user.id },
        createdAt: { gte: weekStart },
      },
    }),
  ]);

  const currentGoal = goal ?? {
    targetApplications: 8,
    targetResumeTweaks: 2,
    targetInterviews: 3,
  };

  const appliedThisWeek = applications.filter(
    (item) => item.appliedAt && item.appliedAt >= weekStart
  ).length;
  const interviewsActive = applications.filter((item) =>
    ["interview", "technical_test", "offer"].includes(item.status)
  ).length;

  const now = new Date();
  const upcomingDeadlines = applications
    .filter((item) => item.deadline && item.deadline >= now)
    .sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime())
    .slice(0, 3);

  const metrics = [
    {
      label: "Candidaturas na semana",
      done: appliedThisWeek,
      target: currentGoal.targetApplications,
    },
    {
      label: "Currículos ajustados",
      done: resumeTweaksThisWeek,
      target: currentGoal.targetResumeTweaks,
    },
    {
      label: "Entrevistas em andamento",
      done: interviewsActive,
      target: currentGoal.targetInterviews,
    },
  ];

  const journey = computeJourneyMetrics(applications);
  const respondedApplications = applications.filter((item) => item.responseAt);
  const responseDurations = applications
    .filter((item) => item.appliedAt && item.responseAt)
    .map((item) => Math.max(0, item.responseAt!.getTime() - item.appliedAt!.getTime()) / (1000 * 60 * 60 * 24));
  const averageResponseDays = responseDurations.length > 0
    ? Math.round((responseDurations.reduce((sum, days) => sum + days, 0) / responseDurations.length) * 10) / 10
    : null;
  const applicationsWithResponse = applications.filter((item) => item.appliedAt).length;
  const interviewRate = applicationsWithResponse > 0
    ? Math.round((interviewsActive / applicationsWithResponse) * 100)
    : null;
  const journeyStats = [
    {
      label: "Dias em busca",
      value: journey.daysSearching !== null ? `${journey.daysSearching}` : "-",
      tone: "text-slate-900 dark:text-white",
    },
    {
      label: "Taxa de resposta",
      value: journey.responseRate !== null ? `${journey.responseRate}%` : "-",
      tone: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Taxa de rejeição",
      value: journey.rejectionRate !== null ? `${journey.rejectionRate}%` : "-",
      tone: "text-slate-500 dark:text-slate-400",
    },
    {
      label: "Candidaturas na semana",
      value: `${appliedThisWeek}`,
      tone: "text-slate-900 dark:text-white",
    },
    {
      label: "Tempo médio de resposta",
      value: averageResponseDays !== null ? `${averageResponseDays}d` : "-",
      tone: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Avanço para entrevista",
      value: interviewRate !== null ? `${interviewRate}%` : "-",
      tone: "text-violet-600 dark:text-violet-400",
    },
    {
      label: "Respostas registradas",
      value: `${respondedApplications.length}`,
      tone: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Painel</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>Pipeline</span>
        </span>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Gerenciador de Candidaturas
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Acompanhe e organize visualmente cada etapa dos seus processos seletivos.
          </p>
        </div>
        <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
          <Link href="/applications/insights" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-300">Ver aprendizados</Link>
          <Link href="/feed" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">Buscar Vagas no Feed</Link>
        </div>
      </div>

      {/* Warning Box for Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <section aria-labelledby="deadlines-heading" className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-5 shadow-sm space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h2 id="deadlines-heading" className="text-sm font-bold text-slate-900 dark:text-white">
                Prazos Próximos de Encerramento
              </h2>
            </div>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              {upcomingDeadlines.length} processo{upcomingDeadlines.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {upcomingDeadlines.map((item) => {
              const days = daysUntil(item.deadline!, now);
              return (
                <div key={item.id} className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-white dark:bg-slate-900 p-3 shadow-sm">
                  <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{item.jobTitle}</p>
                  <span className={`shrink-0 rounded-lg px-2.5 py-0.5 text-[10px] font-bold ${deadlineBadgeClass(days)}`}>
                    {days <= 0 ? "Hoje" : `${days}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <AutoApplySettingsCard />

      {/* Kanban Board Visual */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Quadro Kanban de Processos</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Deslize para os lados para ver todas as etapas.</p>
        </div>
        <ApplicationsKanban items={applications} />
      </section>

      {/* Jornada de Busca */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Jornada de Busca</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {journeyStats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-4 py-3">
              <p className={`text-xl font-bold tracking-tight sm:text-2xl ${stat.tone}`}>{stat.value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Metas Semanais */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const progress = percent(metric.done, metric.target);
          return (
            <div
              key={metric.label}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {metric.label}
                </p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {metric.done}/{metric.target}
                </p>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          );
        })}
      </section>

      {/* Formulários Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5">
        <form
          action={createApplication}
          className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4"
        >
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Adicionar Candidatura Externa</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Registre oportunidades de outros sites para manter seu controle unificado.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input name="jobTitle" required placeholder="Cargo" className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/20 transition-all" />
            <input name="company" placeholder="Empresa" className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/20 transition-all" />
            <input name="jobUrl" type="url" placeholder="Link da vaga (opcional)" className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/20 transition-all md:col-span-2" />
            <select name="status" defaultValue="saved" className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/20 transition-all cursor-pointer">
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {APPLICATION_STATUS_CONFIG[status].label}
                </option>
              ))}
            </select>
            <input name="notes" placeholder="Observações rápidas" className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/20 transition-all" />
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 md:col-span-2 space-y-1">
              Prazo de Inscrição (opcional)
              <input name="deadline" type="date" className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/20 transition-all" />
            </label>
          </div>
          <FormSubmitButton pendingLabel="Salvando..." className="ds-button-primary inline-flex items-center justify-center">
            Salvar Candidatura
          </FormSubmitButton>
        </form>

        <form
          action={updateWeeklyGoal}
          className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3.5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Metas da Semana</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Semana iniciada em {weekStart.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 space-y-1">
                Aplicações <span className="text-slate-400 text-[10px]">({appliedThisWeek})</span>
                <input name="targetApplications" type="number" min="1" defaultValue={currentGoal.targetApplications} className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all" />
              </label>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 space-y-1">
                Ajustes <span className="text-slate-400 text-[10px]">({resumeTweaksThisWeek})</span>
                <input name="targetResumeTweaks" type="number" min="0" defaultValue={currentGoal.targetResumeTweaks} className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all" />
              </label>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 space-y-1">
                Entrevistas <span className="text-slate-400 text-[10px]">({interviewsActive})</span>
                <input name="targetInterviews" type="number" min="0" defaultValue={currentGoal.targetInterviews} className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all" />
              </label>
            </div>
          </div>
          <FormSubmitButton pendingLabel="Atualizando..." className="ds-button-quiet mt-4">
            Atualizar Metas
          </FormSubmitButton>
        </form>
      </section>
    </main>
  );
}
