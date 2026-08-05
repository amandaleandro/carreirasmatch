import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { PublicNav, PublicNavMobile } from "@/components/public-nav";
import { SiteFooter } from "@/components/site-footer";

export type JourneyHubItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
};

export type JourneyHubProps = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryCta: { label: string; href: string };
  items: JourneyHubItem[];
};

export function JourneyHubPage({ eyebrow, headline, subheadline, primaryCta, items }: JourneyHubProps) {
  return (
    <div className="w-full overflow-hidden font-sans">
      <section className="relative bg-[#071827] text-white">
        <header className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 md:px-8">
          <Link href="/" aria-label="CarreirasMatch">
            <BrandLogo heightClassName="h-10 sm:h-12" onDark />
          </Link>
          <PublicNav />
          <div className="flex items-center gap-2.5">
            <Link href="/login" className="rounded-full border border-white/20 px-4.5 py-2 text-xs font-semibold hover:bg-white/10 transition-all">Entrar</Link>
            <Link href="/register" className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-all shadow-xs">Criar Conta</Link>
            <PublicNavMobile />
          </div>
        </header>

        <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-8 md:px-8 lg:pb-20 lg:pt-12">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-300">
            {eyebrow}
          </span>
          <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.15] tracking-tight text-white">
            {headline}
          </h1>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-300 max-w-2xl">
            {subheadline}
          </p>
          <div className="mt-7">
            <Link
              href={primaryCta.href}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-95"
            >
              {primaryCta.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <main>
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(({ icon: Icon, title, description, href }) => (
              <Link key={href} href={href} className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-bold leading-snug text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-transform group-hover:translate-x-1">Acessar <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
