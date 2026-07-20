import { NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";

// Exclui uma triagem (e os candidatos associados via cascade).
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  const { id } = await params;
  const job = await prisma.companyJob.findFirst({
    where: { id, companyId: company.id },
    select: { id: true },
  });
  if (!job) return NextResponse.json({ error: "Triagem não encontrada." }, { status: 404 });

  await prisma.companyJob.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
