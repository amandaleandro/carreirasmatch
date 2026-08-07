import type { Metadata } from "next";
import { SeoAnalyzeLanding } from "@/components/seo-analyze-landing";

export const metadata: Metadata = {
  title: "Nota do Currículo: analise seu currículo grátis e veja sua pontuação",
  description:
    "Descubra a nota do seu currículo de 0 a 100 comparado a uma vaga real. Análise completa: pontos fortes, lacunas, palavras-chave e o que corrigir antes de se candidatar.",
  alternates: { canonical: "/nota-do-curriculo" },
};

export default function NotaDoCurriculoPage() {
  return (
    <SeoAnalyzeLanding
      badge="Análise Gratuita de Aderência"
      title="Qual é a nota do seu currículo?"
      highlight="nota do seu currículo"
      subtitle="Envie seu currículo e a vaga desejada: nosso sistema gera uma nota de 0 a 100 e mostra o que está pesando contra você, como palavras-chave ausentes, falta de resultados quantificados, estrutura e senioridade."
      bullets={[
        { label: "Nota 0-100", desc: "Técnica, experiência e ATS" },
        { label: "Comparativo", desc: "Sua posição entre candidatos" },
        { label: "O que corrigir", desc: "Ajustes priorizados" },
        { label: "Grátis", desc: "Leitura inicial sem pagar" },
      ]}
      faq={[
        {
          question: "Como a nota do currículo é calculada?",
          answer:
            "A IA compara seu currículo com a vaga em 4 dimensões: aderência técnica (skills comprovadas), experiência (tempo e tipo), senioridade (nível demonstrado vs exigido) e ATS (estrutura, palavras-chave e resultados quantificados). A nota geral é a média ponderada dessas dimensões.",
        },
        {
          question: "O que é uma boa nota de currículo?",
          answer:
            "Acima de 70, vale se candidatar já. Entre 45 e 69, compensa ajustar o currículo primeiro, geralmente incluindo palavras-chave da vaga e quantificando resultados. Abaixo de 45, a vaga provavelmente exige requisitos que ainda faltam, e mostramos um plano de estudo para fechá-los.",
        },
        {
          question: "Preciso pagar para ver minha nota?",
          answer:
            "Não. A nota geral, a nota ATS e os principais pontos fortes e fracos são gratuitos. O relatório completo, com plano de ação, perguntas de entrevista e mensagem pronta para o recrutador, é opcional.",
        },
        {
          question: "Posso analisar o mesmo currículo para várias vagas?",
          answer:
            "Sim, e é o recomendado: a nota muda conforme a vaga, porque as palavras-chave e requisitos mudam. Criando uma conta gratuita você salva o currículo e repete a análise para cada vaga em segundos.",
        },
      ]}
      path="/nota-do-curriculo"
      breadcrumbName="Nota do Currículo"
    />
  );
}
