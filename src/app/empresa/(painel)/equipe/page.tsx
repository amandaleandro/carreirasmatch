import { redirect } from "next/navigation";
import { UsersRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireCompanyPage } from "@/lib/company-auth";
import { TeamManager } from "@/components/team-manager";

export const dynamic = "force-dynamic";

export default async function CompanyTeamPage() {
  const { company, role, memberId } = await requireCompanyPage();
  if (role !== "owner") redirect("/empresa");

  const members = await prisma.companyMember.findMany({
    where: { companyId: company.id },
    orderBy: [{ role: "desc" }, { createdAt: "asc" }],
    select: { id: true, name: true, email: true, role: true },
  });

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <UsersRound className="w-3.5 h-3.5" />
          Gestão de Multiusuários
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Equipe de Recrutamento & RH
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm max-w-2xl">
          Adicione membros do seu time para gerenciar triagens e vagas. Cada usuário possui login individual próprio.
        </p>
      </div>

      <TeamManager
        members={members.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role,
          isSelf: m.id === memberId,
        }))}
      />
    </main>
  );
}
