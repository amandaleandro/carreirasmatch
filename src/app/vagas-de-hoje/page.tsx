import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, ExternalLink, Filter, MapPin, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PUBLIC_JOB_CATEGORIES } from "@/lib/public-job-categories";
import { ContentPage } from "@/components/content-page";
import { cleanJobSnippet } from "@/lib/job-snippet";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vagas de hoje",
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

  const [total, allActiveCount, rawJobs, sources, areas, seniorities, workModels] = await Promise.all([
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
    <ContentPage
      eyebrow="Atualizado automaticamente"
      title={usingFallback ? "Vagas recentes" : "Vagas de hoje"}
      description={
        usingFallback
          ? "A busca de hoje ainda não rodou; enquanto isso, mostramos vagas recentes já salvas, misturadas por área."
          : "Uma lista gratuita com vagas novas coletadas hoje, misturadas por área. Para ver aderência ao seu currículo, use o feed personalizado."
      }
      wide
    >
      <div className="flex flex-wrap gap-3">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 px-5 py-3">
          <p className="text-xs text-neutral-500">{usingFallback ? "Vagas recentes" : "Vagas hoje"}</p>
          <p className="mt-1 text-2xl font-bold">{total}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 px-5 py-3">
          <p className="text-xs text-neutral-500">Fontes</p>
          <p className="mt-1 text-2xl font-bold">{sourceOptions.length}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-semibold">Estas são só as vagas de hoje.</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Temos <strong>{allActiveCount.toLocaleString("pt-BR")} vagas</strong> no total. Crie sua conta grátis para ver todas e receber as que combinam com você.
          </p>
        </div>
        <Link
          href="/todas-as-vagas"
          className="shrink-0 rounded-xl bg-blue-600 text-white font-semibold px-5 py-2.5 hover:bg-blue-700 transition-colors text-center whitespace-nowrap"
        >
          Ver todas as vagas
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        {PUBLIC_JOB_CATEGORIES.slice(0, 8).map((category) => (
          <Link
            key={category.slug}
            href={`/vagas/${category.slug}`}
            className="rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-neutral-700 dark:text-neutral-300 hover:border-blue-300 hover:text-blue-700 dark:hover:text-blue-300"
          >
            {category.h1.replace(/^Vagas\s*/i, "")}
          </Link>
        ))}
      </div>

      <form className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
        <label className="relative min-w-0 sm:col-span-2 lg:col-span-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por cargo, área ou local"
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </label>
        <select name="area" defaultValue={area} className="w-full min-w-0 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-blue-500">
          <option value="">Todas as áreas</option>
          {areaOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <select name="seniority" defaultValue={seniority} className="w-full min-w-0 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-blue-500">
          <option value="">Todos os níveis</option>
          {seniorityOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <select name="workModel" defaultValue={workModel} className="w-full min-w-0 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-blue-500">
          <option value="">Todos os modelos</option>
          {workModelOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <label className="relative min-w-0">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <select name="source" defaultValue={source} className="w-full min-w-0 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500">
            <option value="">Todas as fontes</option>
            {sourceOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <button className="rounded-xl bg-blue-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors">
          Filtrar
        </button>
        <label className="sm:col-span-2 lg:col-span-3 inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input type="checkbox" name="entryLevel" value="yes" defaultChecked={entryLevel} className="h-4 w-4 rounded border-neutral-300" />
          Mostrar somente vagas sem experiência, estágio, jovem aprendiz ou primeiro emprego
        </label>
      </form>

      {jobs.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 text-center">
          <Briefcase className="h-8 w-8 mx-auto text-neutral-400" />
          <p className="mt-3 font-semibold">Nenhuma vaga encontrada para estes filtros.</p>
          <p className="mt-1 text-sm text-neutral-500">Tente remover algum filtro ou voltar mais tarde.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {jobs.map((job) => (
            <article key={job.id} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
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
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1 rounded-xl border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900 shrink-0">
                  Ver vaga
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">{cleanJobSnippet(job.jobText)}...</p>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-between gap-3">
          <Link href={pageHref(Math.max(1, page - 1))} aria-disabled={page <= 1} className="rounded-xl border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-40">
            Anterior
          </Link>
          <span className="text-sm text-neutral-500">Página {page} de {totalPages}</span>
          <Link href={pageHref(Math.min(totalPages, page + 1))} aria-disabled={page >= totalPages} className="rounded-xl border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-40">
            Próxima
          </Link>
        </nav>
      )}

      <div className="mt-8 rounded-2xl bg-blue-600 p-5 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="font-semibold">Encontrou uma vaga interessante?</p>
          <p className="text-sm text-blue-100 mt-1">Compare com seu currículo antes de aplicar e veja os ajustes prioritários.</p>
        </div>
        <Link href="/analise" className="rounded-xl bg-white text-blue-700 px-4 py-2 text-sm font-semibold text-center">
          Analisar currículo e vaga
        </Link>
      </div>
    </ContentPage>
  );
}
