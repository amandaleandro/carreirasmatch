import type { Metadata } from "next";
import type { Prisma } from "@/generated/prisma/client";
import Link from "next/link";
import {
  Search,
  MapPin,
  Building2,
  Filter,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Sparkles,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ContentPage } from "@/components/content-page";
import { JobAlertForm } from "@/components/job-alert-form";
import { PublicOpportunityActions } from "@/components/public-opportunity-actions";
import { locationSlug } from "@/lib/location-slug";
import { locationSearchVariants } from "@/lib/brazil-locations";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Radar de Vagas Públicas, SINE e Prefeituras | CarreirasMatch",
  description: "Pesquise vagas oficiais por cargo, cidade e estado e crie alertas gratuitos.",
  alternates: { canonical: "/vagas-publicas" },
};

export default async function PublicJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string; city?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const state = params.state?.trim().toUpperCase() ?? "";
  const city = params.city?.trim() ?? "";

  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { professionalArea: true, interestedRoles: true, city: true, state: true },
      })
    : null;

  const roleTerms = (() => {
    try {
      const roles = JSON.parse(user?.interestedRoles ?? "[]");
      return Array.isArray(roles) ? roles.filter((role): role is string => typeof role === "string").slice(0, 5) : [];
    } catch {
      return [];
    }
  })();

  const andFilters: Prisma.PublicOpportunityWhereInput[] = [];
  if (state) andFilters.push({ state });
  if (city) {
    andFilters.push({
      OR: locationSearchVariants(city).map((variant) => ({ city: { contains: variant, mode: "insensitive" } })),
    });
  }
  if (query) {
    andFilters.push({
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { area: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    });
  }

  const opportunities = await prisma.publicOpportunity.findMany({
    where: {
      active: true,
      ...(andFilters.length > 0 ? { AND: andFilters } : {}),
    },
    include: { source: { select: { name: true } }, _count: { select: { clicks: true, reports: true } } },
    orderBy: [{ publishedAt: "desc" }, { lastSeenAt: "desc" }],
    take: 100,
  });

  const recommended = !query && user
    ? opportunities.filter((item) => {
        const text = `${item.title} ${item.area}`.toLowerCase();
        return [user.professionalArea, ...roleTerms].some((term) => term && text.includes(term.toLowerCase()));
      })
    : [];

  const displayed = recommended.length ? [...recommended, ...opportunities.filter((item) => !recommended.includes(item))] : opportunities;

  const cityGroups = await prisma.publicOpportunity.groupBy({
    by: ["state", "city"],
    where: { active: true, city: { not: "" }, state: { not: "" } },
    _count: { _all: true },
    orderBy: { _count: { city: "desc" } },
    take: 12,
  });

  return (
    <ContentPage
      eyebrow="Radar de Oportunidades Públicas"
      title="Vagas de SINEs & Prefeituras"
      description="Pesquise oportunidades oficiais verificadas recentemente e confirme os detalhes diretamente no portal responsável."
      maxWidthClass="max-w-6xl"
    >
      <div className="space-y-8">
        {/* Filter Bar Form */}
        <form className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Filtrar Radar de Vagas
            </span>
            {(query || state || city) && (
              <Link href="/vagas-publicas" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                Limpar busca
              </Link>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_90px_1fr_auto]">
            <div className="relative min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Cargo, área ou palavra-chave..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-3 py-2.5 text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
              />
            </div>
            <input
              name="state"
              defaultValue={state}
              maxLength={2}
              placeholder="UF"
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm uppercase text-center outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-all font-semibold"
            />
            <div className="relative min-w-0">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                name="city"
                defaultValue={city}
                placeholder="Cidade..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-3 py-2.5 text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-semibold transition-colors shadow-md shadow-blue-500/20 inline-flex items-center justify-center gap-1.5"
            >
              <Filter className="w-4 h-4" />
              <span>Buscar</span>
            </button>
          </div>
        </form>

        {/* Popular Cities Pills Bar */}
        {cityGroups.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              Cidades com mais publicações:
            </span>
            <div className="flex flex-wrap gap-2">
              {cityGroups.map((group) => (
                <Link
                  key={`${group.state}:${group.city}`}
                  href={`/vagas-publicas/${group.state.toLowerCase()}/${locationSlug(group.city)}`}
                  className="rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-2xs inline-flex items-center gap-1.5"
                >
                  <span>{group.city}, {group.state}</span>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {group._count._all}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Job Alert Box */}
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-5 shadow-2xs">
          <JobAlertForm initialQuery={query} initialCity={city || user?.city || ""} initialState={state || user?.state || ""} />
        </div>

        {/* Recommended Tag */}
        {recommended.length > 0 && (
          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-3.5 py-2 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>{recommended.length} oportunidade(s) combinam diretamente com seu perfil!</span>
          </div>
        )}

        {/* Opportunities List Grid */}
        {displayed.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-10 text-center shadow-2xs space-y-3">
            <Building2 className="h-10 w-10 mx-auto text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Nenhuma vaga pública encontrada com esses filtros
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              Tente redefinir a cidade, estado ou cargo para visualizar outras oportunidades do radar.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {displayed.map((item, index) => {
              const isRec = index < recommended.length;
              return (
                <article
                  key={item.id}
                  className={`group rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                    isRec
                      ? "border-emerald-300 dark:border-emerald-900/80 bg-emerald-50/20 dark:bg-emerald-950/10 hover:border-emerald-400"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/60"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        {item.official && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2.5 py-0.5 text-xs font-bold border border-blue-500/20">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Fonte oficial
                          </span>
                        )}
                        <span className="text-slate-500 dark:text-slate-400 font-semibold inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {item.state}{item.city ? ` • ${item.city}` : ""}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.lastSeenAt.toLocaleDateString("pt-BR")}</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Órgão / Fonte: <span className="text-slate-900 dark:text-slate-200 font-bold">{item.source.name}</span>
                    </p>

                    {(item.salary || item.education || item.experience) && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[item.salary, item.education, item.experience].filter(Boolean).map((detail, dIdx) => (
                          <span
                            key={dIdx}
                            className="rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 text-xs font-medium border border-slate-200/60 dark:border-slate-700/60"
                          >
                            {detail}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{item._count.clicks} acesso(s)</span>
                      </span>
                    </div>

                    {item.riskScore >= 30 && (
                      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs font-medium text-amber-700 dark:text-amber-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                        <span>Atenção: esta publicação contém sinais que merecem conferência antes de enviar dados.</span>
                      </div>
                    )}

                    <PublicOpportunityActions id={item.id} url={item.url} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </ContentPage>
  );
}
