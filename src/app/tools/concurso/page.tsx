import Link from "next/link";
import { ContentPage } from "@/components/content-page";

const TOOLS = [
  {
    href: "/tools/concurso/plano-de-estudo",
    step: "Comece por aqui",
    title: "Plano de estudo por edital",
    description:
      "Cole o cargo, a banca e as disciplinas do edital e receba um ciclo de estudos por peso das matérias, com cronograma semanal até a prova.",
  },
  {
    href: "/tools/concurso/simulado",
    step: "Treine",
    title: "Simulado por banca e disciplina",
    description:
      "Gere questões originais no formato da sua banca (CESPE certo/errado, FGV, FCC) com gabarito comentado.",
  },
  {
    href: "/tools/concurso/nota-de-corte",
    step: "Meça",
    title: "Estimativa de nota de corte",
    description:
      "Informe cargo, banca e sua pontuação estimada e veja uma referência realista de onde você precisa chegar.",
  },
];

export default function ConcursoHubPage() {
  return (
    <ContentPage
      eyebrow="Para quem estuda para concurso"
      title="Estude pelo que realmente cai."
      description="Monte seu plano de estudo por edital, treine com simulados no estilo da banca e acompanhe sua nota de corte até o dia da prova."
      backHref="/?nicho=concurseiro"
      backLabel="← Voltar"
      wide
    >
      <div className="grid gap-4">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-5 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all"
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 rounded-full px-2.5 py-1">
              {tool.step}
            </span>
            <h2 className="font-bold mt-3 mb-1.5">{tool.title}</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{tool.description}</p>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-sm text-neutral-500 dark:text-neutral-400">
        As ferramentas fazem parte do plano mensal.{" "}
        <Link href="/assinar?segment=concurseiro" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
          Ver planos
        </Link>
      </p>
    </ContentPage>
  );
}
