import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCompanyPage } from "@/lib/company-auth";
import { TeamManager } from "@/components/team-manager";

export const dynamic = "force-dynamic";

export default async function CompanyTeamPage() {
  const { company, role, memberId } = await requireCompanyPage();
  // Só o responsável gerencia a equipe.
  if (role !== "owner") redirect("/empresa");

  const members = await prisma.companyMember.findMany({
    where: { companyId: company.id },
    orderBy: [{ role: "desc" }, { createdAt: "asc" }],
    select: { id: true, name: true, email: true, role: true },
  });

  return (
    <div>
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Equipe</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Adicione pessoas do seu RH para acessar a área da empresa. Cada uma entra com o próprio
            e-mail e senha.
          </p>
        </header>

        <TeamManager
          members={members.map((m) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            role: m.role,
            isSelf: m.id === memberId,
          }))}
        />
      </div>
    </div>
  );
}
