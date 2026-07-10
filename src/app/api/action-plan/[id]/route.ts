import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { hasActiveSubscriptionAccess } from "@/lib/entitlements";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  if (!(await hasActiveSubscriptionAccess(session.user.id))) {
    return NextResponse.json({ error: "Assine o plano mensal para continuar." }, { status: 402 });
  }

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
