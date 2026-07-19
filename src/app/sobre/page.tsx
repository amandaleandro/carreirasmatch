import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Sobre nós",
  description: "Conheça a missão do CarreirasMatch: ajudar você a se posicionar com confiança em cada etapa da carreira.",
};

const VALUES = [
  {
    icon: "🎯",
    title: "Clareza em vez de jargão",
    description:
      "Nada de termo difícil ou relatório genérico. Cada análise devolve o que está bom, o que falta e o próximo passo, em linguagem direta.",
  },
  {
    icon: "🧭",
    title: "Feito para cada momento",
    description:
      "Estagiário, primeiro emprego, transição de carreira, recolocação ou jovem aprendiz: a experiência muda porque o desafio de cada fase é diferente.",
  },
  {
    icon: "🤝",
    title: "Sem julgamento",
    description:
      "Gap no currículo, pouca experiência, mudança de área, a gente lê sua história como ela é e ajuda a contar isso a seu favor.",
  },
];

export default function SobrePage() {
  return (
    <ContentPage
      eyebrow="Sobre nós"
      title="Ajudamos você a se posicionar com confiança em cada momento da carreira."
      description="Não somos só um analisador de currículo, somos um copiloto para as decisões que mais pesam na sua trajetória profissional."
    >
      <div className="space-y-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        <p>
          O CarreirasMatch nasceu de uma constatação simples: a maioria das pessoas não perde
          uma vaga por falta de capacidade, e sim por não saber como se apresentar para ela.
          Currículo genérico, insegurança na hora da entrevista e falta de um plano claro
          custam oportunidades todos os dias.
        </p>
        <p>
          Por isso, criamos uma plataforma que usa inteligência artificial para analisar seu
          currículo em relação a uma vaga real, mostrar exatamente onde estão as lacunas e
          te dar um caminho concreto, score de aderência, palavras-chave, perguntas prováveis
          de entrevista e plano de ação, em vez de conselhos vagos.
        </p>
      </div>

      <div className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-900">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-4">O que guia o nosso trabalho</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-5 shadow-sm hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
            >
              <span className="text-xl">{value.icon}</span>
              <p className="font-bold text-sm mt-2">{value.title}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-900 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        Ainda estamos no começo dessa jornada e construímos o produto ouvindo quem usa, 
        estudantes, estagiários, quem busca o primeiro emprego, quem está mudando de área e
        quem está se recolocando no mercado. Se você tem feedback, adoramos ouvir pela{" "}
        <Link href="/contato" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          página de contato
        </Link>
        .
      </p>
    </ContentPage>
  );
}
