import Link from "next/link";
import { ContentPage } from "@/components/content-page";

const TOOLS = [
  {
    href: "/tools/concurso/simulado",
    step: "1ª fase",
    title: "Simulado estilo FGV",
    description:
      "Gere questões de múltipla escolha no formato da FGV, por disciplina, com gabarito comentado. Selecione a banca FGV ao gerar.",
  },
  {
    href: "/tools/oab/segunda-fase",
    step: "2ª fase",
    title: "Corretor de peça e discursivas",
    description:
      "Cole sua peça prático-profissional ou resposta discursiva e receba correção pelos 5 critérios da FGV, com nota e pontos a melhorar.",
  },
  {
    href: "/tools/concurso/plano-de-estudo",
    step: "Organize",
    title: "Plano de estudo por fase",
    description:
      "Monte um cronograma até o exame priorizando as disciplinas de maior incidência da FGV. Informe 'OAB' como exame-alvo.",
  },
];

export default function OabHubPage() {
  return (
    <ContentPage
      eyebrow="Para quem estuda para a OAB"
      title="1ª e 2ª fase, no estilo da FGV."
      description="Treine a 1ª fase com simulados no formato do exame, corrija peças e discursivas da 2ª fase e organize seu estudo até o dia da prova."
      backHref="/?nicho=oab"
      backLabel="← Voltar"
      wide
    >
      <div className="grid gap-4">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href + tool.step}
            href={tool.href}
            className="rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-5 shadow-sm hover:border-violet-500 hover:shadow-md transition-all"
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 rounded-full px-2.5 py-1">
              {tool.step}
            </span>
            <h2 className="font-bold mt-3 mb-1.5">{tool.title}</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{tool.description}</p>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-sm text-neutral-500 dark:text-neutral-400">
        As ferramentas fazem parte do plano mensal.{" "}
        <Link href="/assinar?segment=oab" className="font-semibold text-violet-600 dark:text-violet-400 hover:underline">
          Ver planos
        </Link>
      </p>
    </ContentPage>
  );
}
