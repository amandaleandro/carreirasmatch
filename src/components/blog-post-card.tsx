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
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "long", year: "numeric" }).format(date);
}

export function BlogPostCard({ post }: { post: BlogPostCardData }) {
  const gradient = COVER_GRADIENTS[post.gradientIdx] ?? COVER_GRADIENTS[0];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
    >
      <div className={`bg-gradient-to-br ${gradient} h-28 flex items-center justify-center text-4xl select-none`}>
        {post.coverEmoji}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <span className="inline-flex w-fit items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          {post.areaLabel}
        </span>
        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
          {post.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
        <span className="mt-auto pt-2 text-[11px] font-medium text-slate-400 border-t border-slate-100 dark:border-slate-800/80">{formatDate(post.publishedAt)}</span>
      </div>
    </Link>
  );
}
