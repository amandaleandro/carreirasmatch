import type { Metadata } from "next";
import { Compass, Users, LineChart } from "lucide-react";
import { JourneyHubPage } from "@/components/journey-hub";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Descubra sua profissão | CarreirasMatch",
  description:
    "Ainda não sabe qual caminho seguir? Faça o teste vocacional, entenda seu perfil comportamental e compare profissões antes de decidir.",
  alternates: { canonical: "/descobrir" },
};

const items = [
  { icon: Compass, title: "Teste vocacional", description: "Descubra áreas e profissões com maior aderência ao seu perfil em poucos minutos.", href: "/tools/vocation-test" },
  { icon: Users, title: "Teste comportamental", description: "Entenda seus pontos fortes de comportamento e como usá-los a seu favor na escolha de carreira.", href: "/tools/behavioral-test" },
  { icon: LineChart, title: "Mercado de trabalho", description: "Veja demanda, salários e tendências reais antes de escolher uma área para investir.", href: "/mercado-de-trabalho" },
];

export default function DescobrirHubPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Descobrir", path: "/descobrir" }])} />
      <JourneyHubPage
        eyebrow="Descobrir"
        headline="Ainda não sabe qual caminho seguir? Comece por aqui."
        subheadline="Antes de investir tempo em um curso ou uma área, entenda seu perfil, seus pontos fortes e como o mercado está para as profissões que você tem em mente."
        primaryCta={{ label: "Fazer o teste vocacional grátis", href: "/tools/vocation-test" }}
        items={items}
      />
    </>
  );
}
