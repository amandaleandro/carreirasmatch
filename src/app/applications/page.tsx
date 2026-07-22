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

import { ApplicationsKanban } from "@/components/applications-kanban";

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
      value: journey.daysSearching !== null ? `${journey.daysSearching}` : "Sem dados",
      tone: "text-neutral-900 dark:text-neutral-100",
    },
    {
      label: "Taxa de resposta",
      value: journey.responseRate !== null ? `${journey.responseRate}%` : "Sem dados",
      tone: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Taxa de rejeição",
      value: journey.rejectionRate !== null ? `${journey.rejectionRate}%` : "Sem dados",
      tone: "text-neutral-500 dark:text-neutral-400",
    },
    {
      label: "Candidaturas na semana",
      value: `${appliedThisWeek}`,
      tone: "text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <main className="px-4 md:px-8 py-8 max-w-6xl mx-auto w-full space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Pipeline de Vagas
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Candidaturas</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Gerencie visualmente suas candidaturas por etapa do processo seletivo.
          </p>
        </div>
        <Link
          href="/feed"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all shrink-0"
        >
          Buscar vagas no feed
        </Link>
      </div>

      {/* Kanban Board Visual */}
      <section className="space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Quadro Kanban de Processos</h2>
        <ApplicationsKanban items={applications} />
      </section>

      {/* Jornada de Busca */}
      <section className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 p-5 bg-[#FFFFFF] dark:bg-neutral-900/40 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <h2 className="text-sm font-bold text-[#071827] dark:text-white">Sua jornada de busca</h2>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {journeyStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-800/80 bg-[#F8FAFC]/50 dark:bg-white/[0.02] px-4 py-3">
              <p className={`text-2xl font-black tracking-tight tabular-nums ${stat.tone}`}>{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mt-1">{stat.label}</p>
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
              className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 p-4.5 bg-[#FFFFFF] dark:bg-neutral-900/40 shadow-[0_8px_30px_rgb(0,0,0,0.01)]"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-[#64748B]">
                  {metric.label}
                </p>
                <p className="text-xs font-black text-[#071827] dark:text-white">
                  {metric.done}/{metric.target}
                </p>
              </div>
              <div className="mt-3.5 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          );
        })}
      </section>

      {upcomingDeadlines.length > 0 && (
        <section className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 p-5 bg-[#FFFFFF] dark:bg-neutral-900/40 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
          <h2 className="text-sm font-bold text-[#071827] dark:text-white">Prazos próximos</h2>
          <div className="mt-3 space-y-2">
            {upcomingDeadlines.map((item) => {
              const days = daysUntil(item.deadline!);
              return (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs p-2 rounded-xl bg-[#F8FAFC]/50 dark:bg-white/[0.01]">
                  <div className="min-w-0">
                    <p className="font-bold text-[#071827] dark:text-white truncate">{item.jobTitle}</p>
                    {item.company && <p className="text-[10px] text-[#64748B] mt-0.5">{item.company}</p>}
                  </div>
                  <span className={`text-[10px] font-bold rounded-lg px-2.5 py-1 shrink-0 ${deadlineBadgeClass(days)}`}>
                    {days <= 0 ? "Encerra hoje" : `Encerra em ${days}d`}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-[#64748B] mt-3 italic">
            * Fique de olho no site da empresa: a gente não envia lembrete por e-mail.
          </p>
        </section>
      )}

      {/* Formulários Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4">
        <form
          action={createApplication}
          className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 p-5 bg-[#FFFFFF] dark:bg-neutral-900/40 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-4"
        >
          <div>
            <h2 className="text-sm font-bold text-[#071827] dark:text-white">Adicionar candidatura</h2>
            <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
              Use para registrar vagas que você achou fora do feed ou processos que já começou.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input name="jobTitle" required placeholder="Cargo" className="rounded-xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC]/50 dark:bg-neutral-900/50 px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-250 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder:text-neutral-400" />
            <input name="company" placeholder="Empresa" className="rounded-xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC]/50 dark:bg-neutral-900/50 px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-250 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder:text-neutral-400" />
            <input name="jobUrl" type="url" placeholder="Link da vaga" className="rounded-xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC]/50 dark:bg-neutral-900/50 px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-250 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder:text-neutral-400 md:col-span-2" />
            <select name="status" defaultValue="saved" className="rounded-xl border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-xs font-semibold text-neutral-850 dark:text-neutral-200 outline-none focus:border-[#2563EB] transition-all cursor-pointer">
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {APPLICATION_STATUS_CONFIG[status].label}
                </option>
              ))}
            </select>
            <input name="notes" placeholder="Nota rápida" className="rounded-xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC]/50 dark:bg-neutral-900/50 px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-250 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder:text-neutral-400" />
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] md:col-span-2 space-y-1">
              Prazo de inscrição (opcional)
              <input name="deadline" type="date" className="mt-1 w-full rounded-xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC]/50 dark:bg-neutral-900/50 px-3 py-2 text-xs font-semibold text-[#071827] dark:text-white outline-none focus:border-[#2563EB] transition-all" />
            </label>
          </div>
          <button type="submit" className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2.5 text-xs font-bold shadow-sm shadow-[#2563EB]/25 transition-all cursor-pointer active:scale-[0.98]">
            Salvar candidatura
          </button>
        </form>

        <form
          action={updateWeeklyGoal}
          className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 p-5 bg-[#FFFFFF] dark:bg-neutral-900/40 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3.5">
            <div>
              <h2 className="text-sm font-bold text-[#071827] dark:text-white">Metas da semana</h2>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                Semana iniciada em {weekStart.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] space-y-1">
                Aplicações <span className="text-[#64748B]/60 text-[9px]">({appliedThisWeek})</span>
                <input name="targetApplications" type="number" min="1" defaultValue={currentGoal.targetApplications} className="mt-1 w-full rounded-xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC]/50 dark:bg-neutral-900/50 px-3 py-2 text-xs font-semibold text-[#071827] dark:text-white outline-none focus:border-[#2563EB] transition-all" />
              </label>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] space-y-1">
                Ajustes <span className="text-[#64748B]/60 text-[9px]">({resumeTweaksThisWeek})</span>
                <input name="targetResumeTweaks" type="number" min="0" defaultValue={currentGoal.targetResumeTweaks} className="mt-1 w-full rounded-xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC]/50 dark:bg-neutral-900/50 px-3 py-2 text-xs font-semibold text-[#071827] dark:text-white outline-none focus:border-[#2563EB] transition-all" />
              </label>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] space-y-1">
                Entrevistas <span className="text-[#64748B]/60 text-[9px]">({interviewsActive})</span>
                <input name="targetInterviews" type="number" min="0" defaultValue={currentGoal.targetInterviews} className="mt-1 w-full rounded-xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC]/50 dark:bg-neutral-900/50 px-3 py-2 text-xs font-semibold text-[#071827] dark:text-white outline-none focus:border-[#2563EB] transition-all" />
              </label>
            </div>
          </div>
          <button type="submit" className="rounded-xl border border-[#2563EB] px-4 py-2.5 text-xs font-bold text-[#2563EB] hover:bg-[#2563EB]/5 transition-all cursor-pointer mt-4 active:scale-[0.98]">
            Atualizar metas
          </button>
        </form>
      </section>

      {/* Kanban Board */}
      <section className="-mx-4 md:-mx-8 px-4 md:px-8 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max pb-1">
          {APPLICATION_STATUSES.map((status) => {
            const config = APPLICATION_STATUS_CONFIG[status];
            const items = applications.filter((item) => item.status === status);
            return (
              <div key={status} className={`flex flex-col w-64 shrink-0 rounded-3xl border border-[#E2E8F0] dark:border-neutral-850 p-4 bg-[#FFFFFF]/60 dark:bg-neutral-950/40 shadow-sm ${config.column}`}>
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${config.dot}`} />
                    <h2 className="min-w-0 flex-1 truncate text-xs font-bold uppercase tracking-wider text-[#071827] dark:text-white">{config.label}</h2>
                    <span className="shrink-0 text-[10px] font-bold rounded-full bg-white/90 border border-neutral-200/50 dark:border-neutral-800 dark:bg-neutral-900/90 px-2 py-0.5 tabular-nums text-neutral-600 dark:text-neutral-300">
                      {items.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#64748B] mt-1.5 leading-relaxed">{config.description}</p>
                </div>
                {items.length === 0 && (
                  <div className="flex-1 min-h-24 rounded-2xl border border-dashed border-neutral-300/60 dark:border-neutral-800/80 flex items-center justify-center bg-white/20 dark:bg-black/5">
                    <p className="text-[10px] font-bold text-[#64748B]/50">Nenhuma vaga aqui</p>
                  </div>
                )}
                <div className="space-y-3">
                  {items.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-850 bg-white dark:bg-neutral-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-md transition-all">
                      <details className="group">
                        <summary className="cursor-pointer list-none p-3.5 [&::-webkit-details-marker]:hidden">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-xs font-bold leading-snug text-[#071827] dark:text-white group-hover:text-[#2563EB] transition-colors">{item.jobTitle}</h3>
                            <span className="shrink-0 text-[#64748B] text-[10px] mt-0.5 transition-transform group-open:rotate-180">▼</span>
                          </div>
                          {item.company && <p className="text-[10px] text-[#64748B] mt-1 font-semibold">{item.company}</p>}
                          <div className="mt-2 flex flex-wrap items-center gap-1.5 empty:hidden">
                            {item.fitScore !== null && (
                              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5">
                                {item.fitScore}% match
                              </span>
                            )}
                            {item.deadline && item.deadline.getTime() >= Date.now() && (
                              <span className={`text-[9px] font-bold rounded px-1.5 py-0.5 border ${deadlineBadgeClass(daysUntil(item.deadline))}`}>
                                {daysUntil(item.deadline) <= 0 ? "Hoje" : `${daysUntil(item.deadline)} dias`}
                              </span>
                            )}
                          </div>
                        </summary>
                        <div className="px-3.5 pb-3.5 border-t border-neutral-100 dark:border-neutral-850 pt-3 space-y-3">
                          {item.notes && <p className="text-[11px] text-[#64748B] leading-relaxed bg-[#F8FAFC] dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800">{item.notes}</p>}
                          
                          <form action={updateApplicationStatus.bind(null, item.id)} className="flex gap-1.5">
                            <select name="status" defaultValue={item.status} className="min-w-0 flex-1 rounded-xl border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 px-2 py-1.5 text-[11px] font-semibold text-neutral-850 dark:text-neutral-250 outline-none">
                              {APPLICATION_STATUSES.map((option) => (
                                <option key={option} value={option}>
                                  {APPLICATION_STATUS_CONFIG[option].label}
                                </option>
                              ))}
                            </select>
                            <button type="submit" className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] px-3 py-1.5 text-[10px] font-bold text-white transition-colors cursor-pointer">
                              Mover
                            </button>
                          </form>

                          {(status === "interview" || status === "technical_test") && (
                            <form action={scheduleInterview.bind(null, item.id)} className="flex gap-1.5 border-t border-neutral-100 dark:border-neutral-850 pt-2.5">
                              <input
                                type="datetime-local"
                                name="interviewAt"
                                defaultValue={item.interviewAt ? toDatetimeLocalValue(item.interviewAt) : ""}
                                className="min-w-0 flex-1 rounded-xl border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 px-2 py-1.5 text-[10px] font-semibold text-neutral-900 dark:text-neutral-100"
                              />
                              <button type="submit" className="rounded-xl border border-violet-600 px-2.5 py-1.5 text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors cursor-pointer">
                                Agendar
                              </button>
                            </form>
                          )}

                          <div className="flex flex-wrap gap-2.5 pt-1 text-[11px] font-semibold">
                            {item.jobUrl && (
                              <a href={item.jobUrl} target="_blank" rel="noreferrer" className="text-[#2563EB] hover:underline">
                                Abrir vaga ↗
                              </a>
                            )}
                            {item.analysisId && (
                              <Link href={`/report/${item.analysisId}`} className="text-[#2563EB] hover:underline">
                                Ver análise
                              </Link>
                            )}
                            {(status === "interview" || status === "technical_test") && (
                              <Link href={`/interviews/${item.id}`} className="text-violet-600 dark:text-violet-400 hover:underline">
                                Preparar entrevista
                              </Link>
                            )}
                          </div>

                          {item.activities.length > 0 && (
                            <details className="text-[10px] border-t border-neutral-100 dark:border-neutral-850 pt-2.5">
                              <summary className="cursor-pointer text-[#64748B] hover:text-neutral-850 dark:hover:text-neutral-250 font-bold uppercase tracking-wider text-[9px]">
                                Histórico ({item.activities.length})
                              </summary>
                              <ul className="mt-2 space-y-1.5">
                                {item.activities.map((activity) => (
                                  <li key={activity.id} className="text-[#64748B] leading-relaxed font-medium">
                                    {activity.fromStatus
                                      ? `${APPLICATION_STATUS_CONFIG[activity.fromStatus as keyof typeof APPLICATION_STATUS_CONFIG]?.label ?? activity.fromStatus} → `
                                      : ""}
                                    {APPLICATION_STATUS_CONFIG[activity.toStatus as keyof typeof APPLICATION_STATUS_CONFIG]?.label ?? activity.toStatus}
                                    <span className="text-neutral-400 font-normal"> · {activity.createdAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</span>
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
