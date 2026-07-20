import { requireCompanyPage, FREE_SCREENING_LIMIT } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";
import { CompanyShell } from "@/components/company-shell";

// Shell das telas logadas da empresa: sidebar + topbar próprios, espelhando o
// app do candidato. Login/cadastro ficam fora do route group e não recebem isto.
export default async function CompanyPanelLayout({ children }: { children: React.ReactNode }) {
  const { company, role } = await requireCompanyPage();
  const remaining = Math.max(0, FREE_SCREENING_LIMIT - company.screeningCount) + company.screeningCredits;

  // Aviso in-app: pedidos de contato aceitos que a empresa ainda não viu.
  const contactsBadge = await prisma.talentContactRequest.count({
    where: { companyId: company.id, status: "accepted", viewedByCompany: false },
  });

  return (
    <CompanyShell
      companyName={company.name}
      logoUrl={company.logoUrl || null}
      remaining={remaining}
      contactsBadge={contactsBadge}
      isOwner={role === "owner"}
    >
      {children}
    </CompanyShell>
  );
}
