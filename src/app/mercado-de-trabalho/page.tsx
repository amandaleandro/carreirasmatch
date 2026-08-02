import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ContentPage } from "@/components/content-page";
import { locationSlug } from "@/lib/location-slug";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Mercado de trabalho por cidade",
  description: "Veja cidades, cargos e faixas salariais que aparecem nas oportunidades públicas.",
  alternates: { canonical: "/mercado-de-trabalho" },
};

function salaryNumber(value: string) {
  const match = value.replace(/\./g, "").replace(",", ".").match(/[\d]+(?:\.\d{2})?/);
  return match ? Number(match[0]) : null;
}

export default async function LaborMarketPage() {
  const [cities, titles, salaryRows] = await Promise.all([
    prisma.publicOpportunity.groupBy({
      by: ["state", "city"],
      where: { active: true, city: { not: "" } },
      _count: { _all: true },
      orderBy: { _count: { city: "desc" } },
      take: 30,
    }),
    prisma.publicOpportunity.groupBy({
      by: ["title"],
      where: { active: true },
      _count: { _all: true },
      orderBy: { _count: { title: "desc" } },
      take: 30,
    }),
    prisma.publicOpportunity.findMany({
      where: { active: true, salary: { not: "" } },
      select: { salary: true },
      take: 2000,
    }),
  ]);
  const salaries = salaryRows.map((row) => salaryNumber(row.salary)).filter((value): value is number => value !== null && value > 0);
  const average = salaries.length ? salaries.reduce((sum, value) => sum + value, 0) / salaries.length : null;

  return (
    <ContentPage eyebrow="Dados do mercado" title="Onde estão as oportunidades" description="Painel atualizado a partir das vagas e boletins coletados em fontes públicas." wide>
      <JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Mercado de trabalho", path: "/mercado-de-trabalho" }])} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border p-5 dark:border-neutral-800"><p className="text-xs text-neutral-500">Cidades monitoradas</p><p className="mt-2 text-3xl font-bold">{cities.length}</p></div>
        <div className="rounded-2xl border p-5 dark:border-neutral-800"><p className="text-xs text-neutral-500">Cargos identificados</p><p className="mt-2 text-3xl font-bold">{titles.length}</p></div>
        <div className="rounded-2xl border p-5 dark:border-neutral-800"><p className="text-xs text-neutral-500">Salário médio informado</p><p className="mt-2 text-3xl font-bold">{average ? average.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Sem dados"}</p></div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border p-5 dark:border-neutral-800">
          <h2 className="font-bold">Cidades com mais publicações</h2>
          <div className="mt-4 space-y-3">
            {cities.map((item) => (
              <div key={`${item.state}:${item.city}`} className="flex items-center justify-between gap-3 text-sm">
                <Link className="font-semibold text-blue-600" href={`/vagas-publicas/${item.state.toLowerCase()}/${locationSlug(item.city)}`}>{item.city}, {item.state}</Link>
                <div className="flex items-center gap-3">
                  <a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(`${item.city}, ${item.state}, Brasil`)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-neutral-500">Ver no mapa</a>
                  <strong>{item._count._all}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border p-5 dark:border-neutral-800">
          <h2 className="font-bold">Cargos mais publicados</h2>
          <div className="mt-4 space-y-3">
            {titles.map((item) => (
              <div key={item.title} className="flex justify-between gap-3 text-sm">
                <Link className="truncate text-blue-600" href={`/vagas-publicas?q=${encodeURIComponent(item.title)}`}>{item.title}</Link>
                <strong>{item._count._all}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-2xl border p-5 dark:border-neutral-800">
        <h2 className="font-bold">Use esses dados para agir</h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Encontrou a cidade ou o cargo certo? O CarreirasMatch ajuda no próximo passo:{" "}
          <Link href="/analise" className="font-semibold text-blue-600 hover:underline">compare seu currículo com uma vaga real</Link>,{" "}
          <Link href="/cursos-gratuitos" className="font-semibold text-blue-600 hover:underline">feche uma lacuna com um curso gratuito</Link>{" "}
          ou veja o{" "}
          <Link href="/concursos" className="font-semibold text-blue-600 hover:underline">radar de concursos e vestibulares</Link>.
        </p>
      </section>
    </ContentPage>
  );
}
