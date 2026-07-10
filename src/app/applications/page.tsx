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
    },
    {
      label: "Taxa de resposta",
      value: journey.responseRate !== null ? `${journey.responseRate}%` : "—",
    },
    {
      label: "Taxa de rejeição",
      value: journey.rejectionRate !== null ? `${journey.rejectionRate}%` : "—",
    },
    {
      label: "Candidaturas na semana",
      value: `${appliedThisWeek}`,
    },
  ];

  return (
    <main className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Candidaturas</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Acompanhe vagas salvas, aplicações, entrevistas, testes e ofertas em um único fluxo.
          </p>
        </div>
        <Link
          href="/feed"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Buscar vagas no feed
        </Link>
      </div>

      <section className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950">
        <h2 className="font-semibold">Sua jornada de busca</h2>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {journeyStats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
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
              className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-950"
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
        <section className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950">
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
            Confira sempre no site da empresa — não enviamos lembrete automático por e-mail.
          </p>
        </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <form
          action={createApplication}
          className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950 space-y-4"
        >
          <div>
            <h2 className="font-semibold">Adicionar candidatura</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Use para vagas encontradas fora do feed ou processos já iniciados.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input name="jobTitle" required placeholder="Cargo" className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm" />
            <input name="company" placeholder="Empresa" className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm" />
            <input name="jobUrl" type="url" placeholder="Link da vaga" className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm md:col-span-2" />
            <select name="status" defaultValue="saved" className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm">
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {APPLICATION_STATUS_CONFIG[status].label}
                </option>
              ))}
            </select>
            <input name="notes" placeholder="Nota rápida" className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm" />
            <label className="text-xs text-neutral-500 md:col-span-2">
              Prazo de inscrição (opcional)
              <input name="deadline" type="date" className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm text-neutral-950 dark:text-neutral-50" />
            </label>
          </div>
          <button type="submit" className="rounded-md bg-neutral-950 text-white dark:bg-neutral-100 dark:text-neutral-950 px-4 py-2 text-sm font-semibold">
            Salvar candidatura
          </button>
        </form>

        <form
          action={updateWeeklyGoal}
          className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950 space-y-4"
        >
          <div>
            <h2 className="font-semibold">Metas da semana</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Semana iniciada em {weekStart.toLocaleDateString("pt-BR")}.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="text-xs text-neutral-500">
              Aplicações
              <input name="targetApplications" type="number" min="1" defaultValue={currentGoal.targetApplications} className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm text-neutral-950 dark:text-neutral-50" />
            </label>
            <label className="text-xs text-neutral-500">
              Ajustes
              <input name="targetResumeTweaks" type="number" min="0" defaultValue={currentGoal.targetResumeTweaks} className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm text-neutral-950 dark:text-neutral-50" />
            </label>
            <label className="text-xs text-neutral-500">
              Entrevistas
              <input name="targetInterviews" type="number" min="0" defaultValue={currentGoal.targetInterviews} className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm text-neutral-950 dark:text-neutral-50" />
            </label>
          </div>
          <button type="submit" className="rounded-md border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
            Atualizar metas
          </button>
        </form>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-7 gap-4">
        {APPLICATION_STATUSES.map((status) => {
          const config = APPLICATION_STATUS_CONFIG[status];
          const items = applications.filter((item) => item.status === status);
          return (
            <div key={status} className={`rounded-lg border p-3 min-h-72 ${config.column}`}>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                    {config.label}
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">{config.description}</p>
                </div>
                <span className="text-xs font-semibold rounded-full bg-white/70 dark:bg-neutral-950/70 px-2 py-1">
                  {items.length}
                </span>
              </div>
              <div className="space-y-3">
                {items.map((item) => (
                  <article key={item.id} className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3">
                    <h3 className="text-sm font-semibold leading-snug">{item.jobTitle}</h3>
                    {item.company && <p className="text-xs text-neutral-500 mt-1">{item.company}</p>}
                    {item.fitScore !== null && (
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-2">
                        {item.fitScore}% de aderência
                      </p>
                    )}
                    {item.notes && <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-3">{item.notes}</p>}
                    {item.deadline && item.deadline.getTime() >= Date.now() && (
                      <span className={`inline-block text-[10px] font-semibold rounded px-1.5 py-0.5 mt-2 ${deadlineBadgeClass(daysUntil(item.deadline))}`}>
                        {daysUntil(item.deadline) <= 0 ? "Encerra hoje" : `Prazo: ${daysUntil(item.deadline)}d`}
                      </span>
                    )}
                    <form action={updateApplicationStatus.bind(null, item.id)} className="mt-3 flex gap-2">
                      <select name="status" defaultValue={item.status} className="min-w-0 flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-2 py-1.5 text-xs">
                        {APPLICATION_STATUSES.map((option) => (
                          <option key={option} value={option}>
                            {APPLICATION_STATUS_CONFIG[option].label}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-semibold text-white dark:bg-neutral-100 dark:text-neutral-950">
                        Mover
                      </button>
                    </form>
                    {(status === "interview" || status === "technical_test") && (
                      <form action={scheduleInterview.bind(null, item.id)} className="mt-2 flex gap-2">
                        <input
                          type="datetime-local"
                          name="interviewAt"
                          defaultValue={item.interviewAt ? toDatetimeLocalValue(item.interviewAt) : ""}
                          className="min-w-0 flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-2 py-1.5 text-xs"
                        />
                        <button type="submit" className="rounded-md border border-violet-600 px-2.5 py-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
                          Agendar
                        </button>
                      </form>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
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
                      <details className="mt-3 text-xs">
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
                              <span className="text-neutral-400"> · {activity.createdAt.toLocaleDateString("pt-BR")}</span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
