import { NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";

async function ownVaga(companyId: string, id: string) {
  return prisma.companyVaga.findFirst({ where: { id, companyId }, select: { id: true } });
}

// Edita a vaga (dados e/ou status aberto/fechado).
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  const { id } = await params;
  const vaga = await ownVaga(company.id, id);
  if (!vaga) return NextResponse.json({ error: "Vaga não encontrada." }, { status: 404 });

  let body: { title?: string; description?: string; area?: string; state?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const data: Record<string, string> = {};

  if (body.status !== undefined) {
    if (body.status !== "open" && body.status !== "closed") {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }
    data.status = body.status;
  }

  if (body.title !== undefined || body.description !== undefined) {
    const title = (body.title ?? "").trim();
    const description = (body.description ?? "").trim();
    if (!title || !description) {
      return NextResponse.json({ error: "Preencha o cargo e a descrição da vaga." }, { status: 400 });
    }
    data.title = title;
    data.description = description;
    data.area = (body.area ?? "").trim();
    data.state = (body.state ?? "").trim().toUpperCase().slice(0, 2);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  }

  await prisma.companyVaga.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}

// Exclui a vaga.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  const { id } = await params;
  const vaga = await ownVaga(company.id, id);
  if (!vaga) return NextResponse.json({ error: "Vaga não encontrada." }, { status: 404 });

  await prisma.companyVaga.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
