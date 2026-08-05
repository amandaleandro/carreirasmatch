import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { markFirstAction } from "@/lib/first-action";

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

  // Só marca a primeira ação quando o usuário de fato respondeu uma pergunta
  // (não em reset nem em uma sincronização de progresso vazia).
  if (typeof body.index === "number") {
    void markFirstAction(session.user.id);
  }

  return NextResponse.json({ interviewProgress: updated.interviewProgress });
}
