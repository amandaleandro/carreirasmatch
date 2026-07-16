import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TRACK_LABELS, CareerTrack } from "@/components/analysis-display";
import { CircularScore } from "@/components/circular-score";
import { Pagination } from "@/components/Pagination";
import { DeleteAnalysisButton } from "@/components/delete-analysis-button";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const HISTORY_PAGE_SIZE = 12;

const STATUS_CONFIG = {
  apply_now: { label: "Aplicar agora", dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50" },
  adjust_first: { label: "Ajustar antes", dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50" },
  deprioritize: { label: "Não priorizar", dot: "bg-red-500", text: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/50" },
};

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  );
}

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
    <main className="px-4 md:px-8 py-8 max-w-6xl mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Histórico de diagnósticos</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Veja todas as suas simulações anteriores e compare sua aderência.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 text-sm transition-colors self-start md:self-auto shadow-sm"
        >
          <span>Nova análise</span>
          <span>→</span>
        </Link>
      </div>

      {seniorityTimeline.length >= 2 && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-semibold text-sm">Evolução de senioridade</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Pontuação de senioridade do currículo em cada análise, da mais antiga para a mais recente.
              </p>
            </div>
            {(() => {
              const first = seniorityTimeline[0].seniorityScore;
              const last = seniorityTimeline[seniorityTimeline.length - 1].seniorityScore;
              const delta = last - first;
              if (delta === 0) return null;
              return (
                <span
                  className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    delta > 0
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                      : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                  }`}
                >
                  {delta > 0 ? "+" : ""}
                  {delta} pts
                </span>
              );
            })()}
          </div>
          <div className="flex items-end gap-1.5 h-24">
            {seniorityTimeline.map((a) => (
              <div
                key={a.id}
                title={`${a.jobTitle}, ${a.seniorityScore}/100 (${new Date(a.createdAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })})`}
                className="flex-1 min-w-[6px] rounded-t bg-blue-500/80 dark:bg-blue-500/70 hover:bg-blue-600 transition-colors"
                style={{ height: `${Math.max(4, a.seniorityScore)}%` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filters form */}
      <form method="GET" className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <SearchIcon className="h-4 w-4" />
          </span>
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Buscar por vaga..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            name="track"
            defaultValue={track || ""}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            className="flex-1 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-950 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            Filtrar
          </button>
          {(q || track || status) && (
            <Link
              href="/history"
              className="flex items-center justify-center border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            >
              Limpar
            </Link>
          )}
        </div>
      </form>

      {analyses.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800">
          <BriefcaseIcon className="h-10 w-10 text-neutral-400 mx-auto mb-3" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
            Nenhuma análise encontrada com os filtros selecionados.
          </p>
          <Link href="/" className="inline-block mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Fazer um novo diagnóstico agora
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="group relative flex flex-col justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg?.bg || ""} ${statusCfg?.text || ""}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusCfg?.dot || ""}`} />
                        {statusCfg?.label || a.applicationStatus}
                      </span>
                      <h2 className="font-bold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-2">
                        {a.jobTitle}
                      </h2>
                    </div>
                    <div className="shrink-0 flex flex-col items-center gap-2">
                      <CircularScore value={a.overallScore} size={50} strokeWidth={5} />
                      <DeleteAnalysisButton analysisId={a.id} jobTitle={a.jobTitle} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs text-neutral-500">
                    <span className="flex items-center gap-1.5">
                      <TargetIcon className="h-3.5 w-3.5" />
                      {TRACK_LABELS[a.careerTrack as CareerTrack]}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {dateStr}
                    </span>
                  </div>

                  {/* Quick stats on keywords */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-900 text-xs">
                    <div>
                      <p className="text-neutral-500 font-medium">Palavras-chave:</p>
                      <p className="mt-0.5 text-neutral-800 dark:text-neutral-200">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {parsedKeywordsFound.length}
                        </span>{" "}
                        encontradas ·{" "}
                        <span className="text-red-600 dark:text-red-400 font-semibold">
                          {parsedKeywordsMissing.length}
                        </span>{" "}
                        ausentes
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500 font-medium">ATS / Currículo:</p>
                      <p className="mt-0.5 font-semibold text-neutral-800 dark:text-neutral-200">
                        {a.atsScore}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mt-6 pt-3 border-t border-neutral-100 dark:border-neutral-900">
                  <Link
                    href={`/report/${a.id}`}
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Ver Relatório completo →
                  </Link>
                  <Link
                    href={`/report/${a.id}/map`}
                    className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 underline"
                  >
                    Ver Mapa de Oportunidade
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
