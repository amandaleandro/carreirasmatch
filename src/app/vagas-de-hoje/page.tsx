import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, CalendarDays, ExternalLink, Filter, MapPin, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PUBLIC_JOB_CATEGORIES } from "@/lib/public-job-categories";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
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

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function cleanSnippet(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 220);
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
  const entryLevel = params.entryLevel === "yes";
  const todayStart = startOfTodaySaoPaulo();

  const baseFilters = {
    ...(source ? { source } : {}),
    ...(area ? { area } : {}),
    ...(seniority ? { seniority } : {}),
    ...(workModel ? { workModel } : {}),
    ...(entryLevel ? { entryLevel: true } : {}),
    ...(q
      ? {
          OR: [
            { jobTitle: { contains: q } },
            { jobText: { contains: q } },
            { location: { contains: q } },
          ],
        }
      : {}),
  };

  const todayCount = await prisma.job.count({
    where: { active: true, createdAt: { gte: todayStart } },
  });
  const usingFallback = todayCount === 0;
  const effectiveStart = usingFallback ? recentFallbackStart(todayStart) : todayStart;
  const optionWhere = { active: true, createdAt: { gte: effectiveStart } };
  const where = { ...optionWhere, ...baseFilters };

  const [total, rawJobs, sources, areas, seniorities, workModels] = await Promise.all([
    prisma.job.count({ where }),
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
  ]);

  const jobs = interleaveByArea(rawJobs).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const sourceOptions = sources.map((item) => item.source);
  const areaOptions = areas.map((item) => item.area);
  const seniorityOptions = seniorities.map((item) => item.seniority);
  const workModelOptions = workModels.map((item) => item.workModel);

  function pageHref(nextPage: number): string {
    const next = new URLSearchParams();
    if (nextPage > 1) next.set("page", String(nextPage));
    if (source) next.set("source", source);
    if (q) next.set("q", q);
    if (area) next.set("area", area);
    if (seniority) next.set("seniority", seniority);
    if (workModel) next.set("workModel", workModel);
    if (entryLevel) next.set("entryLevel", "yes");
    const query = next.toString();
    return query ? `/vagas-de-hoje?${query}` : "/vagas-de-hoje";
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-[#070b12] text-neutral-950 dark:text-neutral-50">
      <PublicSiteHeader />

      <section className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-3 py-1 text-xs font-semibold">
              <CalendarDays className="h-4 w-4" />
              Atualizado automaticamente
            </span>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
              {usingFallback ? "Vagas recentes" : "Vagas de hoje"}
            </h1>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
              {usingFallback
                ? "A busca de hoje ainda nao rodou; enquanto isso, mostramos vagas recentes ja salvas, misturadas por area."
                : "Uma lista gratuita com vagas novas coletadas hoje, misturadas por area. Para ver aderencia ao seu curriculo, use o feed personalizado."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-72">
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
              <p className="text-xs text-neutral-500">{usingFallback ? "Vagas recentes" : "Vagas hoje"}</p>
              <p className="mt-1 text-2xl font-bold">{total}</p>
            </div>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
              <p className="text-xs text-neutral-500">Fontes</p>
              <p className="mt-1 text-2xl font-bold">{sourceOptions.length}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          {PUBLIC_JOB_CATEGORIES.slice(0, 8).map((category) => (
            <Link
              key={category.slug}
              href={`/vagas/${category.slug}`}
              className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-1.5 text-neutral-700 dark:text-neutral-300 hover:border-blue-300 hover:text-blue-700 dark:hover:text-blue-300"
            >
              {category.h1.replace(/^Vagas\s*/i, "")}
            </Link>
          ))}
        </div>

        <form className="grid gap-3 md:grid-cols-[1fr_180px_180px_180px_180px_auto] rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar por cargo, area ou local"
              className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </label>
          <select name="area" defaultValue={area} className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-blue-500">
            <option value="">Todas as areas</option>
            {areaOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select name="seniority" defaultValue={seniority} className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-blue-500">
            <option value="">Todos os niveis</option>
            {seniorityOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select name="workModel" defaultValue={workModel} className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-blue-500">
            <option value="">Todos os modelos</option>
            {workModelOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <label className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <select name="source" defaultValue={source} className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500">
              <option value="">Todas as fontes</option>
              {sourceOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <button className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors">
            Filtrar
          </button>
          <label className="md:col-span-6 inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input type="checkbox" name="entryLevel" value="yes" defaultChecked={entryLevel} className="h-4 w-4 rounded border-neutral-300" />
            Mostrar somente vagas sem experiencia, estagio, jovem aprendiz ou primeiro emprego
          </label>
        </form>

        {jobs.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-8 text-center">
            <Briefcase className="h-8 w-8 mx-auto text-neutral-400" />
            <p className="mt-3 font-semibold">Nenhuma vaga encontrada para estes filtros.</p>
            <p className="mt-1 text-sm text-neutral-500">Tente remover algum filtro ou voltar mais tarde.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {jobs.map((job) => (
              <article key={job.id} className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="min-w-0">
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                      {job.jobTitle}
                    </a>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      <span>via {job.source}</span>
                      {job.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                      )}
                      <span>{formatDateTime(job.createdAt)}</span>
                      {job.area && <span>{job.area}</span>}
                      {job.seniority && <span>{job.seniority}</span>}
                      {job.workModel && <span>{job.workModel}</span>}
                      {job.entryLevel && <span>Entrada</span>}
                    </div>
                  </div>
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1 rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900 shrink-0">
                    Ver vaga
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">{cleanSnippet(job.jobText)}...</p>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="flex items-center justify-between gap-3">
            <Link href={pageHref(Math.max(1, page - 1))} aria-disabled={page <= 1} className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-40">
              Anterior
            </Link>
            <span className="text-sm text-neutral-500">Pagina {page} de {totalPages}</span>
            <Link href={pageHref(Math.min(totalPages, page + 1))} aria-disabled={page >= totalPages} className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-40">
              Proxima
            </Link>
          </nav>
        )}

        <div className="rounded-lg bg-blue-600 p-5 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="font-semibold">Quer saber quais dessas vagas combinam com voce?</p>
            <p className="text-sm text-blue-100 mt-1">Crie uma conta e veja o feed ordenado por aderencia ao seu curriculo.</p>
          </div>
          <Link href="/register" className="rounded-lg bg-white text-blue-700 px-4 py-2 text-sm font-semibold text-center">
            Ver meu feed personalizado
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
