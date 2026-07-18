import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

/**
 * Shared header for public (logged-out) pages so they match the site's brand:
 * wordmark logo + nav + auth buttons. Used by the public job listings.
 */
export function PublicSiteHeader() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#090d16]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" aria-label="CarreirasMatch">
          <BrandLogo heightClassName="h-9" />
        </Link>
        <nav className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300">
          <Link href="/vagas-de-hoje" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">
            Vagas de hoje
          </Link>
          <Link href="/vagas-publicas" className="hidden lg:inline hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">
            SINE e prefeituras
          </Link>
          <Link href="/cursos-gratuitos" className="hidden xl:inline hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">
            Cursos gratuitos
          </Link>
          <Link href="/mercado-de-trabalho" className="hidden xl:inline hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">
            Mercado
          </Link>
          <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Blog
          </Link>
          <Link href="/gratuito" className="hidden md:inline hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">
            Ferramentas grátis
          </Link>
          <Link href="/comece" className="hidden sm:inline hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">
            Como funciona
          </Link>
          <Link href="/empresa/cadastro" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">
            Para empresas
          </Link>
        </nav>
        <div className="flex items-center gap-2">
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
