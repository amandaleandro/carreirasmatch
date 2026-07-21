import type { Metadata } from "next";
import type { Prisma } from "@/generated/prisma/client";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ContentPage } from "@/components/content-page";
import { JobAlertForm } from "@/components/job-alert-form";
import { PublicOpportunityActions } from "@/components/public-opportunity-actions";
import { locationSlug } from "@/lib/location-slug";
import { locationSearchVariants } from "@/lib/brazil-locations";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Vagas de SINE e prefeituras",
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
      eyebrow="Fontes oficiais"
      title="Vagas de SINEs e prefeituras"
      description="Pesquise oportunidades verificadas recentemente e confirme os detalhes diretamente no portal responsável."
      wide
    >
      <form className="grid gap-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800 sm:grid-cols-[1fr_100px_1fr_auto]">
        <input name="q" defaultValue={query} placeholder="Cargo ou palavra chave" className="rounded-xl border bg-transparent px-3 py-2.5 text-sm dark:border-neutral-700" />
        <input name="state" defaultValue={state} maxLength={2} placeholder="UF" className="rounded-xl border bg-transparent px-3 py-2.5 text-sm uppercase dark:border-neutral-700" />
        <input name="city" defaultValue={city} placeholder="Cidade" className="rounded-xl border bg-transparent px-3 py-2.5 text-sm dark:border-neutral-700" />
        <button className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white">Buscar</button>
      </form>

      {cityGroups.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {cityGroups.map((group) => (
            <Link key={`${group.state}:${group.city}`} href={`/vagas-publicas/${group.state.toLowerCase()}/${locationSlug(group.city)}`} className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs hover:border-blue-300 dark:border-neutral-800">
              {group.city}, {group.state} ({group._count._all})
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8">
        <JobAlertForm initialQuery={query} initialCity={city || user?.city || ""} initialState={state || user?.state || ""} />
      </div>

      {recommended.length > 0 && <p className="mt-8 text-sm font-semibold text-emerald-700 dark:text-emerald-400">{recommended.length} oportunidades combinam com seu perfil.</p>}
      {displayed.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">Nenhuma oportunidade encontrada com esses filtros. Crie um alerta para ser avisado.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {displayed.map((item, index) => (
            <article key={item.id} className={`rounded-2xl border p-5 ${index < recommended.length ? "border-emerald-300 bg-emerald-50/30 dark:border-emerald-900 dark:bg-emerald-950/10" : "border-neutral-200 dark:border-neutral-800"}`}>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {item.official && <span className="rounded-full bg-blue-50 px-2 py-1 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">Fonte oficial</span>}
                <span className="text-neutral-500">{item.state}{item.city ? ` • ${item.city}` : ""}</span>
              </div>
              <h2 className="mt-3 font-bold">{item.title}</h2>
              <p className="mt-2 text-sm text-neutral-500">{item.source.name}</p>
              {(item.salary || item.education || item.experience) && (
                <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-400">
                  {[item.salary, item.education, item.experience].filter(Boolean).join(" • ")}
                </p>
              )}
              <p className="mt-3 text-xs text-neutral-400">Verificada em {item.lastSeenAt.toLocaleDateString("pt-BR")} • {item._count.clicks} acesso(s)</p>
              {item.riskScore >= 30 && (
                <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs font-semibold text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                  Atenção: esta publicação contém sinais que merecem conferência antes de enviar dados.
                </p>
              )}
              <PublicOpportunityActions id={item.id} url={item.url} />
            </article>
          ))}
        </div>
      )}
    </ContentPage>
  );
}
