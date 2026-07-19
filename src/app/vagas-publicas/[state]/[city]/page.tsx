import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ContentPage } from "@/components/content-page";
import { JobAlertForm } from "@/components/job-alert-form";
import { PublicOpportunityActions } from "@/components/public-opportunity-actions";
import { locationSlug } from "@/lib/location-slug";

export const dynamic = "force-dynamic";

async function resolveLocation(stateSlug: string, citySlug: string) {
  const state = stateSlug.toUpperCase();
  if (!/^[A-Z]{2}$/.test(state)) return null;
  const cities = await prisma.publicOpportunity.findMany({
    where: { active: true, state, city: { not: "" } },
    distinct: ["city"],
    select: { city: true },
  });
  const city = cities.find((item) => locationSlug(item.city) === citySlug)?.city;
  return city ? { state, city } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ state: string; city: string }> }): Promise<Metadata> {
  const value = await params;
  const location = await resolveLocation(value.state, value.city);
  if (!location) return {};
  return {
    title: `Vagas em ${location.city}, ${location.state}`,
    description: `Vagas oficiais de SINE e prefeitura em ${location.city}. Consulte oportunidades e crie alertas gratuitos.`,
    alternates: { canonical: `/vagas-publicas/${value.state}/${value.city}` },
  };
}

export default async function JobsByCityPage({ params }: { params: Promise<{ state: string; city: string }> }) {
  const value = await params;
  const location = await resolveLocation(value.state, value.city);
  if (!location) notFound();
  const jobs = await prisma.publicOpportunity.findMany({
    where: { active: true, state: location.state, city: location.city },
    include: { source: { select: { name: true } } },
    orderBy: [{ publishedAt: "desc" }, { lastSeenAt: "desc" }],
    take: 200,
  });

  return (
    <ContentPage eyebrow="Vagas por cidade" title={`Vagas em ${location.city}, ${location.state}`} description={`Oportunidades encontradas em fontes oficiais e verificadas recentemente para ${location.city}.`} wide>
      <Link href="/vagas-publicas" className="text-sm font-semibold text-blue-600">Pesquisar em outras cidades</Link>
      <div className="mt-6"><JobAlertForm initialCity={location.city} initialState={location.state} /></div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {jobs.map((job) => (
          <article key={job.id} className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
            <span className="text-xs font-semibold text-blue-600">Fonte oficial • {job.source.name}</span>
            <h2 className="mt-2 font-bold">{job.title}</h2>
            <p className="mt-3 text-xs text-neutral-500">Verificada em {job.lastSeenAt.toLocaleDateString("pt-BR")}</p>
            <PublicOpportunityActions id={job.id} url={job.url} />
          </article>
        ))}
      </div>
    </ContentPage>
  );
}
