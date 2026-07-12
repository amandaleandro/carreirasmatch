import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-100 dark:border-neutral-900">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div className="col-span-2 sm:col-span-1">
          <Link href="/">
            <BrandLogo heightClassName="h-6" />
          </Link>
          <p className="mt-3 text-xs text-neutral-400 leading-relaxed">
            A plataforma completa para impulsionar sua carreira em qualquer momento.
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500 mb-3">Plataforma</p>
          <ul className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
            <li><Link href="/#como-funciona" className="hover:text-neutral-800 dark:hover:text-white transition-colors">Como funciona</Link></li>
            <li><Link href="/#recursos" className="hover:text-neutral-800 dark:hover:text-white transition-colors">Recursos</Link></li>
            <li><Link href="/#planos" className="hover:text-neutral-800 dark:hover:text-white transition-colors">Planos</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500 mb-3">Institucional</p>
          <ul className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
            <li><Link href="/sobre" className="hover:text-neutral-800 dark:hover:text-white transition-colors">Sobre nós</Link></li>
            <li><Link href="/blog" className="hover:text-neutral-800 dark:hover:text-white transition-colors">Blog</Link></li>
            <li><Link href="/contato" className="hover:text-neutral-800 dark:hover:text-white transition-colors">Contato</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500 mb-3">Ajuda</p>
          <ul className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
            <li><Link href="/ajuda" className="hover:text-neutral-800 dark:hover:text-white transition-colors">Central de ajuda</Link></li>
            <li><Link href="/privacidade" className="hover:text-neutral-800 dark:hover:text-white transition-colors">Privacidade</Link></li>
            <li><Link href="/termos" className="hover:text-neutral-800 dark:hover:text-white transition-colors">Termos</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-100 dark:border-neutral-900 py-6 text-center text-[11px] text-neutral-400">
        © {new Date().getFullYear()} CarreirasMatch. Todos os direitos reservados.
      </div>
    </footer>
  );
}
