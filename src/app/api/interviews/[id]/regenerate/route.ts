import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { hasActiveSubscriptionAccess } from "@/lib/entitlements";
import { generateInterviewQuestions } from "@/lib/tools";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  if (!(await hasActiveSubscriptionAccess(session.user.id))) {
    return NextResponse.json({ error: "Assine o plano mensal para continuar." }, { status: 402 });
  }

  const { id } = await params;

  const analysis = await prisma.analysis.findUnique({
    where: { id },
    include: { resume: true },
  });

  if (!analysis || analysis.resume.userId !== session.user.id) {
    return NextResponse.json({ error: "Análise não encontrada." }, { status: 404 });
  }

  try {
    const questions = await generateInterviewQuestions(analysis.jobTitle, analysis.jobText);

    const updated = await prisma.analysis.update({
      where: { id },
      data: {
        interviewQuestions: JSON.stringify(questions),
        interviewProgress: JSON.stringify({}),
      },
    });

    return NextResponse.json({ questions, interviewProgress: updated.interviewProgress });
  } catch (error) {
    console.error("Erro ao gerar novas perguntas de entrevista:", error);
    return NextResponse.json(
      { error: "Erro ao gerar novas perguntas. Tente novamente." },
      { status: 500 }
    );
  }
}
