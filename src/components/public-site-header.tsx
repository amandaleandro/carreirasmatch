import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

/**
 * Shared header for public (logged-out) pages:
 * Apple-style glass header with wordmark logo + navigation links + pill action buttons.
 */
export function PublicSiteHeader() {
  return (
    <header className="public-header glass-header sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
        <Link href="/" aria-label="CarreirasMatch" className="hover:opacity-90 transition-opacity">
          <BrandLogo heightClassName="h-9 sm:h-10" />
        </Link>
        <nav className="hidden items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300 md:flex">
          <Link href="/assinar" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Planos
          </Link>
          <Link href="/freelancers" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Freelancers
          </Link>
          <Link href="/empresas" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Empresas
          </Link>
          <Link href="/parceiro" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Parceiros
          </Link>
        </nav>
        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="rounded-full border border-slate-200 dark:border-slate-800 px-4.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-blue-600 text-white px-5 py-2 text-xs font-semibold hover:bg-blue-700 transition-all shadow-xs shadow-blue-600/20 active:scale-95"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  );
}
