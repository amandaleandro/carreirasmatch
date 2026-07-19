import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ContentPage } from "@/components/content-page";
import { RadarList } from "@/components/radar-list";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Radar de vestibulares: novos vestibulares, ENEM e Sisu",
  description:
    "Acompanhe os vestibulares mais recentes: novos editais, inscrições, ENEM, Sisu, ProUni e bolsas, reunidos em um só lugar.",
  alternates: { canonical: "/vestibulares" },
};

export default async function VestibularesRadarPage() {
  const items = await prisma.radarItem.findMany({
    where: { kind: "vestibular", active: true },
    orderBy: [{ publishedAt: "desc" }, { lastSeenAt: "desc" }],
    take: 60,
  });

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
    </ContentPage>
  );
}
