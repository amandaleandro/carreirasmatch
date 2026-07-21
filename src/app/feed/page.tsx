import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateFeedMatches, FEED_PAGE_SIZE } from "@/lib/job-feed";
import { CareerTrack } from "@/components/analysis-display";
import { deriveJobTags, tierFromScore, bypassesLocationFilter, isEntryLevelJob } from "@/lib/feed-tags";
import { FeedList } from "./FeedList";
import { AllJobsList } from "./AllJobsList";
import { AddJobForm } from "./AddJobForm";
import { FetchJobsButton } from "./FetchJobsButton";
import { Pagination } from "./Pagination";
import { FeedFilters } from "./FeedFilters";
import { ShareJobCard } from "./ShareJobCard";

export const dynamic = "force-dynamic";

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="7.5" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 7.5v-2a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2M3.5 12.5h17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 16.5 10 10l4 4 6-6.5M16 7.5h4v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MinusCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TrendDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 7.5 10 14l4-4 6 6.5M16 16.5h4v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
    seniority?: string;
    location?: string;
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
    // Sem currículo ainda: mostra TODAS as vagas disponíveis (sem score de match),
    // com um convite para o diagnóstico, que destrava o ranking personalizado.
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
      <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Feed de vagas</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Explore todas as vagas disponíveis. Envie seu currículo para vermos o
            quanto cada uma combina com você e destravar a análise completa.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <p className="font-semibold">Quer ver o quanto cada vaga combina com você?</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Faça seu diagnóstico gratuito: a gente ordena as vagas pela sua cara e
              libera a análise completa de cada uma.
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 rounded-xl bg-blue-600 text-white font-semibold px-5 py-2.5 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all text-center"
          >
            Fazer meu diagnóstico
          </Link>
        </div>

        <p className="text-sm text-neutral-500">{totalJobs} vaga(s) disponível(is).</p>
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

  const total = enriched.length;
  const strong = enriched.filter((e) => e.match.fitScore >= 75).length;
  const medium = enriched.filter((e) => e.match.fitScore >= 50 && e.match.fitScore < 75).length;
  const low = enriched.filter((e) => e.match.fitScore < 50).length;

  const workModels = Array.from(new Set(enriched.map((e) => e.tags.workModel).filter(Boolean))) as string[];
  const areas = Array.from(new Set(enriched.map((e) => e.tags.area).filter(Boolean))) as string[];
  const seniorities = Array.from(new Set(enriched.map((e) => e.tags.seniority).filter(Boolean))) as string[];
  const locations = Array.from(new Set(enriched.map((e) => e.tags.location).filter(Boolean))) as string[];
  const contractTypes = Array.from(new Set(enriched.map((e) => e.tags.contractType).filter(Boolean))) as string[];

  let filtered = enriched;
  if (params.tier === "strong") filtered = filtered.filter((e) => e.match.fitScore >= 75);
  else if (params.tier === "medium")
    filtered = filtered.filter((e) => e.match.fitScore >= 50 && e.match.fitScore < 75);
  else if (params.tier === "low") filtered = filtered.filter((e) => e.match.fitScore < 50);

  if (params.workModel) filtered = filtered.filter((e) => e.tags.workModel === params.workModel);
  if (params.area) filtered = filtered.filter((e) => e.tags.area === params.area);
  if (params.seniority) filtered = filtered.filter((e) => e.tags.seniority === params.seniority);
  if (params.contractType) filtered = filtered.filter((e) => e.tags.contractType === params.contractType);
  if (params.entryLevel === "yes") filtered = filtered.filter((e) => isEntryLevelJob(e.match.job));
  if (params.location) {
    filtered = filtered.filter(
      (e) => bypassesLocationFilter(e.tags.workModel) || e.tags.location === params.location
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
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
            Recomendações para você
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Feed de vagas</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Escolhemos essas vagas a partir do seu currículo mais recente e
            colocamos primeiro as que mais combinam com você.
          </p>
        </div>
        <span className="text-sm text-neutral-500 flex items-center gap-1.5 pt-1">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5M20 12a8 8 0 0 1-13.7 5.7L4 15.5M4 4v4.5h4.5M20 20v-4.5h-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Atualizado agora
        </span>
      </div>

      {!behavioralResult && (
        <div className="rounded-3xl border border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50/60 to-indigo-50/40 dark:from-blue-950/20 dark:to-indigo-950/10 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/50">
              ⚡ Teste Comportamental Requerido
            </span>
            <h3 className="font-bold text-lg leading-tight">Complete seu diagnóstico de Soft Skills</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
              Realize o teste comportamental de 5 minutos para mapear seus traços de liderança, comunicação e estilo de trabalho. Seu resultado será cruzado com cada uma das vagas do seu feed e adicionado ao diagnóstico de currículo.
            </p>
          </div>
          <Link
            href="/tools/behavioral-test"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 shadow-md shadow-blue-600/25 transition-all shrink-0 cursor-pointer w-full md:w-auto justify-center"
          >
            <span>Iniciar Teste Comportamental</span>
            <span>→</span>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-sm shadow-slate-900/5 flex flex-col justify-between">
          <div>
            <div className="flex items-start gap-3 mb-4">
              <span className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <LinkIcon className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="font-semibold">Achou uma vaga por aí?</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Cole o link aqui que a gente coloca na sua lista.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <AddJobForm />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-sm shadow-slate-900/5 flex flex-col justify-between">
          <div>
            <div className="flex items-start gap-3 mb-4">
              <span className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <SparkleIcon className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="font-semibold">Deixe com a gente</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Buscamos vagas novas que têm tudo a ver com o seu perfil.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <FetchJobsButton />
          </div>
        </div>

        {behavioralResult && (
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-sm shadow-slate-900/5 flex flex-col justify-between">
            <div>
              <div className="flex items-start gap-3 mb-3">
                <span className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <span className="text-base">🧠</span>
                </span>
                <div>
                  <p className="font-semibold">Seu perfil comportamental</p>
                  <p className="text-xs text-neutral-500">Última avaliação realizada</p>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {behavioralResult.personalityLabel}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                  {behavioralResult.summary}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
              <Link
                href="/tools/behavioral-test"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Ver resultado completo ou refazer →
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          icon={<BriefcaseIcon className="h-5 w-5" />}
          iconClass="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
          label="Total de vagas encontradas"
          value={total}
          hint="No seu feed"
        />
        <StatTile
          icon={<TrendUpIcon className="h-5 w-5" />}
          iconClass="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
          label="Matches fortes"
          value={strong}
          hint={total > 0 ? `${Math.round((strong / total) * 100)}% do total` : "0% do total"}
        />
        <StatTile
          icon={<MinusCircleIcon className="h-5 w-5" />}
          iconClass="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
          label="Vagas medianas"
          value={medium}
          hint={total > 0 ? `${Math.round((medium / total) * 100)}% do total` : "0% do total"}
        />
        <StatTile
          icon={<TrendDownIcon className="h-5 w-5" />}
          iconClass="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"
          label="Baixa aderência"
          value={low}
          hint={total > 0 ? `${Math.round((low / total) * 100)}% do total` : "0% do total"}
        />
      </div>

      <FeedFilters
        workModels={workModels}
        areas={areas}
        seniorities={seniorities}
        locations={locations}
        contractTypes={contractTypes}
        current={{
          tier: params.tier,
          workModel: params.workModel,
          area: params.area,
          seniority: params.seniority,
          location: params.location,
          entryLevel: params.entryLevel,
          contractType: params.contractType,
          sort: params.sort,
        }}
      />

      <FeedList
        matches={pageMatches}
        resumeId={resume.id}
        defaultCareerTrack={(latestAnalysis?.careerTrack as CareerTrack) ?? "growth"}
      />

      <Pagination page={page} totalPages={totalPages} searchParams={params} />

      <ShareJobCard />
    </div>
  );
}

function StatTile({
  icon,
  iconClass,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 shadow-sm shadow-slate-900/5 flex items-start gap-3">
      <span className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
        <p className="text-2xl font-bold mt-0.5">{value}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{hint}</p>
      </div>
    </div>
  );
}
