import { requireCompanyPage, FREE_SCREENING_LIMIT } from "@/lib/company-auth";
import { CompanyShell } from "@/components/company-shell";

// Shell das telas logadas da empresa: sidebar + topbar próprios, espelhando o
// app do candidato. Login/cadastro ficam fora do route group e não recebem isto.
export default async function CompanyPanelLayout({ children }: { children: React.ReactNode }) {
  const { company } = await requireCompanyPage();
  const remaining = Math.max(0, FREE_SCREENING_LIMIT - company.screeningCount) + company.screeningCredits;

  return (
    <CompanyShell companyName={company.name} remaining={remaining}>
      {children}
    </CompanyShell>
  );
}
