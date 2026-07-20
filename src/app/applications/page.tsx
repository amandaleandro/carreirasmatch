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
  scheduleInterview,
  updateApplicationStatus,
  updateWeeklyGoal,
} from "./actions";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";

export const dynamic = "force-dynamic";

function percent(done: number, target: number) {
  if (target <= 0) return done > 0 ? 100 : 0;
  return Math.min(100, Math.round((done / target) * 100));
}

function daysUntil(date: Date) {
  const ms = date.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function toDatetimeLocalValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function deadlineBadgeClass(days: number) {
  if (days <= 3) return "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400";
  if (days <= 7) return "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400";
  return "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300";
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

  // Dynamic deadline countdown intentionally uses the current clock on each request.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const upcomingDeadlines = applications
    .filter((item) => item.deadline && item.deadline.getTime() >= now)
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
  const journeyStats = [
    {
      label: "Dias em busca",
      value: journey.daysSearching !== null ? `${journey.daysSearching}` : "—",
      tone: "text-neutral-900 dark:text-neutral-100",
    },
    {
      label: "Taxa de resposta",
      value: journey.responseRate !== null ? `${journey.responseRate}%` : "—",
      tone: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Taxa de rejeição",
      value: journey.rejectionRate !== null ? `${journey.rejectionRate}%` : "—",
      tone: "text-neutral-500 dark:text-neutral-400",
    },
    {
      label: "Candidaturas na semana",
      value: `${appliedThisWeek}`,
      tone: "text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <main className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
            Pipeline
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Candidaturas</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Acompanhe suas vagas salvas, candidaturas, entrevistas, testes e propostas tudo em um lugar só.
          </p>
        </div>
        <Link
          href="/feed"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all"
        >
          Buscar vagas no feed
        </Link>
      </div>

      <section className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950 shadow-sm shadow-slate-900/5">
        <h2 className="font-semibold">Sua jornada de busca</h2>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {journeyStats.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-neutral-50 dark:bg-white/[0.03] px-4 py-3">
              <p className={`text-3xl font-bold tabular-nums ${stat.tone}`}>{stat.value}</p>
              <p className="text-xs text-neutral-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const progress = percent(metric.done, metric.target);
          return (
            <div
              key={metric.label}
              className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-950 shadow-sm shadow-slate-900/5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {metric.label}
                </p>
                <p className="text-sm font-semibold">
                  {metric.done}/{metric.target}
                </p>
              </div>
              <div className="mt-3 h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          );
        })}
      </section>

      {upcomingDeadlines.length > 0 && (
        <section className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950 shadow-sm shadow-slate-900/5">
          <h2 className="font-semibold">Prazos próximos</h2>
          <div className="mt-3 space-y-2">
            {upcomingDeadlines.map((item) => {
              const days = daysUntil(item.deadline!);
              return (
                <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.jobTitle}</p>
                    {item.company && <p className="text-xs text-neutral-500">{item.company}</p>}
                  </div>
                  <span className={`text-xs font-semibold rounded-full px-2.5 py-1 shrink-0 ${deadlineBadgeClass(days)}`}>
                    {days <= 0 ? "Encerra hoje" : `Encerra em ${days}d`}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-neutral-500 mt-3">
            Fique de olho no site da empresa: a gente não envia lembrete por e-mail.
          </p>
        </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <form
          action={createApplication}
          className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950 shadow-sm shadow-slate-900/5 space-y-4"
        >
          <div>
            <h2 className="font-semibold">Adicionar candidatura</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Use para registrar vagas que você achou fora do feed ou processos que já começou.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input name="jobTitle" required placeholder="Cargo" className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors" />
            <input name="company" placeholder="Empresa" className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors" />
            <input name="jobUrl" type="url" placeholder="Link da vaga" className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors md:col-span-2" />
            <select name="status" defaultValue="saved" className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500">
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {APPLICATION_STATUS_CONFIG[status].label}
                </option>
              ))}
            </select>
            <input name="notes" placeholder="Nota rápida" className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors" />
            <label className="text-xs text-neutral-500 md:col-span-2">
              Prazo de inscrição (opcional)
              <input name="deadline" type="date" className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors text-neutral-950 dark:text-neutral-50" />
            </label>
          </div>
          <button type="submit" className="rounded-xl bg-blue-600 text-white px-5 py-2.5 text-sm font-semibold shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all">
            Salvar candidatura
          </button>
        </form>

        <form
          action={updateWeeklyGoal}
          className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-950 shadow-sm shadow-slate-900/5 space-y-4"
        >
          <div>
            <h2 className="font-semibold">Metas da semana</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Semana iniciada em {weekStart.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="text-xs text-neutral-500">
              Aplicações <span className="text-neutral-400">({appliedThisWeek} feita{appliedThisWeek === 1 ? "" : "s"})</span>
              <input name="targetApplications" type="number" min="1" defaultValue={currentGoal.targetApplications} className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors text-neutral-950 dark:text-neutral-50" />
            </label>
            <label className="text-xs text-neutral-500">
              Ajustes <span className="text-neutral-400">({resumeTweaksThisWeek} feito{resumeTweaksThisWeek === 1 ? "" : "s"})</span>
              <input name="targetResumeTweaks" type="number" min="0" defaultValue={currentGoal.targetResumeTweaks} className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors text-neutral-950 dark:text-neutral-50" />
            </label>
            <label className="text-xs text-neutral-500">
              Entrevistas <span className="text-neutral-400">({interviewsActive} ativa{interviewsActive === 1 ? "" : "s"})</span>
              <input name="targetInterviews" type="number" min="0" defaultValue={currentGoal.targetInterviews} className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors text-neutral-950 dark:text-neutral-50" />
            </label>
          </div>
          <button type="submit" className="rounded-xl border border-blue-600 px-5 py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors">
            Atualizar metas
          </button>
        </form>
      </section>

      <section className="-mx-4 md:-mx-8 px-4 md:px-8 overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-max">
        {APPLICATION_STATUSES.map((status) => {
          const config = APPLICATION_STATUS_CONFIG[status];
          const items = applications.filter((item) => item.status === status);
          return (
            <div key={status} className={`flex flex-col w-60 shrink-0 rounded-2xl border p-3 shadow-sm shadow-slate-900/5 ${config.column}`}>
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${config.dot}`} />
                  <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">{config.label}</h2>
                  <span className="shrink-0 text-xs font-semibold rounded-full bg-white/70 dark:bg-neutral-950/70 px-2 py-0.5 tabular-nums">
                    {items.length}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1.5 line-clamp-2">{config.description}</p>
              </div>
              {items.length === 0 && (
                <div className="flex-1 min-h-24 rounded-xl border border-dashed border-neutral-300/70 dark:border-neutral-700/70 flex items-center justify-center">
                  <p className="text-xs text-neutral-400 dark:text-neutral-600">Nada aqui ainda</p>
                </div>
              )}
              <div className="space-y-3">
                {items.map((item) => (
                  <article key={item.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm shadow-slate-900/5 hover:shadow-md transition-shadow">
                    <details className="group">
                      <summary className="cursor-pointer list-none p-3 [&::-webkit-details-marker]:hidden">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold leading-snug">{item.jobTitle}</h3>
                          <span className="shrink-0 text-neutral-400 text-xs mt-0.5 transition-transform group-open:rotate-180">▾</span>
                        </div>
                        {item.company && <p className="text-xs text-neutral-500 mt-0.5 truncate">{item.company}</p>}
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 empty:hidden">
                          {item.fitScore !== null && (
                            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded px-1.5 py-0.5">
                              {item.fitScore}% aderência
                            </span>
                          )}
                          {item.deadline && item.deadline.getTime() >= Date.now() && (
                            <span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 ${deadlineBadgeClass(daysUntil(item.deadline))}`}>
                              {daysUntil(item.deadline) <= 0 ? "Encerra hoje" : `Prazo: ${daysUntil(item.deadline)}d`}
                            </span>
                          )}
                        </div>
                      </summary>
                      <div className="px-3 pb-3 border-t border-neutral-100 dark:border-neutral-900 pt-2.5">
                        {item.notes && <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3">{item.notes}</p>}
                        <form action={updateApplicationStatus.bind(null, item.id)} className="mt-2.5 flex gap-2">
                          <select name="status" defaultValue={item.status} className="min-w-0 flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-2 py-1.5 text-xs">
                            {APPLICATION_STATUSES.map((option) => (
                              <option key={option} value={option}>
                                {APPLICATION_STATUS_CONFIG[option].label}
                              </option>
                            ))}
                          </select>
                          <button type="submit" className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
                            Mover
                          </button>
                        </form>
                        {(status === "interview" || status === "technical_test") && (
                          <form action={scheduleInterview.bind(null, item.id)} className="mt-2 flex gap-2">
                            <input
                              type="datetime-local"
                              name="interviewAt"
                              defaultValue={item.interviewAt ? toDatetimeLocalValue(item.interviewAt) : ""}
                              className="min-w-0 flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-2 py-1.5 text-xs"
                            />
                            <button type="submit" className="rounded-lg border border-violet-600 px-2.5 py-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors">
                              Agendar
                            </button>
                          </form>
                        )}
                        <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-xs empty:hidden">
                          {item.jobUrl && (
                            <a href={item.jobUrl} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                              Abrir vaga
                            </a>
                          )}
                          {item.analysisId && (
                            <Link href={`/report/${item.analysisId}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                              Ver análise
                            </Link>
                          )}
                          {(status === "interview" || status === "technical_test") && (
                            <Link href={`/interviews/${item.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                              Preparar entrevista
                            </Link>
                          )}
                        </div>
                        {item.activities.length > 0 && (
                          <details className="mt-2.5 text-xs">
                            <summary className="cursor-pointer text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                              Histórico ({item.activities.length})
                            </summary>
                            <ul className="mt-2 space-y-1.5">
                              {item.activities.map((activity) => (
                                <li key={activity.id} className="text-neutral-500">
                                  {activity.fromStatus
                                    ? `${APPLICATION_STATUS_CONFIG[activity.fromStatus as keyof typeof APPLICATION_STATUS_CONFIG]?.label ?? activity.fromStatus} → `
                                    : ""}
                                  {APPLICATION_STATUS_CONFIG[activity.toStatus as keyof typeof APPLICATION_STATUS_CONFIG]?.label ?? activity.toStatus}
                                  <span className="text-neutral-400"> · {activity.createdAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</span>
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    </details>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
        </div>
      </section>
    </main>
  );
}
