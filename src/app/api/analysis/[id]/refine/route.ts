import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { refineAnalysisWithAnswers } from "@/lib/groq";

type AnswerInput = { question: string; targetKeyword: string; answer: string };

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const { id } = await params;

  const analysis = await prisma.analysis.findUnique({
    where: { id },
    include: { resume: true },
  });

  if (!analysis || analysis.resume.userId !== session.user.id) {
    return NextResponse.json({ error: "Análise não encontrada." }, { status: 404 });
  }

  if (analysis.refinedAt) {
    return NextResponse.json(
      { error: "Esta análise já foi atualizada com respostas uma vez." },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => null);
  const answers: AnswerInput[] = Array.isArray(body?.answers) ? body.answers : [];
  const withContent = answers.filter((a) => a?.answer?.trim());

  if (withContent.length === 0) {
    return NextResponse.json(
      { error: "Responda pelo menos uma pergunta." },
      { status: 400 }
    );
  }

  try {
    const refinement = await refineAnalysisWithAnswers(
      analysis.jobText,
      JSON.parse(analysis.keywordsFound),
      JSON.parse(analysis.keywordsMissing),
      withContent
    );

    await prisma.analysis.update({
      where: { id },
      data: {
        keywordsFound: JSON.stringify(refinement.keywordsFound),
        keywordsMissing: JSON.stringify(refinement.keywordsMissing),
        technicalScore: refinement.technicalScore,
        overallScore: refinement.overallScore,
        applicationStatus: refinement.applicationStatus,
        applicationStatusReason: refinement.applicationStatusReason,
        clarifyingAnswers: JSON.stringify(withContent),
        refinedAt: new Date(),
      },
    });

    return NextResponse.json({
      refinementSummary: refinement.refinementSummary,
      suggestedBullets: refinement.suggestedBullets,
      overallScore: refinement.overallScore,
      technicalScore: refinement.technicalScore,
    });
  } catch (error) {
    console.error("Erro ao refinar análise:", error);
    return NextResponse.json(
      { error: "Não foi possível atualizar a análise. Tente novamente." },
      { status: 500 }
    );
  }
}
