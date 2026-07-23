import type { Metadata } from "next";
import { SeoAnalyzeLanding } from "@/components/seo-analyze-landing";

export const metadata: Metadata = {
  title: "Teste de Currículo ATS Grátis: veja se seu currículo passa nos robôs",
  description:
    "Teste grátis se o seu currículo passa nos sistemas ATS usados pelas empresas. Veja sua nota, as palavras-chave que faltam e como o robô de triagem lê o seu PDF.",
  alternates: { canonical: "/teste-curriculo-ats" },
};

export default function TesteCurriculoAtsPage() {
  return (
    <SeoAnalyzeLanding
      badge="Teste ATS gratuito"
      title="Seu currículo passa no teste do ATS?"
      highlight="teste do ATS"
      subtitle="A maioria das empresas usa robôs de triagem (ATS) que descartam currículos antes de qualquer humano ler. Envie seu PDF e uma vaga real: mostramos sua nota ATS, as palavras-chave que faltam e exatamente como o robô lê o seu currículo."
      bullets={[
        { label: "Nota ATS", desc: "0 a 100, na hora" },
        { label: "Visão do robô", desc: "Como o ATS lê seu PDF" },
        { label: "Palavras-chave", desc: "O que falta para a vaga" },
        { label: "100% grátis", desc: "Resultado inicial sem pagar" },
      ]}
      faq={[
        {
          question: "O que é um sistema ATS?",
          answer:
            "ATS (Applicant Tracking System) é o software que grandes empresas usam para receber e filtrar currículos. Ele converte seu PDF em campos estruturados e busca as palavras-chave da vaga — currículos que o robô não consegue ler ou que não têm os termos certos são descartados antes de chegar ao recrutador.",
        },
        {
          question: "O teste de currículo ATS é grátis mesmo?",
          answer:
            "Sim. Você envia o currículo em PDF e o texto de uma vaga, e recebe gratuitamente a leitura inicial: nota geral, nota ATS e principais pontos fortes e fracos. O diagnóstico completo com plano de ação é opcional.",
        },
        {
          question: "Como faço meu currículo passar no ATS?",
          answer:
            "Use as palavras-chave exatas da vaga (ferramentas, certificações, idiomas), estrutura simples com seções claras, datas nas experiências e dados de contato completos. Nosso teste mostra exatamente quais termos da vaga faltam no seu currículo e o que o robô não conseguiu ler.",
        },
        {
          question: "Funciona para qualquer profissão?",
          answer:
            "Sim. A análise funciona para qualquer área — vendas, saúde, logística, TI, administrativo, engenharia — e se adapta ao seu momento profissional, do primeiro emprego à recolocação.",
        },
      ]}
      path="/teste-curriculo-ats"
      breadcrumbName="Teste de Currículo ATS"
    />
  );
}
