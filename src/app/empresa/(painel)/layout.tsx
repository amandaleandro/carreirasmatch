import Link from "next/link";
import { requireCompanyPage } from "@/lib/company-auth";
import { BrandLogo } from "@/components/brand-logo";
import { CompanyLogoutButton } from "@/components/company-logout-button";

// Header compartilhado das telas logadas da empresa. Login/cadastro ficam fora
// do route group e não recebem este layout.
export default async function CompanyPanelLayout({ children }: { children: React.ReactNode }) {
  const { company } = await requireCompanyPage();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/empresa">
            <BrandLogo heightClassName="h-11 sm:h-12" />
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex items-center gap-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
              <Link href="/empresa" className="hover:text-neutral-900 dark:hover:text-white">
                Triagens
              </Link>
              <Link href="/empresa/talentos" className="hover:text-neutral-900 dark:hover:text-white">
                Banco de talentos
              </Link>
              <Link href="/empresa/billing" className="hover:text-neutral-900 dark:hover:text-white">
                Créditos
              </Link>
            </nav>
            <span className="text-sm text-neutral-600 dark:text-neutral-400 hidden md:inline border-l border-neutral-200 dark:border-neutral-800 pl-4">
              {company.name}
            </span>
            <CompanyLogoutButton />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
