import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { SiteFooter } from "@/components/site-footer";

export function ContentPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950">
        <header className="max-w-6xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
          <Link href="/">
            <BrandLogo heightClassName="h-9" onDark />
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-white/20 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Entrar
          </Link>
        </header>

        <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6 pb-14 md:pt-10 md:pb-20">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-4 bg-blue-500/15 text-blue-300 border border-blue-400/30">
            {eyebrow}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-white/70 mt-4 max-w-xl text-sm md:text-base leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 md:px-8 -mt-8 md:-mt-10 pb-16 md:pb-20 relative z-10">
        <div className="rounded-[2rem] border border-neutral-200/80 dark:border-neutral-800 bg-white/98 dark:bg-neutral-950/98 p-6 md:p-10 shadow-xl shadow-slate-900/5">
          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export function ContentSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="[&:not(:first-child)]:mt-8 [&:not(:first-child)]:pt-8 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-neutral-100 dark:[&:not(:first-child)]:border-neutral-900">
      <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-3">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        {children}
      </div>
    </section>
  );
}
