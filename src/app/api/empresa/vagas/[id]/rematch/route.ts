import { NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";
import { runVagaMatch } from "@/lib/company-vaga";

// Reprocessa os candidatos do banco de talentos para uma vaga existente.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  const { id } = await params;
  const vaga = await prisma.companyVaga.findFirst({
    where: { id, companyId: company.id },
    select: { id: true, companyId: true, title: true, description: true, area: true, state: true },
  });
  if (!vaga) {
    return NextResponse.json({ error: "Vaga não encontrada." }, { status: 404 });
  }

  try {
    await runVagaMatch(vaga);
  } catch {
    return NextResponse.json({ error: "Não foi possível atualizar os candidatos agora." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
