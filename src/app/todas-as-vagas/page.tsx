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
    const wmLower = workModel.toLowerCase();
    if (wmLower === "remoto") {
      andFilters.push({
        OR: [
          { workModel: { contains: "remoto", mode: "insensitive" } },
          { location: { contains: "remote", mode: "insensitive" } },
          { location: { contains: "remoto", mode: "insensitive" } },
          { jobTitle: { contains: "remoto", mode: "insensitive" } },
          { jobTitle: { contains: "remote", mode: "insensitive" } },
        ]
      });
    } else if (wmLower === "hibrido") {
      andFilters.push({
        OR: [
          { workModel: { contains: "hibrido", mode: "insensitive" } },
          { location: { contains: "hybrid", mode: "insensitive" } },
          { location: { contains: "hibrido", mode: "insensitive" } },
          { jobTitle: { contains: "hibrid", mode: "insensitive" } },
          { jobTitle: { contains: "hybrid", mode: "insensitive" } },
        ]
      });
    } else if (wmLower === "presencial") {
      andFilters.push({
        OR: [
          { workModel: { contains: "presencial", mode: "insensitive" } },
          { location: { contains: "onsite", mode: "insensitive" } },
          { location: { contains: "on-site", mode: "insensitive" } },
          { location: { contains: "presencial", mode: "insensitive" } },
        ]
      });
    } else {
      andFilters.push({ workModel: { contains: workModel, mode: "insensitive" } });
    }
  }
  if (contractType) {
    andFilters.push({ contractType: { contains: contractType, mode: "insensitive" } });
  }
  if (city) {
    // Coluna estruturada `city` (mais precisa, já normalizada) OR o texto livre
    // de `location` (cobre vagas que ainda não passaram pelo backfill/parser).
    andFilters.push({
      OR: [
        ...locationSearchVariants(city).map((variant) => ({ city: { contains: variant, mode: "insensitive" } })),
        ...locationSearchVariants(city).map((variant) => ({ location: { contains: variant, mode: "insensitive" } })),
      ],
    });
  }
  if (state) {
    andFilters.push({
      OR: [
        { state: state.trim().toUpperCase() },
        ...stateSearchVariants(state).map((variant) => ({ location: { contains: variant, mode: "insensitive" } })),
      ],
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
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto w-full space-y-5 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-neutral-800 pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-title font-bold text-[#071827] dark:text-white">Todas as vagas</h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Lista de todas as vagas ativas no banco de dados, sem filtros de perfil.
            </p>
          </div>
          <p className="text-xs text-[#64748B] shrink-0 font-bold">{totalJobs} vaga(s) encontrada(s).</p>
        </div>

        <AllJobsFilterForm initialValues={initialValues} />

        <AllJobsList jobs={jobs} />
        <div className="mt-4">
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
    <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto w-full space-y-5 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-neutral-800 pb-4">
        <div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/15">
            Banco completo de vagas
          </span>
          <h1 className="text-xl md:text-2xl font-title font-bold text-[#071827] dark:text-white mt-1">Todas as vagas</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            São {totalJobs.toLocaleString("pt-BR")} vagas ativas coletadas de várias fontes.
          </p>
        </div>
      </div>

      <div className="mb-4">
        <AllJobsFilterForm initialValues={initialValues} />
      </div>

      <AllJobsList jobs={visible} />

      {teaser.length > 0 && (
        <div className="relative mt-4">
          <div className="pointer-events-none select-none blur-sm" aria-hidden>
            <AllJobsList jobs={teaser} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FFFFFF]/80 to-[#FFFFFF] dark:via-neutral-950/80 dark:to-neutral-950" />
        </div>
      )}

      <div className="mt-4 rounded-3xl border border-[#2563EB]/20 bg-[#2563EB]/5 p-5 text-center space-y-2">
        <p className="text-base font-bold text-[#071827]">
          {remaining > 0
            ? `Mais ${remaining.toLocaleString("pt-BR")} vagas esperando por você`
            : "Desbloqueie a lista completa"}
        </p>
        <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
          Crie sua conta grátis para ver todas as vagas, salvar as favoritas e receber as que mais combinam com o seu currículo.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href="/register"
            className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs px-5 py-2.5 transition-all shadow-sm shadow-[#2563EB]/25"
          >
            Criar conta grátis
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-[#E2E8F0] hover:border-[#64748B] dark:border-neutral-700 bg-white dark:bg-neutral-900 text-[#071827] dark:text-white font-bold text-xs px-5 py-2.5 transition-all"
          >
            Já tenho conta
          </Link>
        </div>
      </div>
    </div>
  );
}
