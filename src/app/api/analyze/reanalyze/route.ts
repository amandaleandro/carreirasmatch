import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { analyzeResumeAgainstJob, CareerTrack, StructuredResume } from "@/lib/groq";
import { verifyKeywords } from "@/lib/keyword-verify";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Faça login para reanalisar." }, { status: 401 });
    }

    const { analysisId, updatedText } = await req.json();
    if (!analysisId || !updatedText || typeof updatedText !== "string") {
      return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
    }

    const existing = await prisma.analysis.findUnique({
      where: { id: analysisId },
      include: { resume: true },
    });

    if (!existing || existing.resume.userId !== session.user.id) {
      return NextResponse.json({ error: "Análise não encontrada." }, { status: 404 });
    }

    let structured: StructuredResume | null = null;
    try {
      if (existing.resumeStructured) {
        structured = JSON.parse(existing.resumeStructured);
      }
    } catch {
      // ignore
    }

    // Executa a reanálise com o texto do currículo ajustado
    const updatedAnalysis = await analyzeResumeAgainstJob(
      updatedText,
      existing.jobTitle,
      existing.jobText,
      existing.careerTrack as CareerTrack,
      existing.pastFeedback ?? undefined,
      undefined,
      structured
    );

    // Valida as keywords determinística
    const verified = verifyKeywords(
      updatedAnalysis.keywordsFound,
      updatedAnalysis.keywordsMissing,
      updatedText,
      structured
    );

    updatedAnalysis.keywordsFound = verified.keywordsFound;
    updatedAnalysis.keywordsMissing = verified.keywordsMissing;

    // Atualiza a análise no banco com os novos scores e edições
    const updatedRecord = await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        overallScore: updatedAnalysis.overallScore,
        technicalScore: updatedAnalysis.technicalScore,
        experienceScore: updatedAnalysis.experienceScore,
        seniorityScore: updatedAnalysis.seniorityScore,
        atsScore: updatedAnalysis.atsScore,
        applicationStatus: updatedAnalysis.applicationStatus,
        applicationStatusReason: updatedAnalysis.applicationStatusReason,
        keywordsFound: JSON.stringify(updatedAnalysis.keywordsFound),
        keywordsMissing: JSON.stringify(updatedAnalysis.keywordsMissing),
        fixes: JSON.stringify(updatedAnalysis.fixes),
        strengths: JSON.stringify(updatedAnalysis.strengths),
        weaknesses: JSON.stringify(updatedAnalysis.weaknesses),
        studyPlan: JSON.stringify(updatedAnalysis.studyPlan),
        refinedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      overallScore: updatedRecord.overallScore,
      atsScore: updatedRecord.atsScore,
      technicalScore: updatedRecord.technicalScore,
      experienceScore: updatedRecord.experienceScore,
      seniorityScore: updatedRecord.seniorityScore,
      applicationStatus: updatedRecord.applicationStatus,
      keywordsFound: updatedAnalysis.keywordsFound,
      keywordsMissing: updatedAnalysis.keywordsMissing,
      fixes: updatedAnalysis.fixes,
    });
  } catch (error) {
    console.error("Erro na reanálise rápida:", error);
    return NextResponse.json(
      { error: "Não foi possível reanalisar no momento." },
      { status: 500 }
    );
  }
}
