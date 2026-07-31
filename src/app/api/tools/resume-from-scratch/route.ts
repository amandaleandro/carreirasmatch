import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { reserveFeatureForSession } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";
import { generateResumeFromScratch, serializeResumeFromScratch } from "@/lib/tools";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { session, response: authResponse } = await requireToolAccess("/tools/resume-from-scratch");
  if (!session) return authResponse!;

  const { allowed, response: quotaResponse, release } = await reserveFeatureForSession(
    session.user.id,
    COMMERCIAL_FEATURE_KEYS.resumeByJob
  );
  if (!allowed) return quotaResponse!;

  try {
    const body = await req.json();
    const { fullName, education, projects, skills, targetRole, jobTitle, jobText } = body;

    if (!education?.trim() || !projects?.trim() || !skills?.trim()) {
      await release.cancel();
      return NextResponse.json(
        { error: "Preencha formação, projetos/atividades e habilidades." },
        { status: 400 }
      );
    }

    const softSkillResult = await prisma.softSkillTestResult.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { personalityLabel: true, summary: true },
    });

    const result = await generateResumeFromScratch({
      fullName: fullName ?? "",
      education,
      projects,
      skills,
      targetRole: targetRole ?? "",
      jobTitle: jobTitle ?? "",
      jobText: jobText ?? "",
      softSkillsSummary: softSkillResult
        ? `${softSkillResult.personalityLabel}. ${softSkillResult.summary}`
        : undefined,
    });

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        fileName: "Currículo gerado do zero",
        rawText: serializeResumeFromScratch(result),
      },
    });

    const analysis = await prisma.analysis.create({
      data: {
        resumeId: resume.id,
        careerTrack: "from_scratch",
        jobTitle: jobTitle?.trim() || targetRole?.trim() || "Currículo do zero",
        jobText: jobText ?? "",
        overallScore: 0,
        technicalScore: 0,
        experienceScore: 0,
        seniorityScore: 0,
        atsScore: 0,
        applicationStatus: "draft",
        applicationStatusReason: "Currículo criado do zero, ainda não foi analisado contra uma vaga.",
        keywordsFound: "[]",
        keywordsMissing: "[]",
        suggestedSummary: result.summary,
        currentSummary: "Nenhum resumo anterior, currículo gerado do zero.",
        strengths: "[]",
        weaknesses: "[]",
        fixes: "[]",
        interviewQuestions: "[]",
        studyPlan: "[]",
        recruiterMessage: "",
        alternativeRoles: "[]",
        experienceSuggestions: "[]",
        atsChecklist: "[]",
        resumeStructured: JSON.stringify(result.resumeStructured),
      },
    });

    await release.confirm();
    return NextResponse.json({ analysisId: analysis.id });
  } catch (error) {
    await release.cancel();
    console.error("Erro ao gerar currículo do zero:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
