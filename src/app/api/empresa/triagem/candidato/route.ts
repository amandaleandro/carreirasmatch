import { NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUS = new Set(["none", "favorite", "approved", "rejected"]);
const MAX_NOTE = 2000;

// Empresa marca a ação sobre um candidato (favoritar/aprovar/reprovar) e/ou salva
// uma anotação interna. Aceita status, note, ou ambos.
export async function POST(req: Request) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  let body: { candidateId?: string; status?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const candidateId = (body.candidateId ?? "").trim();
  if (!candidateId) {
    return NextResponse.json({ error: "Candidato não informado." }, { status: 400 });
  }

  const data: { status?: string; note?: string } = {};
  if (body.status !== undefined) {
    if (!VALID_STATUS.has(body.status)) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body.note !== undefined) {
    data.note = String(body.note).slice(0, MAX_NOTE);
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  }

  // Garante que o candidato pertence a uma triagem desta empresa.
  const candidate = await prisma.companyCandidate.findFirst({
    where: { id: candidateId, job: { companyId: company.id } },
    select: { id: true },
  });
  if (!candidate) {
    return NextResponse.json({ error: "Candidato não encontrado." }, { status: 404 });
  }

  await prisma.companyCandidate.update({ where: { id: candidate.id }, data });
  return NextResponse.json({ ok: true });
}
