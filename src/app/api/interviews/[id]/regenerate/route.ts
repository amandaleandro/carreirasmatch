import { NextRequest, NextResponse } from "next/server";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { prisma } from "@/lib/prisma";
import { generateInterviewQuestions } from "@/lib/tools";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response, release } = await reserveFeatureForRoute("interview.complete");
  if (!session) return response!;

  const { id } = await params;

  const analysis = await prisma.analysis.findUnique({
    where: { id },
    include: { resume: true },
  });

  if (!analysis || analysis.resume.userId !== session.user.id) {
    await release!.cancel();
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

    await release!.confirm();
    return NextResponse.json({ questions, interviewProgress: updated.interviewProgress });
  } catch (error) {
    await release!.cancel();
    console.error("Erro ao gerar novas perguntas de entrevista:", error);
    return NextResponse.json(
      { error: "Erro ao gerar novas perguntas. Tente novamente." },
      { status: 500 }
    );
  }
}
