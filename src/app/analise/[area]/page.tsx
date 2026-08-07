import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { VOCATION_AREAS } from "@/lib/vocation-areas";
import { SeoAnalyzeLanding } from "@/components/seo-analyze-landing";

/**
 * SEO programático (estilo Zety/Enhancv): uma landing de análise de currículo
 * por área profissional, gerada a partir do catálogo VOCATION_AREAS que já
 * alimenta o teste vocacional e a taxonomia do sistema inteiro. ~30 portas de
 * entrada no Google com a mesma ferramenta por trás.
 */

export function generateStaticParams() {
  return VOCATION_AREAS.map((area) => ({ area: area.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ area: string }>;
}): Promise<Metadata> {
  const { area: slug } = await params;
  const area = VOCATION_AREAS.find((a) => a.slug === slug);
  if (!area) return {};
  return {
    title: `Análise de Currículo para ${area.label} Grátis: teste ATS e nota da vaga`,
    description: `Analise grátis seu currículo de ${area.label} contra uma vaga real: nota de aderência, palavras-chave que faltam, teste ATS e o que corrigir antes de se candidatar.`,
    alternates: { canonical: `/analise/${area.slug}` },
  };
}

export default async function AnaliseAreaPage({
  params,
}: {
  params: Promise<{ area: string }>;
}) {
  const { area: slug } = await params;
  const area = VOCATION_AREAS.find((a) => a.slug === slug);
  if (!area) notFound();

  const subareaSample = area.subareas.slice(0, 6).join(", ");

  return (
    <>
      <SeoAnalyzeLanding
        badge={`Análise para ${area.label}`}
        title={`Análise de currículo para ${area.label}`}
        highlight={area.label}
        subtitle={`Envie seu currículo e uma vaga de ${area.label}, de ${subareaSample} e outras frentes da área. A IA compara os dois, dá sua nota de aderência e mostra as palavras-chave e requisitos que faltam para passar na triagem.`}
        bullets={[
          { label: "Nota da vaga", desc: "Aderência de 0 a 100" },
          { label: "Teste ATS", desc: "Passa nos robôs de triagem?" },
          { label: "Palavras-chave", desc: `Termos que vagas de ${area.label} pedem` },
          { label: "Grátis", desc: "Leitura inicial sem pagar" },
        ]}
        faq={[
          {
            question: `Como funciona a análise de currículo para ${area.label}?`,
            answer: `Você envia seu currículo em PDF e o texto de uma vaga real de ${area.label}. A IA compara os dois e devolve nota de aderência técnica, experiência, senioridade e ATS, além das palavras-chave da vaga que faltam no seu currículo.`,
          },
          {
            question: `Serve para qualquer especialidade de ${area.label}?`,
            answer: `Sim. A análise considera a subárea da vaga enviada, por exemplo ${subareaSample}, e avalia seu currículo contra os requisitos reais daquela especialidade, não contra um modelo genérico.`,
          },
          {
            question: "Preciso de conta para testar?",
            answer:
              "Não. A leitura inicial é gratuita e sem cadastro. Criando uma conta gratuita, você salva o currículo, acompanha sua evolução e analisa quantas vagas quiser dentro do limite gratuito.",
          },
        ]}
        path={`/analise/${area.slug}`}
        breadcrumbName={`Análise para ${area.label}`}
      />
      <nav className="max-w-4xl mx-auto px-4 pb-12 -mt-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-2 text-center">
          Análise de currículo por área
        </p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {VOCATION_AREAS.filter((a) => a.slug !== area.slug).map((a) => (
            <Link
              key={a.slug}
              href={`/analise/${a.slug}`}
              className="rounded-full border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 px-2.5 py-1 text-[10px] font-semibold text-[#64748B] hover:text-[#2563EB] hover:border-[#2563EB]/40 transition-colors"
            >
              {a.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
