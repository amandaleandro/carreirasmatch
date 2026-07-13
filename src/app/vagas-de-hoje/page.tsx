import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, CalendarDays, ExternalLink, Filter, MapPin, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isEntryLevelJob } from "@/lib/feed-tags";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vagas de hoje | CarreirasMatch",
  description: "Veja vagas novas coletadas hoje pelo CarreirasMatch, sem precisar criar conta.",
};

const PAGE_SIZE = 30;

function startOfTodaySaoPaulo(): Date {
  const now = new Date();
  const spNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const spMidnight = new Date(spNow.getFullYear(), spNow.getMonth(), spNow.getDate());
  const offsetMs = now.getTime() - spNow.getTime();
  return new Date(spMidnight.getTime() + offsetMs);
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

export default async function JobsTodayPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; source?: string; q?: string; entryLevel?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const source = params.source?.trim() || "";
  const q = params.q?.trim() || "";
  const entryLevel = params.entryLevel === "yes";
  const todayStart = startOfTodaySaoPaulo();

  const where = {
    active: true,
    createdAt: { gte: todayStart },
    ...(source ? { source } : {}),
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

  const [rawTotal, rawJobs, sources] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: entryLevel ? 0 : (page - 1) * PAGE_SIZE,
      take: entryLevel ? 500 : PAGE_SIZE,
      select: {
        id: true,
        jobTitle: true,
        jobText: true,
        url: true,
        source: true,
        location: true,
        createdAt: true,
      },
    }),
    prisma.job.findMany({
      where: { active: true, createdAt: { gte: todayStart } },
      distinct: ["source"],
      orderBy: { source: "asc" },
      select: { source: true },
    }),
  ]);

  const entryFilteredJobs = entryLevel ? rawJobs.filter(isEntryLevelJob) : rawJobs;
  const total = entryLevel ? entryFilteredJobs.length : rawTotal;
  const jobs = entryLevel
    ? entryFilteredJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : entryFilteredJobs;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const sourceOptions = sources.map((item) => item.source);

  function pageHref(nextPage: number): string {
    const next = new URLSearchParams();
    if (nextPage > 1) next.set("page", String(nextPage));
    if (source) next.set("source", source);
    if (q) next.set("q", q);
    if (entryLevel) next.set("entryLevel", "yes");
    const query = next.toString();
    return query ? `/vagas-de-hoje?${query}` : "/vagas-de-hoje";
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-[#070b12] text-neutral-950 dark:text-neutral-50">
      <section className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#090d16]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="font-bold text-lg tracking-tight">
            CarreirasMatch
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-blue-600 text-white px-3 py-2 text-sm font-semibold hover:bg-blue-700"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-3 py-1 text-xs font-semibold">
              <CalendarDays className="h-4 w-4" />
              Atualizado automaticamente
            </span>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
              Vagas de hoje
            </h1>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
              Uma lista gratuita com vagas novas coletadas hoje. Para ver aderência ao seu currículo, use o feed personalizado.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-72">
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
              <p className="text-xs text-neutral-500">Vagas hoje</p>
              <p className="mt-1 text-2xl font-bold">{total}</p>
            </div>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
              <p className="text-xs text-neutral-500">Fontes</p>
              <p className="mt-1 text-2xl font-bold">{sourceOptions.length}</p>
            </div>
          </div>
        </div>

        <form className="grid gap-3 md:grid-cols-[1fr_220px_auto] rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar por cargo, tecnologia ou local"
              className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </label>
          <label className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <select
              name="source"
              defaultValue={source}
              className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Todas as fontes</option>
              {sourceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <button className="rounded-md bg-neutral-950 dark:bg-neutral-100 text-white dark:text-neutral-950 px-4 py-2 text-sm font-semibold">
            Filtrar
          </button>
          <label className="md:col-span-3 inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              name="entryLevel"
              value="yes"
              defaultChecked={entryLevel}
              className="h-4 w-4 rounded border-neutral-300"
            />
            Mostrar somente vagas sem experiencia, estagio, jovem aprendiz ou primeiro emprego
          </label>
        </form>

        {jobs.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-8 text-center">
            <Briefcase className="h-8 w-8 mx-auto text-neutral-400" />
            <p className="mt-3 font-semibold">Ainda não há vagas novas hoje.</p>
            <p className="mt-1 text-sm text-neutral-500">
              A rotina roda algumas vezes ao dia. Volte mais tarde para ver a lista atualizada.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {jobs.map((job) => (
              <article
                key={job.id}
                className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="min-w-0">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:underline"
                    >
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
                <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                  {cleanSnippet(job.jobText)}...
                </p>
              </article>
            ))}
          </div>
        )}

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
              Página {page} de {totalPages}
            </span>
            <Link
              href={pageHref(Math.min(totalPages, page + 1))}
              aria-disabled={page >= totalPages}
              className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-40"
            >
              Próxima
            </Link>
          </nav>
        )}

        <div className="rounded-lg bg-blue-600 p-5 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="font-semibold">Quer saber quais dessas vagas combinam com você?</p>
            <p className="text-sm text-blue-100 mt-1">
              Crie uma conta e veja o feed ordenado por aderência ao seu currículo.
            </p>
          </div>
          <Link
            href="/register"
            className="rounded-md bg-white text-blue-700 px-4 py-2 text-sm font-semibold text-center"
          >
            Ver meu feed personalizado
          </Link>
        </div>
      </section>
    </main>
  );
}
