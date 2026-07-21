import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

/**
 * Shared header for public (logged-out) pages:
 * wordmark logo + auth buttons (Entrar & Criar conta).
 */
export function PublicSiteHeader() {
  return (
    <header className="public-header border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#090d16]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        <Link href="/" aria-label="CarreirasMatch">
          <BrandLogo heightClassName="h-10 sm:h-12" />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-300 md:flex">
          <Link href="/freelancers" className="hover:text-neutral-950 dark:hover:text-white">Freelancers</Link>
          <Link href="/empresas" className="hover:text-neutral-950 dark:hover:text-white">Empresas</Link>
          <Link href="/parceiro" className="hover:text-neutral-950 dark:hover:text-white">Parceiros</Link>
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
            className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  );
}
