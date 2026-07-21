import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ContentPage } from "@/components/content-page";
import { AllJobsList } from "@/app/feed/AllJobsList";
import { Pagination } from "@/components/Pagination";
import { AllJobsFilterForm } from "./AllJobsFilterForm";
import { locationSearchVariants, stateSearchVariants } from "@/lib/brazil-locations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Todas as vagas",
  description:
    "Explore todas as vagas coletadas pelo CarreirasMatch. Crie sua conta grátis para ver a lista completa e receber as vagas que combinam com você.",
};

const PREVIEW_VISIBLE = 6;
const PREVIEW_TEASER = 3;
const PAGE_SIZE = 20;

export default async function AllJobsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    area?: string;
    city?: string;
    state?: string;
    workModel?: string;
    contractType?: string;
  }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { q, area, city, state, workModel, contractType } = params;

  const andFilters: any[] = [];
  if (q?.trim()) {
    andFilters.push({
      OR: locationSearchVariants(q.trim()).flatMap((variant) => [
        { jobTitle: { contains: variant, mode: "insensitive" } },
        { jobText: { contains: variant, mode: "insensitive" } },
      ]),
    });
  }
  if (area) {
    andFilters.push({ area: { contains: area, mode: "insensitive" } });
  }
  if (workModel) {
    andFilters.push({ workModel: { contains: workModel, mode: "insensitive" } });
  }
  if (contractType) {
    andFilters.push({ contractType: { contains: contractType, mode: "insensitive" } });
  }
  if (city) {
    andFilters.push({
      OR: locationSearchVariants(city).map((variant) => ({ location: { contains: variant, mode: "insensitive" } })),
    });
  }
  if (state) {
    andFilters.push({
      OR: stateSearchVariants(state).map((variant) => ({ location: { contains: variant, mode: "insensitive" } })),
    });
  }

  const whereClause = andFilters.length > 0 ? { active: true, AND: andFilters } : { active: true };

  const [totalJobs, jobs] = await Promise.all([
    prisma.job.count({ where: whereClause }),
    prisma.job.findMany({
      where: whereClause,
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
      },
    }),
  ]);

  const totalPages = Math.ceil(totalJobs / PAGE_SIZE);

  const initialValues = { q, area, city, state, workModel, contractType };

  if (session?.user?.id) {
    // Logado: exibe a interface interna completa sem filtros/desfoques
    return (
      <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Todas as vagas</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Lista completa de todas as vagas ativas no banco de dados, sem filtros de perfil.
            </p>
          </div>
          <p className="text-sm text-neutral-500 shrink-0 font-medium">{totalJobs} vaga(s) encontrada(s).</p>
        </div>

        <AllJobsFilterForm initialValues={initialValues} />

        <AllJobsList jobs={jobs} />
        <div className="mt-6">
          <Pagination page={page} totalPages={totalPages} basePath="/todas-as-vagas" searchParams={{ q, area, workModel, city, state, contractType }} />
        </div>
      </div>
    );
  }

  // Visitante deslogado: mostra preview e convite para criar conta
  const visible = jobs.slice(0, PREVIEW_VISIBLE);
  const teaser = jobs.slice(PREVIEW_VISIBLE, PREVIEW_VISIBLE + PREVIEW_TEASER);
  const remaining = Math.max(0, totalJobs - visible.length);

  return (
    <ContentPage
      eyebrow="Banco completo de vagas"
      title="Todas as vagas"
      description={`São ${totalJobs.toLocaleString("pt-BR")} vagas ativas coletadas de várias fontes. Filtre abaixo e veja as oportunidades disponíveis.`}
      wide
    >
      <div className="mb-6">
        <AllJobsFilterForm initialValues={initialValues} />
      </div>

      <AllJobsList jobs={visible} />

      {teaser.length > 0 && (
        <div className="relative mt-4">
          <div className="pointer-events-none select-none blur-sm" aria-hidden>
            <AllJobsList jobs={teaser} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white dark:via-neutral-950/70 dark:to-neutral-950" />
        </div>
      )}

      <div className="mt-2 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-6 text-center">
        <p className="text-lg font-bold">
          {remaining > 0
            ? `Mais ${remaining.toLocaleString("pt-BR")} vagas esperando por você`
            : "Desbloqueie a lista completa"}
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-lg mx-auto">
          Crie sua conta grátis para ver todas as vagas, salvar as favoritas e
          receber as que mais combinam com o seu currículo.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href="/register"
            className="rounded-xl bg-blue-600 text-white font-semibold px-6 py-2.5 hover:bg-blue-700 transition-colors"
          >
            Criar conta grátis
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 font-semibold px-6 py-2.5 hover:bg-white dark:hover:bg-neutral-900 transition-colors"
          >
            Já tenho conta
          </Link>
        </div>
      </div>
    </ContentPage>
  );
}
