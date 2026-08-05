import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/content-page";
import { BlogPostCard } from "@/components/blog-post-card";
import { FreeTierAd } from "@/components/free-tier-ad";
import { Pagination } from "@/components/Pagination";
import { JsonLd } from "@/components/json-ld";
import { prisma } from "@/lib/prisma";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getContentPillar } from "@/lib/blog-topics";

// Página pilar por área vocacional: agrupa os posts (clusters) daquela área
// sob uma URL própria e indexável, com contexto editorial fixo (descrição +
// mecânica de carreira real da área) em vez de depender só do filtro
// ?area= da listagem geral, que não é uma boa URL canônica pro Google.
const POSTS_PER_PAGE = 9;

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const area = getContentPillar(slug);
  if (!area) return { title: "Área não encontrada" };

  const path = `/blog/area/${slug}`;
  const title = `Blog: ${area.label}`;
  const description = `${area.description} Guias práticos sobre carreira em ${area.label} para cada etapa: escolha, formação, primeiro emprego e crescimento.`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", title, description, url: path },
  };
}

export default async function BlogAreaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  const area = getContentPillar(slug);
  if (!area) notFound();

  const where = { areaSlug: slug, published: true };
  const parsedPage = Number.parseInt(pageParam ?? "1", 10);

  const total = await prisma.post.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const page = Math.min(Math.max(Number.isNaN(parsedPage) ? 1 : parsedPage, 1), totalPages);

  const posts = await prisma.post.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    skip: (page - 1) * POSTS_PER_PAGE,
    take: POSTS_PER_PAGE,
  });

  const path = `/blog/area/${slug}`;

  return (
    <ContentPage
      eyebrow="Blog"
      title={`Carreira em ${area.label}`}
      description={area.description}
      backHref="/blog"
      backLabel="← Blog"
      wide
    >
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: area.label, path },
        ])}
      />

      {area.careerNotes && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 p-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          <span className="font-semibold text-neutral-800 dark:text-neutral-100">Como funciona na prática: </span>
          {area.careerNotes}
        </div>
      )}

      <p className="mt-6 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        Quer ajuda prática nesse tema?{" "}
        <Link href={area.cta.path} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          {area.cta.label}
        </Link>
        .
      </p>

      {posts.length > 0 ? (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>

          <div className="mt-8">
            <Pagination page={page} totalPages={totalPages} basePath={path} />
          </div>

          <FreeTierAd name="blogList" className="mt-8" format="autorelaxed" />
        </>
      ) : (
        <p className="mt-8 text-sm text-neutral-500 dark:text-neutral-400">
          Ainda não há posts publicados para {area.label}.{" "}
          <Link href="/blog" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Ver todos os posts do blog
          </Link>
          .
        </p>
      )}
    </ContentPage>
  );
}
