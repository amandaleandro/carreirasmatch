import { NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";

const VALID = new Set(["none", "favorite", "approved", "rejected"]);

// Empresa marca a ação sobre um candidato de uma triagem (favoritar/aprovar/reprovar).
export async function POST(req: Request) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  let body: { candidateId?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const candidateId = (body.candidateId ?? "").trim();
  const status = (body.status ?? "").trim();
  if (!candidateId || !VALID.has(status)) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  // Garante que o candidato pertence a uma triagem desta empresa.
  const candidate = await prisma.companyCandidate.findFirst({
    where: { id: candidateId, job: { companyId: company.id } },
    select: { id: true },
  });
  if (!candidate) {
    return NextResponse.json({ error: "Candidato não encontrado." }, { status: 404 });
  }

  await prisma.companyCandidate.update({ where: { id: candidate.id }, data: { status } });
  return NextResponse.json({ status });
}
