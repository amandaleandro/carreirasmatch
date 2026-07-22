import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, ContentSection } from "@/components/content-page";
import { FreeTierAd } from "@/components/free-tier-ad";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Como fazer um currículo do zero: passo a passo",
  description:
    "Aprenda como fazer um currículo do zero em 7 passos: o que colocar em cada seção, como escrever o objetivo, o que evitar e como adaptar para a vaga. Com modelo grátis para montar online.",
  alternates: { canonical: "/como-fazer-curriculo" },
};

const FAQ = [
  {
    question: "Qual é o tamanho ideal de um currículo?",
    answer:
      "Uma página é o ideal para a maioria das pessoas, especialmente no início de carreira. Duas páginas só se justificam com bastante experiência relevante. O recrutador dá poucos segundos à primeira leitura, então objetividade conta muito.",
  },
  {
    question: "Preciso colocar foto no currículo?",
    answer:
      "No Brasil, a foto é opcional e não é exigida pela maioria das empresas. Se optar por usar, escolha uma foto de aparência profissional. O conteúdo é sempre mais importante que a imagem.",
  },
  {
    question: "Como escrever o objetivo do currículo?",
    answer:
      "Seja específico: diga o cargo ou a área que você busca, em uma frase. Evite frases genéricas como 'busco crescimento profissional'. Adapte o objetivo para cada vaga a que se candidatar.",
  },
  {
    question: "O que fazer se eu não tenho experiência?",
    answer:
      "Destaque formação, cursos, projetos, trabalhos voluntários e habilidades. Iniciativas fora de um emprego formal também mostram competência e disposição. Veja o guia de currículo sem experiência para detalhes.",
  },
];

export default function ComoFazerCurriculoPage() {
  return (
    <ContentPage
      eyebrow="Guia de carreira"
      title="Como fazer um currículo do zero"
      description="Um passo a passo direto para montar seu primeiro currículo, mesmo que você nunca tenha feito um."
      backHref="/curriculo-gratis"
      backLabel="Montar currículo grátis"
    >
      <JsonLd data={faqJsonLd(FAQ)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Como fazer um currículo", path: "/como-fazer-curriculo" },
        ])}
      />

      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        Fazer um currículo do zero parece intimidador, mas segue uma estrutura simples. A seguir,
        os 7 passos para montar um currículo que os recrutadores (e os sistemas de triagem) leem sem
        esforço. Se preferir montar direto,{" "}
        <Link href="/curriculo-gratis" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          use o construtor de currículo grátis
        </Link>{" "}
        e volte aqui para revisar cada seção.
      </p>

      <ContentSection title="1. Reúna suas informações">
        <p>
          Antes de escrever, junte tudo num rascunho: dados de contato, formação (com anos), cursos,
          experiências (empresa, cargo, período e o que você fez) e habilidades. Ter tudo à mão
          torna a montagem muito mais rápida.
        </p>
      </ContentSection>

      <ContentSection title="2. Comece pelos dados de contato">
        <p>
          No topo: nome completo, cidade/estado, telefone com DDD e um e-mail profissional (evite
          apelidos). Um link para o LinkedIn ou portfólio, se você tiver, é um bônus. Não é preciso
          incluir RG, CPF ou endereço completo.
        </p>
      </ContentSection>

      <ContentSection title="3. Escreva um objetivo específico">
        <p>
          Em uma frase, diga o cargo ou a área que você busca e adapte para cada vaga. &ldquo;Busco
          vaga de auxiliar administrativo para aplicar minha organização e atenção a detalhes&rdquo;
          diz muito mais do que &ldquo;busco uma oportunidade para crescer&rdquo;.
        </p>
      </ContentSection>

      <ContentSection title="4. Liste sua formação">
        <p>
          Curso, instituição e ano de conclusão (ou previsão). Quem está começando pode incluir o
          ensino médio. Cursos técnicos e livres relevantes também entram aqui ou numa seção própria.
        </p>
      </ContentSection>

      <ContentSection title="5. Descreva suas experiências com resultados">
        <p>
          Para cada experiência, não liste só tarefas. Mostre o efeito do seu trabalho sempre que
          possível: &ldquo;organizei o estoque e reduzi faltas de produto&rdquo; é melhor que
          &ldquo;responsável pelo estoque&rdquo;. Sem experiência formal, use projetos, estágios,
          voluntariado e trabalhos acadêmicos.
        </p>
      </ContentSection>

      <ContentSection title="6. Destaque cursos e habilidades">
        <p>
          Inclua idiomas, ferramentas e competências que a vaga pede. Priorize o que é relevante para
          o cargo. Uma lista enorme e genérica pesa menos que poucas habilidades certeiras.
        </p>
      </ContentSection>

      <ContentSection title="7. Revise e adapte para cada vaga">
        <p>
          Cheque português, formatação e contato. Depois, para cada vaga, ajuste o objetivo e realce
          as habilidades pedidas. Prefira uma página, layout limpo e sem colunas que confundem os
          sistemas de triagem (ATS).
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

      <ContentSection title="Próximos passos">
        <p>
          Pronto para montar?{" "}
          <Link href="/curriculo-gratis" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Crie seu currículo grátis
          </Link>
          . Está começando agora?{" "}
          <Link href="/curriculo-sem-experiencia" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Veja como fazer um currículo sem experiência
          </Link>{" "}
          ou o guia de{" "}
          <Link href="/primeiro-emprego" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            currículo para o primeiro emprego
          </Link>
          .
        </p>
      </ContentSection>
    </ContentPage>
  );
}
