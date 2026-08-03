import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { BlogPostCard } from "@/components/blog-post-card";
import { FreeTierAd } from "@/components/free-tier-ad";
import { Pagination } from "@/components/Pagination";
import { prisma } from "@/lib/prisma";

// Mantém todas as linhas completas na grade de três colunas em telas grandes.
const POSTS_PER_PAGE = 9;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Conteúdo sobre currículo, entrevistas e carreira para cada momento profissional.",
};

const FALLBACK_TOPICS = [
  { icon: "📄", topic: "Como montar um currículo sem experiência" },
  { icon: "🎤", topic: "Perguntas mais comuns em entrevistas de estágio" },
  { icon: "🧩", topic: "Como explicar um gap no currículo" },
  { icon: "🎓", topic: "Faculdade x curso técnico: como decidir" },
];

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; page?: string }>;
}) {
  const { area, page: pageParam } = await searchParams;

  const where = area ? { areaSlug: area, published: true } : { published: true };
  const parsedPage = Number.parseInt(pageParam ?? "1", 10);

  const total = await prisma.post.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const page = Math.min(
    Math.max(Number.isNaN(parsedPage) ? 1 : parsedPage, 1),
    totalPages
  );

  const posts = await prisma.post.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    skip: (page - 1) * POSTS_PER_PAGE,
    take: POSTS_PER_PAGE,
  });

  const areaRows = await prisma.post.findMany({
    where: { published: true },
    distinct: ["areaSlug"],
    select: { areaSlug: true, areaLabel: true },
    orderBy: { areaSlug: "asc" },
  });

  const areaChips = areaRows
    .map((row) => [row.areaSlug, row.areaLabel] as const)
    .sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));

  if (areaRows.length === 0) {
    return (
      <ContentPage
        eyebrow="Blog"
        title="Um guia prático para tomar decisões melhores na carreira."
        description="Orientações originais para currículo, formação, entrevistas e busca de trabalho. Cada guia parte de uma situação real e termina com um próximo passo aplicável."
      >
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-900/40 p-5 text-sm text-neutral-500 dark:text-neutral-400">
          Comece pelo problema que você precisa resolver hoje: entrar no mercado, mudar de área, voltar a procurar trabalho ou comprovar uma habilidade.
        </div>

        <div className="mt-8">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-4">Guias para o próximo passo</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {FALLBACK_TOPICS.map(({ icon, topic }) => (
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

        <section className="mt-8 border-t border-neutral-100 pt-8 dark:border-neutral-900">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Como transformar informação em ação</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            <p>Uma lista de vagas ou cursos é apenas o ponto de partida. Compare os requisitos com sua experiência, separe o que já pode ser comprovado e escolha uma única lacuna para desenvolver nesta semana.</p>
            <p>Use os guias para organizar essa decisão e as ferramentas para revisar o resultado. Recomendações editoriais são orientações práticas, não promessas de contratação, salário ou aprovação.</p>
          </div>
        </section>

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

  return (
    <ContentPage
      eyebrow="Blog"
      title="Um guia prático para tomar decisões melhores na carreira."
      description="Artigos práticos gerados para cada área profissional, estágio, primeiro emprego, transição de carreira, recolocação e crescimento."
      wide
    >
      <div className="flex flex-wrap gap-2">
        <Link
          href="/blog"
          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
            !area
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          Todos
        </Link>
        {areaChips.map(([slug, label]) => (
          <Link
            key={slug}
            href={`/blog?area=${slug}`}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              area === slug
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>

      {posts.length > 0 && (
        <div className="mt-8">
          <Pagination
            page={page}
            totalPages={totalPages}
            basePath="/blog"
            searchParams={{ area }}
          />
        </div>
      )}

      {posts.length > 0 && (
        <FreeTierAd name="blogList" className="mt-8" format="autorelaxed" />
      )}

      {posts.length === 0 && (
        <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
          Ainda não há posts nessa área.{" "}
          <Link href="/blog" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Ver todos os posts
          </Link>
          .
        </p>
      )}
    </ContentPage>
  );
}
