import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const currentProgress: string[] = JSON.parse(analysis.actionPlanProgress || "[]");
  const newProgress = Array.from(new Set([...currentProgress, "today-0", "today-1"]));

  const existingOverride = analysis.resumeOverride ? JSON.parse(analysis.resumeOverride) : {};
  const updated = await prisma.analysis.update({
    where: { id },
    data: { 
      resumeOverride: JSON.stringify({ ...existingOverride, ...body }),
      actionPlanProgress: JSON.stringify(newProgress),
    },
  });

  return NextResponse.json({ resumeOverride: updated.resumeOverride });
}
