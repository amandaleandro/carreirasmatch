import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Blog | CarreirasMatch",
  description: "Conteúdo sobre currículo, entrevistas e carreira para cada momento profissional.",
};

const TOPICS = [
  { icon: "📄", topic: "Como montar um currículo sem experiência" },
  { icon: "🎤", topic: "Perguntas mais comuns em entrevistas de estágio" },
  { icon: "🧩", topic: "Como explicar um gap no currículo" },
  { icon: "🎓", topic: "Faculdade x curso técnico: como decidir" },
];

export default function BlogPage() {
  return (
    <ContentPage
      eyebrow="Blog"
      title="Conteúdo direto ao ponto sobre currículo, entrevistas e carreira."
      description="Estamos preparando os primeiros artigos — dicas práticas para cada momento: estágio, primeiro emprego, transição de carreira, recolocação e jovem aprendiz."
    >
      <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-900/40 p-5 text-sm text-neutral-500 dark:text-neutral-400">
        Em breve por aqui. Enquanto isso, veja abaixo o que já estamos preparando.
      </div>

      <div className="mt-8">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-4">O que vem por aí</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {TOPICS.map(({ icon, topic }) => (
            <div
              key={topic}
              className="flex items-start gap-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-4 shadow-sm"
            >
              <span className="h-9 w-9 shrink-0 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-base">
                {icon}
              </span>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 leading-snug pt-1.5">
                {topic}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-900 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        Enquanto isso, você já pode ver dicas por área direto nas ferramentas de carreira:{" "}
        <Link href="/tools" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          explore as ferramentas
        </Link>
        .
      </p>
    </ContentPage>
  );
}
