import { NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";
import { APPLICATION_STATUS_VALUES } from "@/lib/vaga-fields";

const MAX_NOTE = 2000;

// Empresa atualiza o status e/ou a nota de uma candidatura recebida numa vaga sua.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  const { id } = await params;
  const application = await prisma.companyJobApplication.findFirst({
    where: { id, vaga: { companyId: company.id } },
    select: { id: true },
  });
  if (!application) {
    return NextResponse.json({ error: "Candidatura não encontrada." }, { status: 404 });
  }

  let body: { status?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const data: { status?: string; note?: string } = {};
  if (body.status !== undefined) {
    if (!APPLICATION_STATUS_VALUES.includes(body.status as (typeof APPLICATION_STATUS_VALUES)[number])) {
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

  await prisma.companyJobApplication.update({ where: { id: application.id }, data });
  return NextResponse.json({ ok: true });
}
