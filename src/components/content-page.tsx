import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { PublicNav, PublicNavMobile } from "@/components/public-nav";
import { SiteFooter } from "@/components/site-footer";

export function ContentPage({
  eyebrow,
  title,
  description,
  wide = false,
  maxWidthClass,
  backHref,
  backLabel,
  hideNav = false,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  /** Widens the hero copy and the content card for pages with grid layouts. */
  wide?: boolean;
  maxWidthClass?: string;
  /** Optional secondary link (e.g. "← Voltar") shown next to the logo instead of "Entrar". */
  backHref?: string;
  backLabel?: string;
  /** Hides the full public navigation, leaving only the logo and the back/entrar link. */
  hideNav?: boolean;
  children: ReactNode;
}) {
  const maxWidthClassName = maxWidthClass ?? (wide ? "max-w-5xl" : "max-w-3xl");

  return (
    <div className="w-full overflow-x-hidden min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <header className="public-header max-w-7xl mx-auto px-4 md:px-8 py-4 sm:py-5 flex items-center justify-between gap-3">
          <Link href="/">
            <BrandLogo heightClassName="h-9 sm:h-12 md:h-14" onDark />
          </Link>
          <div className="flex items-center gap-2">
            {!hideNav && <PublicNav />}
            {!hideNav && <PublicNavMobile />}
            <Link
              href={backHref ?? "/login"}
              className="rounded-xl border border-white/20 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              {backLabel ?? "Entrar"}
            </Link>
            {!backHref && (
              <Link
                href="/register"
                className="rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap shadow-sm"
              >
                Criar conta
              </Link>
            )}
          </div>
        </header>

        <div className={`${maxWidthClassName} mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-14 sm:pt-8 sm:pb-16 md:pt-12 md:pb-20`}>
          <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-4 bg-white/10 text-slate-200 border border-white/15">
            {eyebrow}
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-slate-300 mt-3 sm:mt-4 max-w-2xl text-sm md:text-base leading-relaxed font-normal">
              {description}
            </p>
          )}
        </div>
      </div>

      <main className={`${maxWidthClassName} mx-auto px-3 sm:px-6 md:px-8 -mt-8 sm:-mt-10 md:-mt-12 pb-12 sm:pb-16 md:pb-20 relative z-10`}>
        <div className="rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8 md:p-10 shadow-sm">
          {children}
        </div>
      </main>

      <SiteFooter maxWidth={maxWidthClassName} />
    </div>
  );
}

export function ContentSection({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8 [&:not(:first-child)]:mt-8 [&:not(:first-child)]:pt-8 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-neutral-100 dark:[&:not(:first-child)]:border-neutral-900">
      <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-3">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        {children}
      </div>
    </section>
  );
}
