import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter({ maxWidth = "max-w-7xl" }: { maxWidth?: string }) {
  return (
    <footer className="public-footer border-t border-neutral-100 dark:border-neutral-900 bg-background">
      <div className={`${maxWidth} mx-auto px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8`}>
        <div className="col-span-2 md:col-span-1">
          <Link href="/">
            <BrandLogo heightClassName="h-14 sm:h-16" />
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
            <li><Link href="/empresas" className="hover:text-neutral-800 dark:hover:text-white transition-colors">Para empresas</Link></li>
            <li><Link href="/parceiro" className="hover:text-neutral-800 dark:hover:text-white transition-colors">Seja parceiro</Link></li>
            <li><Link href="/freelancers" className="hover:text-neutral-800 dark:hover:text-white transition-colors">Freelancers</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500 mb-3">Radar e Recursos</p>
          <ul className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
            <li><Link href="/vagas-publicas" className="hover:text-neutral-800 dark:hover:text-white transition-colors">SINE e prefeituras</Link></li>
            <li><Link href="/ensino-medio" className="hover:text-neutral-800 dark:hover:text-white transition-colors">Ensino Médio & ENEM</Link></li>
            <li><Link href="/cursos-gratuitos" className="hover:text-neutral-800 dark:hover:text-white transition-colors">Cursos gratuitos</Link></li>
            <li><Link href="/concursos" className="hover:text-neutral-800 dark:hover:text-white transition-colors">Concursos</Link></li>
            <li><Link href="/vestibulares" className="hover:text-neutral-800 dark:hover:text-white transition-colors">Vestibulares</Link></li>
            <li><Link href="/tools/oab" className="hover:text-neutral-800 dark:hover:text-white transition-colors">Preparação para OAB</Link></li>
            <li><Link href="/mercado-de-trabalho" className="hover:text-neutral-800 dark:hover:text-white transition-colors">Mercado</Link></li>
            <li><Link href="/mentorias" className="hover:text-neutral-800 dark:hover:text-white transition-colors">Mentorias</Link></li>
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
