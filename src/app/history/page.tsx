import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TRACK_LABELS, CareerTrack } from "@/components/analysis-display";
import { CircularScore } from "@/components/circular-score";
import { Pagination } from "@/components/Pagination";
import { DeleteAnalysisButton } from "@/components/delete-analysis-button";
import type { Prisma } from "@/generated/prisma/client";
import { ArrowLeft, Search, Calendar, Target, Briefcase, Plus, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

const HISTORY_PAGE_SIZE = 12;

const STATUS_CONFIG = {
  apply_now: { label: "Aplicar agora", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" },
  adjust_first: { label: "Ajustar antes", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" },
  deprioritize: { label: "Não priorizar", dot: "bg-rose-500", text: "text-rose-700 dark:text-rose-300", bg: "bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800" },
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; track?: string; status?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { q, track, status, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.AnalysisWhereInput = {
    resume: { userId: session.user.id },
    ...(q ? { jobTitle: { contains: q } } : {}),
    ...(track ? { careerTrack: track } : {}),
    ...(status ? { applicationStatus: status } : {}),
  };

  const [analyses, total, seniorityTimeline] = await Promise.all([
    prisma.analysis.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * HISTORY_PAGE_SIZE,
      take: HISTORY_PAGE_SIZE,
    }),
    prisma.analysis.count({ where }),
    prisma.analysis.findMany({
      where: { resume: { userId: session.user.id } },
      orderBy: { createdAt: "asc" },
      select: { id: true, jobTitle: true, seniorityScore: true, createdAt: true },
      take: 20,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE));

  return (
    <main className="px-4 sm:px-6 md:px-8 py-8 md:py-12 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Painel</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
          <Briefcase className="w-3.5 h-3.5 text-slate-500" />
          <span>Histórico</span>
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Histórico de Diagnósticos
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Veja todas as suas simulações anteriores e compare o nível de aderência.
          </p>
        </div>
        <Link
          href="/analise"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-2.5 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Análise</span>
        </Link>
      </div>

      <p className="text-xs font-medium text-slate-500 dark:text-slate-400" aria-live="polite">
        {total} {total === 1 ? "diagnóstico encontrado" : "diagnósticos encontrados"}
        {(q || track || status) && " com os filtros atuais"}.
      </p>

      {/* Evolution Graph Card */}
      {seniorityTimeline.length >= 2 && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                Evolução de Senioridade
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pontuação de senioridade do currículo em cada análise ao longo do tempo.
              </p>
            </div>
            {(() => {
              const first = seniorityTimeline[0].seniorityScore;
              const last = seniorityTimeline[seniorityTimeline.length - 1].seniorityScore;
              const delta = last - first;
              if (delta === 0) return null;
              return (
                <span
                  className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
                    delta > 0
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                  }`}
                >
                  {delta > 0 ? "+" : ""}
                  {delta} pts
                </span>
              );
            })()}
          </div>
          <div className="flex items-end gap-2 h-24 pt-2">
            {seniorityTimeline.map((a) => (
              <div
                key={a.id}
                title={`${a.jobTitle}, ${a.seniorityScore}/100 (${new Date(a.createdAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })})`}
                className="flex-1 min-w-[8px] rounded-t-lg bg-slate-900 dark:bg-white/80 hover:bg-slate-700 dark:hover:bg-white transition-colors"
                style={{ height: `${Math.max(8, a.seniorityScore)}%` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filters Form */}
      <form method="GET" className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="search"
            name="q"
            defaultValue={q || ""}
            placeholder="Buscar por vaga..."
            aria-label="Buscar por vaga"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/20 transition-all"
          />
        </div>

        <div>
          <select
            name="track"
            defaultValue={track || ""}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/20 transition-all"
          >
            <option value="">Todas as trilhas</option>
            {Object.entries(TRACK_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            name="status"
            defaultValue={status || ""}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/20 transition-all"
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
              <option key={val} value={val}>
                {cfg.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors shadow-sm"
          >
            Filtrar
          </button>
          {(q || track || status) && (
            <Link
              href="/history"
              className="flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors"
            >
              Limpar
            </Link>
          )}
        </div>
      </form>

      {/* Analysis Grid */}
      {analyses.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Briefcase className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Nenhuma análise encontrada com os filtros selecionados.
          </p>
          <Link href="/analise" className="inline-block mt-4 text-sm font-semibold text-slate-900 dark:text-white hover:underline">
            Fazer um novo diagnóstico agora →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {analyses.map((a) => {
            const statusCfg = STATUS_CONFIG[a.applicationStatus as keyof typeof STATUS_CONFIG];
            const parsedKeywordsFound: string[] = JSON.parse(a.keywordsFound || "[]");
            const parsedKeywordsMissing: string[] = JSON.parse(a.keywordsMissing || "[]");
            const dateStr = new Date(a.createdAt).toLocaleDateString("pt-BR", {
              timeZone: "America/Sao_Paulo",
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={a.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg?.bg || ""} ${statusCfg?.text || ""}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusCfg?.dot || ""}`} />
                        {statusCfg?.label || a.applicationStatus}
                      </span>
                      <h2 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors mt-2">
                        {a.jobTitle}
                      </h2>
                    </div>
                    <div className="shrink-0 flex flex-col items-center gap-2">
                      <CircularScore value={a.overallScore} size={48} strokeWidth={4.5} />
                      <DeleteAnalysisButton analysisId={a.id} jobTitle={a.jobTitle} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5" />
                      {TRACK_LABELS[a.careerTrack as CareerTrack]}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {dateStr}
                    </span>
                  </div>

                  {/* Keywords & ATS Stats */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    <div>
                      <p className="text-slate-500 font-medium">Palavras-chave:</p>
                      <p className="mt-0.5 text-slate-700 dark:text-slate-300">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {parsedKeywordsFound.length}
                        </span>{" "}
                        encontradas ·{" "}
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">
                          {parsedKeywordsMissing.length}
                        </span>{" "}
                        ausentes
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Score ATS:</p>
                      <p className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                        {a.atsScore}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <Link
                    href={`/report/${a.id}`}
                    className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white hover:underline"
                  >
                    Ver Relatório Completo →
                  </Link>
                  <Link
                    href={`/report/${a.id}/map`}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Mapa de Oportunidade
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/history"
        searchParams={{ q, track, status }}
      />
    </main>
  );
}
