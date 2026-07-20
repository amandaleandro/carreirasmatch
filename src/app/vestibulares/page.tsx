import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ContentPage } from "@/components/content-page";
import { RadarList } from "@/components/radar-list";
import { Pagination } from "@/components/Pagination";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Radar de vestibulares: novos vestibulares, ENEM e Sisu",
  description:
    "Acompanhe os vestibulares mais recentes: novos editais, inscrições, ENEM, Sisu, ProUni e bolsas, reunidos em um só lugar.",
  alternates: { canonical: "/vestibulares" },
};

const PAGE_SIZE = 20;

export default async function VestibularesRadarPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [items, totalItems] = await Promise.all([
    prisma.radarItem.findMany({
      where: { kind: "vestibular", active: true },
      orderBy: [{ publishedAt: "desc" }, { lastSeenAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.radarItem.count({
      where: { kind: "vestibular", active: true },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  return (
    <ContentPage
      eyebrow="Radar de vestibulares"
      title="Novos vestibulares e processos seletivos"
      description="Vestibulares, ENEM, Sisu, ProUni e bolsas mais recentes, reunidos automaticamente de fontes especializadas. Clique para ver os detalhes na fonte."
      wide
    >
      <RadarList
        items={items}
        emptyLabel="Ainda não há vestibulares no radar. O conteúdo é atualizado automaticamente ao longo do dia."
      />
      <div className="mt-8">
        <Pagination page={page} totalPages={totalPages} basePath="/vestibulares" />
      </div>
    </ContentPage>
  );
}
