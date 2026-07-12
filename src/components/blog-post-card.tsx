import Link from "next/link";
import { COVER_GRADIENTS } from "@/lib/blog-generator";

export type BlogPostCardData = {
  slug: string;
  title: string;
  excerpt: string;
  areaSlug: string;
  areaLabel: string;
  coverEmoji: string;
  gradientIdx: number;
  publishedAt: Date;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

export function BlogPostCard({ post }: { post: BlogPostCardData }) {
  const gradient = COVER_GRADIENTS[post.gradientIdx] ?? COVER_GRADIENTS[0];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`bg-gradient-to-br ${gradient} h-28 flex items-center justify-center text-4xl`}>
        {post.coverEmoji}
      </div>
      <div className="flex flex-col gap-2 p-4">
        <span className="inline-flex w-fit items-center rounded-full bg-blue-50 dark:bg-blue-950/30 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
          {post.areaLabel}
        </span>
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {post.title}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
        <span className="mt-1 text-[11px] text-neutral-400">{formatDate(post.publishedAt)}</span>
      </div>
    </Link>
  );
}
