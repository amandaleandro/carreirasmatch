import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ExternalLink, MapPin, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { findPublicJobCategory, PUBLIC_JOB_CATEGORIES } from "@/lib/public-job-categories";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { cleanJobSnippet } from "@/lib/job-snippet";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function buildWhere(category: NonNullable<ReturnType<typeof findPublicJobCategory>>, q: string) {
  const and: Prisma.JobWhereInput[] = [{ active: true }];
  if (category.where.entryLevel !== undefined) and.push({ entryLevel: category.where.entryLevel });
  if (category.where.seniority) and.push({ seniority: category.where.seniority });
  if (category.where.workModel) and.push({ workModel: category.where.workModel });
  if (category.where.area) and.push({ area: category.where.area });

  const matchesTerm = (term: string): Prisma.JobWhereInput[] => [
    { jobTitle: { contains: term } },
    { jobText: { contains: term } },
    { location: { contains: term } },
  ];

  // Category synonyms are alternatives: a job matches if it contains ANY of them.
  const synonyms = category.where.q ?? [];
  if (synonyms.length > 0) {
    and.push({ OR: synonyms.flatMap(matchesTerm) });
  }

  // The user's free-text query narrows further (AND).
  if (q) {
    and.push({ OR: matchesTerm(q) });
  }

  return { AND: and };
}

export function generateStaticParams() {
  return PUBLIC_JOB_CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = findPublicJobCategory(slug);
  if (!category) return {};

  return {
    title: category.title,
    description: category.description,
  };
}

export default async function PublicJobCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const foundCategory = findPublicJobCategory(slug);
  if (!foundCategory) notFound();
  const category = foundCategory;

  const page = Math.max(1, Number(query.page) || 1);
  const q = query.q?.trim() ?? "";
  const where = buildWhere(category, q);

  const [total, jobs] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
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
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(nextPage: number): string {
    const next = new URLSearchParams();
    if (nextPage > 1) next.set("page", String(nextPage));
    if (q) next.set("q", q);
    const qs = next.toString();
    return qs ? `/vagas/${category.slug}?${qs}` : `/vagas/${category.slug}`;
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
            <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">{category.h1}</h1>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">{category.description}</p>
          </div>
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 min-w-44">
            <p className="text-xs text-neutral-500">Vagas ativas</p>
            <p className="mt-1 text-2xl font-bold">{total}</p>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 space-y-4">
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {category.editorial.intro}
          </p>

          <div>
            <h2 className="text-sm font-semibold">O que esperar destas vagas</h2>
            <ul className="mt-2 space-y-1.5">
              {category.editorial.expectations.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="rounded-md border-l-2 border-blue-500 bg-blue-50/60 dark:bg-blue-950/20 py-2 pl-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {category.editorial.tip}
          </p>
        </div>

        <form className="grid gap-3 md:grid-cols-[1fr_auto] rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar dentro desta categoria"
              className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </label>
          <button className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors">
            Filtrar
          </button>
        </form>

        <div className="flex flex-wrap gap-2 text-sm">
          {PUBLIC_JOB_CATEGORIES.map((item) => (
            <Link
              key={item.slug}
              href={`/vagas/${item.slug}`}
              className={`rounded-md border px-3 py-1.5 ${
                item.slug === category.slug
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                  : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-300"
              }`}
            >
              {item.h1.replace(/^Vagas\s*/i, "")}
            </Link>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-8 text-center">
            <p className="font-semibold">Nenhuma vaga encontrada nesta categoria.</p>
            <p className="mt-1 text-sm text-neutral-500">
              Tente outra busca ou veja as{" "}
              <Link href="/vagas-de-hoje" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                vagas de hoje
              </Link>
              .
            </p>
          </div>
        )}

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
                    {job.area && <span>{job.area}</span>}
                    {job.seniority && <span>{job.seniority}</span>}
                    {job.workModel && <span>{job.workModel}</span>}
                    {job.entryLevel && <span>Entrada</span>}
                    <span>{formatDate(job.createdAt)}</span>
                  </div>
                </div>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900 shrink-0"
                >
                  Ver vaga
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">{cleanJobSnippet(job.jobText)}...</p>
            </article>
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="flex items-center justify-between gap-3">
            <Link
              href={pageHref(Math.max(1, page - 1))}
              aria-disabled={page <= 1}
              className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-40"
            >
              Anterior
            </Link>
            <span className="text-sm text-neutral-500">
              Pagina {page} de {totalPages}
            </span>
            <Link
              href={pageHref(Math.min(totalPages, page + 1))}
              aria-disabled={page >= totalPages}
              className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-40"
            >
              Proxima
            </Link>
          </nav>
        )}

      </section>

      <SiteFooter />
    </main>
  );
}
