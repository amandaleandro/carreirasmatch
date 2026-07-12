import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export const metadata: Metadata = {
  title: "Sobre nós | CarreirasMatch",
  description: "Conheça a missão do CarreirasMatch: ajudar você a se posicionar com confiança em cada etapa da carreira.",
};

const VALUES = [
  {
    title: "Clareza em vez de jargão",
    description:
      "Nada de termo difícil ou relatório genérico. Cada análise devolve o que está bom, o que falta e o próximo passo — em linguagem direta.",
  },
  {
    title: "Feito para cada momento",
    description:
      "Estagiário, primeiro emprego, transição de carreira, recolocação ou jovem aprendiz: a experiência muda porque o desafio de cada fase é diferente.",
  },
  {
    title: "Sem julgamento",
    description:
      "Gap no currículo, pouca experiência, mudança de área — a gente lê sua história como ela é e ajuda a contar isso a seu favor.",
  },
];

export default function SobrePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-neutral-800 dark:text-neutral-200">
      <Link href="/">
        <BrandLogo heightClassName="h-8" />
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-8 mb-4">Sobre nós</h1>

      <div className="space-y-6 text-sm leading-relaxed">
        <p>
          O CarreirasMatch nasceu de uma constatação simples: a maioria das pessoas não perde
          uma vaga por falta de capacidade, e sim por não saber como se apresentar para ela.
          Currículo genérico, insegurança na hora da entrevista e falta de um plano claro
          custam oportunidades todos os dias.
        </p>
        <p>
          Por isso, criamos uma plataforma que usa inteligência artificial para analisar seu
          currículo em relação a uma vaga real, mostrar exatamente onde estão as lacunas e
          te dar um caminho concreto — score de aderência, palavras-chave, perguntas prováveis
          de entrevista e plano de ação — em vez de conselhos vagos.
        </p>

        <section>
          <h2 className="text-base font-semibold mb-3 mt-2">O que guia o nosso trabalho</h2>
          <div className="space-y-4">
            {VALUES.map((value) => (
              <div key={value.title} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                <p className="font-semibold text-sm">{value.title}</p>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        <p>
          Ainda estamos no começo dessa jornada e construímos o produto ouvindo quem usa —
          estudantes, estagiários, quem busca o primeiro emprego, quem está mudando de área e
          quem está se recolocando no mercado. Se você tem feedback, adoramos ouvir pela{" "}
          <Link href="/contato" className="font-semibold underline underline-offset-2">
            página de contato
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
