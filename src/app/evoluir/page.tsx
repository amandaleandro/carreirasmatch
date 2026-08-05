import type { Metadata } from "next";
import { TrendingUp, Share2, Code2, LayoutGrid, ClipboardCheck, Shuffle } from "lucide-react";
import { JourneyHubPage } from "@/components/journey-hub";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Evolua na sua carreira | CarreirasMatch",
  description:
    "Cresça dentro do seu emprego atual: plano de evolução, LinkedIn, GitHub, mapa de competências e transição de carreira.",
  alternates: { canonical: "/evoluir" },
};

const items = [
  { icon: TrendingUp, title: "Evolução profissional", description: "Gaps de competência, plano de desenvolvimento e argumentos para a conversa de promoção.", href: "/evolucao" },
  { icon: Share2, title: "Melhorar LinkedIn", description: "Otimize seu perfil para aparecer mais nas buscas de recrutadores da sua área.", href: "/tools/linkedin-optimizer" },
  { icon: Code2, title: "Revisar GitHub", description: "Receba uma análise técnica do seu perfil e projetos para times de tecnologia.", href: "/tools/github-review" },
  { icon: LayoutGrid, title: "Mapa de competências", description: "Veja onde você está forte e onde vale investir para o próximo passo de carreira.", href: "/tools/matriz-de-skills" },
  { icon: ClipboardCheck, title: "Plano de ação", description: "Transforme o diagnóstico da sua análise em próximos passos concretos e priorizados.", href: "/action-plan" },
  { icon: Shuffle, title: "Transição de carreira", description: "Identifique as habilidades que você já tem e que aproximam você da nova área.", href: "/transicao" },
];

export default function EvoluirHubPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Evoluir", path: "/evoluir" }])} />
      <JourneyHubPage
        eyebrow="Evoluir"
        headline="Crescer não precisa ser só trocar de empresa."
        subheadline="Ferramentas para evoluir no emprego atual, fortalecer sua presença profissional ou planejar a próxima mudança de área com segurança."
        primaryCta={{ label: "Ver meu plano de evolução", href: "/evolucao" }}
        items={items}
      />
    </>
  );
}
