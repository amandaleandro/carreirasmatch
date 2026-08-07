import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, ContentSection } from "@/components/content-page";
import { FreeTierAd } from "@/components/free-tier-ad";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { JourneyUpsellBanner } from "@/components/journey-upsell-banner";

export const metadata: Metadata = {
  title: "Currículo sem experiência: o que colocar",
  description:
    "Como fazer um currículo sem experiência de trabalho: o que colocar quando você nunca teve um emprego formal, como aproveitar cursos, projetos e voluntariado, e um modelo grátis para montar.",
  alternates: { canonical: "/curriculo-sem-experiencia" },
};

const FAQ = [
  {
    question: "O que colocar em um currículo sem nenhuma experiência?",
    answer:
      "Coloque formação, cursos livres, projetos pessoais ou acadêmicos, trabalhos voluntários e habilidades. Tudo que mostre iniciativa, responsabilidade e o que você já sabe fazer conta. Não precisa ter sido um emprego com carteira assinada.",
  },
  {
    question: "Como preencher a seção de experiência se nunca trabalhei?",
    answer:
      "Substitua 'experiência profissional' por 'experiências e projetos'. Inclua trabalhos escolares relevantes, atividades de voluntariado, ajuda em negócio da família, projetos pessoais e cursos com trabalho prático. Descreva o que você fez e o que aprendeu.",
  },
  {
    question: "Vale a pena colocar cursos online no currículo?",
    answer:
      "Sim, principalmente quando você tem pouca experiência. Cursos livres e certificados mostram que você busca se qualificar. Priorize os que têm relação com a vaga desejada.",
  },
  {
    question: "Como me destacar sendo iniciante?",
    answer:
      "Mostre habilidades comportamentais (organização, comunicação, proatividade) com exemplos concretos, adapte o objetivo para a vaga e escreva de forma clara e sem erros. Iniciativa e clareza compensam a falta de experiência formal.",
  },
];

export default function CurriculoSemExperienciaPage() {
  return (
    <ContentPage
      eyebrow="Guia de carreira"
      title="Currículo sem experiência: o que colocar"
      description="Nunca teve um emprego formal? Veja como montar um currículo que mostra o seu potencial mesmo sem experiência."
      backHref="/curriculo-gratis"
      backLabel="Montar currículo grátis"
    >
      <JsonLd data={faqJsonLd(FAQ)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Currículo sem experiência", path: "/curriculo-sem-experiencia" },
        ])}
      />

      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        Todo mundo começa sem experiência, e dá para montar um ótimo currículo mesmo assim. O
        segredo é parar de pensar só em &ldquo;empregos anteriores&rdquo; e mostrar tudo que
        comprova o que você é capaz de fazer. Abaixo, o que incluir e como organizar. Para montar na
        prática,{" "}
        <Link href="/curriculo-gratis" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          use o construtor de currículo grátis
        </Link>
        .
      </p>

      <ContentSection title="Troque &ldquo;experiência&rdquo; por &ldquo;experiências e projetos&rdquo;">
        <p>
          Você não precisa de um emprego com carteira assinada para preencher essa seção. Vale
          incluir:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Projetos escolares, acadêmicos ou pessoais relevantes;</li>
          <li>Trabalho voluntário e ações comunitárias;</li>
          <li>Ajuda em negócio da família ou trabalhos informais;</li>
          <li>Cursos com projeto prático, monitorias e atividades extracurriculares.</li>
        </ul>
        <p>
          Para cada item, descreva o que você fez e o que aprendeu, de preferência com algum
          resultado.
        </p>
      </ContentSection>

      <ContentSection title="Valorize formação e cursos">
        <p>
          Quando a experiência é curta, formação e cursos ganham peso. Liste seu curso atual (com
          previsão de conclusão), cursos livres, certificados e idiomas. Priorize o que tem a ver
          com a vaga que você quer.
        </p>
      </ContentSection>

      <ContentSection title="Mostre habilidades com exemplos">
        <p>
          Habilidades comportamentais fazem diferença para quem está começando. Em vez de só listar
          &ldquo;proatividade&rdquo;, mostre onde ela apareceu: &ldquo;organizei sozinho o material
          de um projeto em grupo e cumpri o prazo&rdquo;. Isso dá credibilidade.
        </p>
      </ContentSection>

      <ContentSection title="Escreva um objetivo claro e adaptado">
        <p>
          Diga em uma frase a vaga ou área que busca, ligada ao que você tem a oferecer. Ajuste esse
          objetivo para cada candidatura. Texto genérico não funciona.
        </p>
      </ContentSection>

      <ContentSection title="Cuide da forma">
        <p>
          Uma página, layout limpo, sem colunas complicadas, com português revisado. Currículos
          simples são lidos melhor pelos sistemas de triagem (ATS) e pelos recrutadores.
        </p>
      </ContentSection>

      <FreeTierAd name="toolGuide" className="mt-8" format="fluid" />

      <ContentSection title="Perguntas frequentes">
        <div className="space-y-5">
          {FAQ.map((item) => (
            <div key={item.question}>
              <h3 className="font-semibold text-neutral-900 dark:text-white">{item.question}</h3>
              <p className="mt-1">{item.answer}</p>
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection title="Continue por aqui">
        <p>
          Veja também{" "}
          <Link href="/como-fazer-curriculo" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            como fazer um currículo do zero
          </Link>
          , o guia de{" "}
          <Link href="/analise" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            currículo para o primeiro emprego
          </Link>{" "}
          e as vagas de{" "}
          <Link href="/tools/apprentice-guide" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Jovem Aprendiz
          </Link>
          .
        </p>
      </ContentSection>

      <JourneyUpsellBanner
        journey="career"
        title="Melhore seu currículo para aumentar sua aderência à vaga que você deseja"
        description="O Plano de Candidatura mostra exatamente o que ajustar para a vaga específica que você quer, não só regras gerais."
      />
    </ContentPage>
  );
}
