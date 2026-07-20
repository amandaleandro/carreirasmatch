import { NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";

// Owner remove um membro da equipe. Não pode remover a si mesmo nem o último owner.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { company, memberId, role, response } = await requireCompanyApi();
  if (!company) return response;
  if (role !== "owner") {
    return NextResponse.json({ error: "Apenas o responsável pode gerenciar a equipe." }, { status: 403 });
  }

  const { id } = await params;
  if (id === memberId) {
    return NextResponse.json({ error: "Você não pode remover a si mesmo." }, { status: 400 });
  }

  const target = await prisma.companyMember.findFirst({
    where: { id, companyId: company.id },
    select: { id: true, role: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
  }

  if (target.role === "owner") {
    const owners = await prisma.companyMember.count({ where: { companyId: company.id, role: "owner" } });
    if (owners <= 1) {
      return NextResponse.json({ error: "A empresa precisa de ao menos um responsável." }, { status: 400 });
    }
  }

  await prisma.companyMember.delete({ where: { id: target.id } });
  return NextResponse.json({ ok: true });
}
