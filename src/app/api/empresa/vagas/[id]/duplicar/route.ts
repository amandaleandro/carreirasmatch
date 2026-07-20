import { NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";
import { runVagaMatch } from "@/lib/company-vaga";

// Duplica uma vaga (mesma descrição) e roda o matching na cópia.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  const { id } = await params;
  const original = await prisma.companyVaga.findFirst({
    where: { id, companyId: company.id },
    select: { title: true, description: true, area: true, state: true },
  });
  if (!original) return NextResponse.json({ error: "Vaga não encontrada." }, { status: 404 });

  const copy = await prisma.companyVaga.create({
    data: {
      companyId: company.id,
      title: `${original.title} (cópia)`.slice(0, 140),
      description: original.description,
      area: original.area,
      state: original.state,
    },
  });

  try {
    await runVagaMatch({
      id: copy.id,
      companyId: company.id,
      title: copy.title,
      description: copy.description,
      area: copy.area,
      state: copy.state,
    });
  } catch {
    // A cópia já existe; o "Atualizar candidatos" resolve depois.
  }

  return NextResponse.json({ id: copy.id });
}
