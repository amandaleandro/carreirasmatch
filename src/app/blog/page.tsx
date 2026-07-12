import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export const metadata: Metadata = {
  title: "Blog | CarreirasMatch",
  description: "Conteúdo sobre currículo, entrevistas e carreira para cada momento profissional.",
};

const TOPICS = [
  "Como montar um currículo sem experiência",
  "Perguntas mais comuns em entrevistas de estágio",
  "Como explicar um gap no currículo",
  "Faculdade x curso técnico: como decidir",
];

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-neutral-800 dark:text-neutral-200">
      <Link href="/">
        <BrandLogo heightClassName="h-8" />
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-8 mb-4">Blog</h1>

      <div className="space-y-6 text-sm leading-relaxed">
        <p>
          Estamos preparando os primeiros artigos do blog do CarreirasMatch, com dicas
          práticas sobre currículo, entrevistas e planejamento de carreira para cada momento —
          estágio, primeiro emprego, transição de carreira, recolocação e jovem aprendiz.
        </p>

        <section>
          <h2 className="text-base font-semibold mb-3">O que vem por aí</h2>
          <ul className="space-y-2">
            {TOPICS.map((topic) => (
              <li key={topic} className="flex items-start gap-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[11px] font-bold">
                  •
                </span>
                {topic}
              </li>
            ))}
          </ul>
        </section>

        <p>
          Enquanto isso, você já pode ver dicas por área direto nas ferramentas de carreira:{" "}
          <Link href="/tools" className="font-semibold underline underline-offset-2">
            explore as ferramentas
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
