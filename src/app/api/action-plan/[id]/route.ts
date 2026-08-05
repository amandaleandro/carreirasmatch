import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Só alterna o "feito" de itens do plano de ação já gerado; nenhum conteúdo novo é
  // gerado aqui, então não há gate de plano/quota a aplicar — só login.
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const { id } = await params;
  const body = await req.json();

  const analysis = await prisma.analysis.findUnique({
    where: { id },
    include: { resume: true },
  });

  if (!analysis || analysis.resume.userId !== session.user.id) {
    return NextResponse.json({ error: "Análise não encontrada." }, { status: 404 });
  }

  const checked: string[] = Array.isArray(body.checked) ? body.checked : [];

  const updated = await prisma.analysis.update({
    where: { id },
    data: { actionPlanProgress: JSON.stringify(checked) },
  });

  return NextResponse.json({ actionPlanProgress: updated.actionPlanProgress });
}
