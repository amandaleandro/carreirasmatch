import type { Metadata } from "next";
import { FileSearch, FileText, ShieldCheck, Search, MessageSquare, ClipboardList } from "lucide-react";
import { JourneyHubPage } from "@/components/journey-hub";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Conquiste a próxima vaga | CarreirasMatch",
  description:
    "Compare seu currículo com a vaga, crie um currículo do zero, encontre oportunidades e prepare-se para a entrevista.",
  alternates: { canonical: "/conquistar" },
};

const items = [
  { icon: FileSearch, title: "Analisar currículo e vaga", description: "Compare seu currículo com uma vaga real e veja seu Match, pontos fortes e lacunas.", href: "/analise" },
  { icon: FileText, title: "Criar currículo", description: "Monte um currículo do zero, formatado e pronto para candidatura, mesmo sem ter um pronto.", href: "/curriculo-gratis" },
  { icon: ShieldCheck, title: "Verificar ATS", description: "Descubra se o seu currículo é lido corretamente pelos filtros automáticos das empresas.", href: "/verificador-ats" },
  { icon: Search, title: "Encontrar vagas", description: "Busque oportunidades reais já filtradas pelo seu perfil e área de interesse.", href: "/todas-as-vagas" },
  { icon: MessageSquare, title: "Preparar entrevista", description: "Treine com um simulador que sonda exatamente os pontos fracos da vaga que você quer.", href: "/tools/interview-simulator" },
  { icon: ClipboardList, title: "Acompanhar candidaturas", description: "Organize vagas, currículos e status de cada candidatura em um só lugar, sem planilha.", href: "/applications" },
];

export default function ConquistarHubPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Conquistar", path: "/conquistar" }])} />
      <JourneyHubPage
        eyebrow="Conquistar"
        headline="Da vaga encontrada à candidatura preparada."
        subheadline="Compare seu currículo com a oportunidade, ajuste o que falta e chegue à entrevista sabendo exatamente o que apresentar."
        primaryCta={{ label: "Calcular meu Match grátis", href: "/analise" }}
        items={items}
      />
    </>
  );
}
