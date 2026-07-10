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

  let progress: Record<string, unknown> = {};
  try {
    progress = JSON.parse(analysis.interviewProgress || "{}");
  } catch {
    progress = {};
  }

  if (body.reset) {
    progress = {};
  } else if (body.progress && typeof body.progress === "object") {
    progress = body.progress;
  } else if (typeof body.index === "number") {
    progress[String(body.index)] = body.entry;
  }

  const updated = await prisma.analysis.update({
    where: { id },
    data: { interviewProgress: JSON.stringify(progress) },
  });

  return NextResponse.json({ interviewProgress: updated.interviewProgress });
}
