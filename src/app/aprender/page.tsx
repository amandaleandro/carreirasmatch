import type { Metadata } from "next";
import { BookOpenText, School, Scale3d, Landmark, Wrench } from "lucide-react";
import { JourneyHubPage } from "@/components/journey-hub";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Ferramentas de estudo | CarreirasMatch",
  description:
    "Ensino médio, universidade, concursos, OAB e ferramentas de estudo com apoio de IA para você aprender com mais direção.",
  alternates: { canonical: "/aprender" },
};

const items = [
  { icon: School, title: "Ensino médio", description: "Simulados, flashcards, redação e cronograma pensados para o ENEM e o vestibular.", href: "/ensino-medio" },
  { icon: Landmark, title: "Universidade", description: "Conecte suas disciplinas do semestre a competências, profissões e projetos práticos.", href: "/universidade" },
  { icon: BookOpenText, title: "Concursos", description: "Estude pelo edital de verdade: plano de estudo, simulado e nota de corte estimada.", href: "/tools/concurso" },
  { icon: Scale3d, title: "OAB", description: "Preparação para 1ª e 2ª fase no estilo da banca, com correção de peça prática.", href: "/tools/oab" },
  { icon: Wrench, title: "Ferramentas de estudo", description: "Todas as ferramentas de aprendizado em um só lugar, por tema e objetivo.", href: "/tools" },
];

export default function AprenderHubPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Aprender", path: "/aprender" }])} />
      <JourneyHubPage
        eyebrow="Aprender"
        headline="Estude com direção, não no escuro."
        subheadline="Do ensino médio à OAB, cada ferramenta usa o conteúdo que realmente cai para te ajudar a estudar o que importa primeiro."
        primaryCta={{ label: "Ver ferramentas de estudo", href: "/tools" }}
        items={items}
      />
    </>
  );
}
