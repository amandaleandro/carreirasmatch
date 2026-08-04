import type { Metadata } from "next";
import Link from "next/link";
import {
  Briefcase,
  Filter,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Globe,
  Layers,
  Building2,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PUBLIC_JOB_CATEGORIES } from "@/lib/public-job-categories";
import { ContentPage } from "@/components/content-page";
import { AllJobsList } from "@/app/feed/AllJobsList";
import { workModelFilter } from "@/lib/job-filters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/vagas-de-hoje" },
  title: "Vagas de hoje | CarreirasMatch",
  description: "Veja vagas novas e recentes coletadas pelo CarreirasMatch, sem precisar criar conta.",
};

const PAGE_SIZE = 30;
const FALLBACK_DAYS = 7;
const DIVERSITY_POOL_SIZE = 600;

type PublicJob = {
  id: string;
  jobTitle: string;
  jobText: string;
  url: string;
  source: string;
  location: string | null;
  area: string;
  seniority: string;
  workModel: string;
  contractType: string;
  entryLevel: boolean;
  createdAt: Date;
};

function startOfTodaySaoPaulo(): Date {
  const now = new Date();
  const spNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const spMidnight = new Date(spNow.getFullYear(), spNow.getMonth(), spNow.getDate());
  const offsetMs = now.getTime() - spNow.getTime();
  return new Date(spMidnight.getTime() + offsetMs);
}

function recentFallbackStart(todayStart: Date): Date {
  return new Date(todayStart.getTime() - (FALLBACK_DAYS - 1) * 24 * 60 * 60 * 1000);
}

function interleaveByArea(jobs: PublicJob[]): PublicJob[] {
  const buckets = new Map<string, PublicJob[]>();
  for (const job of jobs) {
    const key = job.area || "Outras";
    const bucket = buckets.get(key) ?? [];
    bucket.push(job);
    buckets.set(key, bucket);
  }

  const orderedBuckets = [...buckets.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([, bucket]) => bucket);
  const result: PublicJob[] = [];
  let added = true;

  while (added) {
    added = false;
    for (const bucket of orderedBuckets) {
      const next = bucket.shift();
      if (next) {
        result.push(next);
        added = true;
      }
    }
  }

  return result;
}

export default async function JobsTodayPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    source?: string;
    q?: string;
    area?: string;
    seniority?: string;
    workModel?: string;
    contractType?: string;
    entryLevel?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const source = params.source?.trim() || "";
  const q = params.q?.trim() || "";
  const area = params.area?.trim() || "";
  const seniority = params.seniority?.trim() || "";
  const workModel = params.workModel?.trim() || "";
  const contractType = params.contractType?.trim() || "";
  const entryLevel = params.entryLevel === "yes";
  const todayStart = startOfTodaySaoPaulo();

  const baseFilters = {
    ...(source ? { source } : {}),
    ...(area ? { area } : {}),
    ...(seniority ? { seniority } : {}),
    ...(contractType ? { contractType } : {}),
    ...(entryLevel ? { entryLevel: true } : {}),
  };
  const andFilters = [
    ...(workModel ? [workModelFilter(workModel)] : []),
    ...(q
      ? [
          {
            OR: [
              { jobTitle: { contains: q } },
              { jobText: { contains: q } },
              { location: { contains: q } },
            ],
          },
        ]
      : []),
  ];

  const todayCount = await prisma.job.count({
    where: { active: true, createdAt: { gte: todayStart } },
  });
  const usingFallback = todayCount === 0;
  const effectiveStart = usingFallback ? recentFallbackStart(todayStart) : todayStart;
  const optionWhere = { active: true, createdAt: { gte: effectiveStart } };
  const where = { ...optionWhere, ...baseFilters, ...(andFilters.length ? { AND: andFilters } : {}) };

  const [total, allActiveCount, rawJobs, sources, areas, seniorities, workModels, contractTypes] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.count({ where: { active: true } }),
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: DIVERSITY_POOL_SIZE,
      select: {
        id: true,
        jobTitle: true,
        jobText: true,
        url: true,
        source: true,
        location: true,
        area: true,
        seniority: true,
        workModel: true,
        contractType: true,
        entryLevel: true,
        createdAt: true,
      },
    }),
    prisma.job.findMany({
      where: optionWhere,
      distinct: ["source"],
      orderBy: { source: "asc" },
      select: { source: true },
    }),
    prisma.job.findMany({
      where: { ...optionWhere, area: { not: "" } },
      distinct: ["area"],
      orderBy: { area: "asc" },
      select: { area: true },
    }),
    prisma.job.findMany({
      where: { ...optionWhere, seniority: { not: "" } },
      distinct: ["seniority"],
      orderBy: { seniority: "asc" },
      select: { seniority: true },
    }),
    prisma.job.findMany({
      where: { ...optionWhere, workModel: { not: "" } },
      distinct: ["workModel"],
      orderBy: { workModel: "asc" },
      select: { workModel: true },
    }),
    prisma.job.findMany({
      where: { ...optionWhere, contractType: { not: "" } },
      distinct: ["contractType"],
      orderBy: { contractType: "asc" },
      select: { contractType: true },
    }),
  ]);

  const jobs = interleaveByArea(rawJobs).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const sourceOptions = sources.map((item) => item.source);
  const areaOptions = areas.map((item) => item.area);
  const seniorityOptions = seniorities.map((item) => item.seniority);
  const workModelOptions = workModels.map((item) => item.workModel);
  const contractTypeOptions = contractTypes.map((item) => item.contractType);

  function pageHref(nextPage: number): string {
    const next = new URLSearchParams();
    if (nextPage > 1) next.set("page", String(nextPage));
    if (source) next.set("source", source);
    if (q) next.set("q", q);
    if (area) next.set("area", area);
    if (seniority) next.set("seniority", seniority);
    if (workModel) next.set("workModel", workModel);
    if (contractType) next.set("contractType", contractType);
    if (entryLevel) next.set("entryLevel", "yes");
    const query = next.toString();
    return query ? `/vagas-de-hoje?${query}` : "/vagas-de-hoje";
  }

  return (
    <ContentPage
      eyebrow="Atualizado em tempo real"
      title={usingFallback ? "Vagas recentes da semana" : "Vagas de hoje"}
      description={
        usingFallback
          ? "A busca de hoje está em processamento. Exibimos vagas recentes coletadas nos últimos dias, organizadas por área."
          : "Oportunidades em aberto coletadas hoje em portais e fontes públicas. Gratuito e sem necessidade de cadastro para visualizar."
      }
      maxWidthClass="max-w-6xl"
    >
      <div className="space-y-8">
        {/* Stat Cards Header */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {usingFallback ? "Vagas Recentes" : "Vagas Hoje"}
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{total}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Fontes Coletadas</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{sourceOptions.length}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Áreas Diferentes</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{areaOptions.length || "Várias"}</p>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total no Radar</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {allActiveCount.toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        </div>

        {/* Global CTA Notice Banner */}
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p className="font-bold text-slate-900 dark:text-white text-base">
                Procurando vagas específicas para seu perfil?
              </p>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Temos mais de <strong>{allActiveCount.toLocaleString("pt-BR")} oportunidades</strong> ativas. Crie sua conta grátis para receber recomendações com IA.
            </p>
          </div>
          <Link
            href="/todas-as-vagas"
            className="shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 transition-colors shadow-md shadow-blue-500/20 text-center whitespace-nowrap inline-flex items-center justify-center gap-2"
          >
            <span>Ver todas as vagas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Popular Categories Pill Bar */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            Categorias populares:
          </span>
          <div className="flex flex-wrap gap-2">
            {PUBLIC_JOB_CATEGORIES.slice(0, 10).map((categoryItem) => (
              <Link
                key={categoryItem.slug}
                href={`/vagas/${categoryItem.slug}`}
                className="rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-2xs"
              >
                {categoryItem.h1.replace(/^Vagas\s*/i, "")}
              </Link>
            ))}
          </div>
        </div>

        {/* Filters Form */}
        <form className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Filtrar vagas de hoje
            </span>
            {(q || area || seniority || workModel || contractType || source || entryLevel) && (
              <Link
                href="/vagas-de-hoje"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Limpar filtros
              </Link>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="relative min-w-0 sm:col-span-2 lg:col-span-3">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Digite cargo, tecnologia, palavra-chave ou cidade..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
              />
            </label>

            <select
              name="area"
              defaultValue={area}
              className="w-full min-w-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-all"
            >
              <option value="">Todas as áreas</option>
              {areaOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              name="seniority"
              defaultValue={seniority}
              className="w-full min-w-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-all"
            >
              <option value="">Todos os níveis</option>
              {seniorityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              name="workModel"
              defaultValue={workModel}
              className="w-full min-w-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-all"
            >
              <option value="">Todos os modelos</option>
              {workModelOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              name="contractType"
              defaultValue={contractType}
              className="w-full min-w-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-all"
            >
              <option value="">Todos os regimes</option>
              {contractTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              name="source"
              defaultValue={source}
              className="w-full min-w-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-all"
            >
              <option value="">Todas as fontes</option>
              {sourceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors shadow-md shadow-blue-500/20 inline-flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" />
              <span>Aplicar Filtros</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <label className="inline-flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                name="entryLevel"
                value="yes"
                defaultChecked={entryLevel}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Mostrar apenas vagas sem experiência, estágio ou jovem aprendiz</span>
            </label>
          </div>
        </form>

        {/* Jobs List (mesmo design de card usado em /todas-as-vagas) */}
        {jobs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-10 text-center shadow-sm space-y-3">
            <Briefcase className="h-10 w-10 mx-auto text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Nenhuma vaga encontrada para estes filtros
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              Tente remover ou redefinir os filtros de busca para visualizar mais oportunidades.
            </p>
            <div className="pt-2">
              <Link
                href="/vagas-de-hoje"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 text-sm transition-colors"
              >
                Ver todas as vagas de hoje
              </Link>
            </div>
          </div>
        ) : (
          <AllJobsList jobs={jobs} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Link
              href={pageHref(Math.max(1, page - 1))}
              aria-disabled={page <= 1}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 aria-disabled:pointer-events-none aria-disabled:opacity-40 transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </Link>

            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Página <strong className="text-slate-900 dark:text-white">{page}</strong> de{" "}
              <strong className="text-slate-900 dark:text-white">{totalPages}</strong>
            </span>

            <Link
              href={pageHref(Math.min(totalPages, page + 1))}
              aria-disabled={page >= totalPages}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 aria-disabled:pointer-events-none aria-disabled:opacity-40 transition-colors shadow-2xs"
            >
              <span>Próxima</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </nav>
        )}

        {/* Bottom Feature Callout Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full text-blue-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diagnóstico de Aderência com IA</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Encontrou uma vaga interessante?
            </h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              Compare seu currículo com os requisitos da vaga antes de se candidatar e receba um diagnóstico de compatibilidade completo em segundos.
            </p>
          </div>
          <Link
            href="/analise"
            className="relative z-10 shrink-0 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-extrabold px-6 py-3 text-sm text-center shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            Analisar currículo e vaga
          </Link>
        </div>
      </div>
    </ContentPage>
  );
}
