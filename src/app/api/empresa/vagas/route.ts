import { NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";
import { runVagaMatch } from "@/lib/company-vaga";

// Cadastra uma vaga e já roda o matching do banco de talentos.
export async function POST(req: Request) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  let body: { title?: string; description?: string; area?: string; state?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  const description = (body.description ?? "").trim();
  const area = (body.area ?? "").trim();
  const state = (body.state ?? "").trim().toUpperCase().slice(0, 2);

  if (!title || !description) {
    return NextResponse.json({ error: "Preencha o cargo e a descrição da vaga." }, { status: 400 });
  }

  const vaga = await prisma.companyVaga.create({
    data: { companyId: company.id, title, description, area, state },
  });

  // Roda o matching inicial; se a IA falhar, a vaga fica criada e o usuário pode
  // usar "Atualizar candidatos" depois.
  try {
    await runVagaMatch({ id: vaga.id, companyId: company.id, title, description, area, state });
  } catch {
    // silencioso: a vaga já existe, o rematch resolve.
  }

  return NextResponse.json({ id: vaga.id });
}
