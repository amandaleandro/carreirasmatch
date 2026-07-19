import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/content-page";
import { BlogPostCard } from "@/components/blog-post-card";
import { FreeTierAd } from "@/components/free-tier-ad";
import { COVER_GRADIENTS, type ContentBlock } from "@/lib/blog-generator";
import { prisma } from "@/lib/prisma";
import { JsonLd } from "@/components/json-ld";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post não encontrado" };

  const path = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: path,
      publishedTime: post.publishedAt.toISOString(),
    },
  };
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "long", year: "numeric" }).format(date);
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const blocks = JSON.parse(post.contentJson) as ContentBlock[];
  const gradient = COVER_GRADIENTS[post.gradientIdx] ?? COVER_GRADIENTS[0];

  const relatedPosts = await prisma.post.findMany({
    where: { areaSlug: post.areaSlug, id: { not: post.id } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const path = `/blog/${post.slug}`;

  return (
    <ContentPage
      eyebrow="Blog"
      title={post.title}
      description={post.excerpt}
      backHref="/blog"
      backLabel="← Blog"
    >
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: post.excerpt,
          path,
          publishedAt: post.publishedAt,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path },
        ])}
      />
      <div className={`bg-gradient-to-br ${gradient} rounded-2xl h-32 flex items-center justify-center text-6xl mb-6`}>
        {post.coverEmoji}
      </div>

      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/blog?area=${post.areaSlug}`}
          className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/30 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
        >
          {post.areaLabel}
        </Link>
        <span className="text-[11px] text-neutral-400">{formatDate(post.publishedAt)}</span>
      </div>

      <article className="space-y-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        {blocks.map((block, i) => {
          if (block.type === "heading") {
            return (
              <h2 key={i} className="text-base font-bold text-neutral-900 dark:text-white pt-2">
                {block.text}
              </h2>
            );
          }
          if (block.type === "list") {
            return (
              <ul key={i} className="list-disc pl-5 space-y-1.5">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          }
          return <p key={i}>{block.text}</p>;
        })}
      </article>

      <FreeTierAd name="blogArticle" className="mt-8" format="fluid" />

      <p className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-900 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        Quer ajuda prática nessa etapa da sua carreira?{" "}
        <Link href="/tools" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          Explore as ferramentas do CarreirasMatch
        </Link>
        .
      </p>

      {relatedPosts.length > 0 && (
        <div className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-900">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-4">Continue lendo</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedPosts.map((related) => (
              <BlogPostCard key={related.id} post={related} />
            ))}
          </div>
        </div>
      )}
    </ContentPage>
  );
}
