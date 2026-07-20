import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ContentPage } from "@/components/content-page";
import { RadarList } from "@/components/radar-list";
import { Pagination } from "@/components/Pagination";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Radar de concursos: novos editais e concursos públicos",
  description:
    "Acompanhe os concursos públicos mais recentes: novos editais, inscrições abertas, provas e convocações, reunidos em um só lugar.",
  alternates: { canonical: "/concursos" },
};

const PAGE_SIZE = 20;

export default async function ConcursosRadarPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [items, totalItems] = await Promise.all([
    prisma.radarItem.findMany({
      where: { kind: "concurso", active: true },
      orderBy: [{ publishedAt: "desc" }, { lastSeenAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.radarItem.count({
      where: { kind: "concurso", active: true },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  return (
    <ContentPage
      eyebrow="Radar de concursos"
      title="Novos concursos públicos"
      description="Os editais e novidades de concursos mais recentes, reunidos automaticamente de fontes especializadas. Clique para ver o edital completo na fonte."
      wide
    >
      <RadarList
        items={items}
        emptyLabel="Ainda não há concursos no radar. O conteúdo é atualizado automaticamente ao longo do dia."
      />
      <div className="mt-8">
        <Pagination page={page} totalPages={totalPages} basePath="/concursos" />
      </div>
    </ContentPage>
  );
}
