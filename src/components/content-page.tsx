import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
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
    <div className="w-full overflow-x-hidden">
      <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950">
        <header className="public-header max-w-7xl mx-auto px-4 md:px-8 py-4 sm:py-5 flex items-center justify-between gap-3">
          <Link href="/">
            <BrandLogo heightClassName="h-9 sm:h-12 md:h-14" onDark />
          </Link>
          <div className="flex items-center gap-2">
            {!hideNav && (
              <nav aria-label="Navegação institucional" className="mr-2 hidden items-center gap-4 text-sm font-semibold text-white/70 lg:flex">
                <Link href="/sobre" className="transition-colors hover:text-white">Sobre</Link>
                <Link href="/contato" className="transition-colors hover:text-white">Contato</Link>
                <Link href="/privacidade" className="transition-colors hover:text-white">Privacidade</Link>
                <Link href="/termos" className="transition-colors hover:text-white">Termos</Link>
              </nav>
            )}
            <Link
              href={backHref ?? "/login"}
              className="rounded-lg border border-white/20 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              {backLabel ?? "Entrar"}
            </Link>
            {!backHref && (
              <Link
                href="/register"
                className="rounded-lg bg-white px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-950 hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                Criar conta
              </Link>
            )}
          </div>
        </header>

        <div className={`${maxWidthClassName} mx-auto px-4 sm:px-6 md:px-8 pt-4 pb-12 sm:pt-6 sm:pb-14 md:pt-10 md:pb-20`}>
          <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 mb-3 sm:mb-4 bg-blue-500/15 text-blue-300 border border-blue-400/30">
            {eyebrow}
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-white/70 mt-3 sm:mt-4 max-w-xl text-xs sm:text-sm md:text-base leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      <main className={`${maxWidthClassName} mx-auto px-3 sm:px-6 md:px-8 -mt-6 sm:-mt-8 md:-mt-10 pb-12 sm:pb-16 md:pb-20 relative z-10`}>
        <div className="rounded-xl sm:rounded-2xl md:rounded-[2rem] border border-neutral-200/80 dark:border-neutral-800 bg-white/98 dark:bg-neutral-950/98 p-4 sm:p-6 md:p-10 shadow-xl shadow-slate-900/5">
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
