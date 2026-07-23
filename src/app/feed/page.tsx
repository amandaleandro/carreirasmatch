import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateFeedMatches, FEED_PAGE_SIZE } from "@/lib/job-feed";
import { CareerTrack } from "@/components/analysis-display";
import { deriveJobTags, tierFromScore, bypassesLocationFilter, isEntryLevelJob } from "@/lib/feed-tags";
import { BRAZIL_STATE_NAMES } from "@/lib/brazil-locations";
import { FeedList } from "./FeedList";
import { AllJobsList } from "./AllJobsList";
import { AddJobForm } from "./AddJobForm";
import { FetchJobsButton } from "./FetchJobsButton";
import { Pagination } from "./Pagination";
import { FeedFilters } from "./FeedFilters";
import { ShareJobCard } from "./ShareJobCard";

export const dynamic = "force-dynamic";

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 15 15 9M10 6l1.3-1.3a3.5 3.5 0 0 1 5 5L15 11M14 18l-1.3 1.3a3.5 3.5 0 0 1-5-5L9 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    tier?: string;
    workModel?: string;
    area?: string;
    subarea?: string;
    seniority?: string;
    state?: string;
    city?: string;
    entryLevel?: string;
    contractType?: string;
    sort?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const resume = await prisma.resume.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!resume) {
    const [jobs, totalJobs] = await Promise.all([
      prisma.job.findMany({
        where: { active: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * FEED_PAGE_SIZE,
        take: FEED_PAGE_SIZE,
      }),
      prisma.job.count({ where: { active: true } }),
    ]);
    const totalPages = Math.max(1, Math.ceil(totalJobs / FEED_PAGE_SIZE));

    return (
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto w-full space-y-6 font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-neutral-800 pb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-title font-bold text-[#071827] dark:text-white">Feed de vagas</h1>
            <p className="text-xs text-[#64748B] mt-1">
              Explore vagas disponíveis no mercado e analise a aderência com seu perfil.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-[#2563EB]/20 bg-[#2563EB]/5 p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="space-y-1">
            <p className="font-bold text-sm text-[#071827]">Quer ver o quanto cada vaga combina com você?</p>
            <p className="text-xs text-[#64748B]">
              Faça seu diagnóstico gratuito: ordenamos as vagas baseadas nas suas qualificações atuais.
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs px-4 py-2.5 shadow-sm shadow-[#2563EB]/25 transition-all text-center"
          >
            Fazer Diagnóstico
          </Link>
        </div>

        <p className="text-xs font-bold text-[#64748B]">{totalJobs} vaga(s) disponível(is).</p>
        <AllJobsList jobs={jobs} />
        <Pagination page={page} totalPages={totalPages} searchParams={params} />
        <ShareJobCard />
      </div>
    );
  }

  const [allMatches, latestAnalysis, behavioralResult] = await Promise.all([
    getOrCreateFeedMatches(session.user.id, resume.id, resume.rawText),
    prisma.analysis.findFirst({
      where: { resumeId: resume.id },
      orderBy: { createdAt: "desc" },
      select: { careerTrack: true },
    }),
    prisma.softSkillTestResult.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const enriched = allMatches.map((match) => ({
    match,
    tags: deriveJobTags(match.job),
    tier: tierFromScore(match.fitScore),
  }));

  const workModels = Array.from(new Set(enriched.map((e) => e.tags.workModel).filter(Boolean))) as string[];
  const areas = Array.from(new Set(enriched.map((e) => e.tags.area).filter(Boolean))) as string[];
  const subareas = Array.from(new Set(enriched.map((e) => e.tags.subarea).filter(Boolean))) as string[];
  const seniorities = Array.from(new Set(enriched.map((e) => e.tags.seniority).filter(Boolean))) as string[];
  const contractTypes = Array.from(new Set(enriched.map((e) => e.tags.contractType).filter(Boolean))) as string[];

  const states = Array.from(new Set(enriched.map((e) => e.match.job.state).filter(Boolean))).map((code) => ({
    code,
    label: BRAZIL_STATE_NAMES[code] ?? code,
  }));
  const citiesByState = enriched.reduce<Record<string, string[]>>((map, e) => {
    const { state, city } = e.match.job;
    if (!state || !city) return map;
    const set = new Set(map[state] ?? []);
    set.add(city);
    map[state] = [...set];
    return map;
  }, {});

  const effectiveTier = params.tier || "aligned";
  let filtered = enriched;
  if (effectiveTier === "strong") filtered = filtered.filter((e) => e.match.fitScore >= 75);
  else if (effectiveTier === "medium")
    filtered = filtered.filter((e) => e.match.fitScore >= 50 && e.match.fitScore < 75);
  else if (effectiveTier === "low") filtered = filtered.filter((e) => e.match.fitScore < 50);
  else if (effectiveTier === "aligned") filtered = filtered.filter((e) => e.match.fitScore >= 50);

  if (params.workModel) filtered = filtered.filter((e) => e.tags.workModel === params.workModel);
  if (params.area) filtered = filtered.filter((e) => e.tags.area === params.area);
  if (params.subarea) filtered = filtered.filter((e) => e.tags.subarea === params.subarea);
  if (params.seniority) filtered = filtered.filter((e) => e.tags.seniority === params.seniority);
  if (params.contractType) filtered = filtered.filter((e) => e.tags.contractType === params.contractType);
  if (params.entryLevel === "yes") filtered = filtered.filter((e) => isEntryLevelJob(e.match.job));
  if (params.state) {
    filtered = filtered.filter(
      (e) => bypassesLocationFilter(e.tags.workModel) || e.match.job.state === params.state
    );
  }
  if (params.city) {
    filtered = filtered.filter(
      (e) => bypassesLocationFilter(e.tags.workModel) || e.match.job.city === params.city
    );
  }

  if (params.sort === "recent") {
    filtered = [...filtered].sort(
      (a, b) => new Date(b.match.createdAt).getTime() - new Date(a.match.createdAt).getTime()
    );
  } else if (params.sort === "salary") {
    filtered = [...filtered].sort(
      (a, b) => (b.tags.salaryValue ?? -1) - (a.tags.salaryValue ?? -1)
    );
  } else {
    filtered = [...filtered].sort((a, b) => b.match.fitScore - a.match.fitScore);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / FEED_PAGE_SIZE));
  const pageMatches = filtered
    .slice((page - 1) * FEED_PAGE_SIZE, page * FEED_PAGE_SIZE)
    .map((e) => e.match);

  return (
    <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto w-full space-y-5 font-sans">
      
      {/* Título da Página Simplificado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-neutral-800 pb-4">
        <div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/15">
            Recomendações do Perfil
          </span>
          <h1 className="text-xl md:text-2xl font-title font-bold text-[#071827] dark:text-white mt-1">Feed de vagas</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Vagas ordenadas pelo grau de correspondência com seu currículo.
          </p>
        </div>
      </div>

      {/* Grid de Ações Rápidas (Compacto de 2 Colunas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-950 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <span className="h-8 w-8 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center shrink-0">
              <LinkIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="font-bold text-xs text-[#071827]">Achou uma vaga?</p>
              <p className="text-[10px] text-[#64748B] leading-relaxed">
                Cole o link abaixo para salvá-la em sua lista.
              </p>
            </div>
          </div>
          <div className="mt-3">
            <AddJobForm />
          </div>
        </div>

        <div className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-950 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <span className="h-8 w-8 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center shrink-0">
              <SparkleIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="font-bold text-xs text-[#071827]">Buscar automáticas</p>
              <p className="text-[10px] text-[#64748B] leading-relaxed">
                Buscamos novas vagas alinhadas ao seu perfil agora.
              </p>
            </div>
          </div>
          <div className="mt-3">
            <FetchJobsButton />
          </div>
        </div>
      </div>

      {/* Banners Comportamental e Desafio (Surgem apenas quando necessários) */}
      {!behavioralResult && (
        <div className="rounded-3xl border border-[#2563EB]/25 bg-gradient-to-r from-[#2563EB]/5 to-indigo-500/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#2563EB]/15 text-[#2563EB]">
              🧠 Quiz de Soft Skills
            </span>
            <p className="font-bold text-sm text-[#071827] mt-1.5">Conclua seu diagnóstico comportamental</p>
            <p className="text-xs text-[#64748B]">
              Responda o quiz de 5 minutos para incluir soft skills nos cruzamentos de vagas.
            </p>
          </div>
          <Link
            href="/tools/behavioral-test"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-4 py-2 shadow-sm transition-all shrink-0 cursor-pointer w-full sm:w-auto justify-center active:scale-[0.98]"
          >
            <span>Iniciar Teste</span>
            <span>→</span>
          </Link>
        </div>
      )}

      {/* Desafio e Compartilhamento */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] dark:bg-neutral-900 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500">
            ⚡ Desafio Match de Carreira
          </span>
          <p className="font-bold text-sm text-[#071827] mt-1.5">Gere seu Card e convide amigos</p>
          <p className="text-xs text-[#64748B]">
            Analise qualquer vaga específica para ganhar mais créditos compartilhando.
          </p>
        </div>
        <Link
          href="/desafio"
          className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-xs font-bold px-4 py-2 transition-all cursor-pointer shadow-sm w-full sm:w-auto justify-center"
        >
          <span>Participar</span>
          <span>→</span>
        </Link>
      </div>

      {/* Filtros do Feed */}
      <FeedFilters
        workModels={workModels}
        areas={areas}
        subareas={subareas}
        seniorities={seniorities}
        states={states}
        citiesByState={citiesByState}
        contractTypes={contractTypes}
        current={{
          tier: params.tier,
          workModel: params.workModel,
          area: params.area,
          subarea: params.subarea,
          seniority: params.seniority,
          state: params.state,
          city: params.city,
          entryLevel: params.entryLevel,
          contractType: params.contractType,
          sort: params.sort,
        }}
      />

      {/* Lista Principal */}
      <FeedList
        matches={pageMatches}
        resumeId={resume.id}
        defaultCareerTrack={(latestAnalysis?.careerTrack as CareerTrack) ?? "growth"}
      />

      {/* Paginação */}
      <Pagination page={page} totalPages={totalPages} searchParams={params} />

      <ShareJobCard />
    </div>
  );
}
