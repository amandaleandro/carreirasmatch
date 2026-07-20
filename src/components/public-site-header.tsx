import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { PublicNav } from "@/components/public-nav";

/**
 * Shared header for public (logged-out) pages so they match the site's brand:
 * wordmark logo + nav + auth buttons. Used by the public job listings.
 */
export function PublicSiteHeader() {
  return (
    <header className="public-header border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#090d16]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" aria-label="CarreirasMatch">
          <BrandLogo heightClassName="h-11 sm:h-12" />
        </Link>
        <PublicNav />
        <div className="flex items-center gap-2">
          <Link
            href="/empresa/cadastro"
            className="hidden sm:inline text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
          >
            Para empresas
          </Link>
          <span className="hidden sm:inline h-4 w-px bg-neutral-200 dark:bg-neutral-700" aria-hidden />
          <Link
            href="/login"
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  );
}
