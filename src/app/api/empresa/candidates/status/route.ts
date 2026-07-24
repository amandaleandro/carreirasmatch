import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCompanyApi } from "@/lib/company-auth";

export async function PATCH(req: NextRequest) {
  try {
    const { company } = await requireCompanyApi();
    const { candidateId, status, note } = await req.json();

    if (!candidateId || !status) {
      return NextResponse.json({ error: "candidateId e status são obrigatórios." }, { status: 400 });
    }

    const candidate = await prisma.companyCandidate.findUnique({
      where: { id: candidateId },
      include: { job: { select: { companyId: true } } },
    });

    if (!company || !candidate || candidate.job.companyId !== company.id) {
      return NextResponse.json({ error: "Candidato não encontrado." }, { status: 404 });
    }

    const updated = await prisma.companyCandidate.update({
      where: { id: candidateId },
      data: {
        status,
        ...(typeof note === "string" ? { note } : {}),
      },
    });

    return NextResponse.json({ success: true, candidate: updated });
  } catch (error) {
    console.error("Erro ao atualizar status do candidato:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
