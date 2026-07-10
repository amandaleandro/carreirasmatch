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

  const updated = await prisma.analysis.update({
    where: { id },
    data: { resumeOverride: JSON.stringify(body) },
  });

  return NextResponse.json({ resumeOverride: updated.resumeOverride });
}
