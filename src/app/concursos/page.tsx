import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ContentPage } from "@/components/content-page";
import { RadarList } from "@/components/radar-list";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Radar de concursos: novos editais e concursos públicos | CarreirasMatch",
  description:
    "Acompanhe os concursos públicos mais recentes: novos editais, inscrições abertas, provas e convocações, reunidos em um só lugar.",
  alternates: { canonical: "/concursos" },
};

export default async function ConcursosRadarPage() {
  const items = await prisma.radarItem.findMany({
    where: { kind: "concurso", active: true },
    orderBy: [{ publishedAt: "desc" }, { lastSeenAt: "desc" }],
    take: 60,
  });

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
    </ContentPage>
  );
}
