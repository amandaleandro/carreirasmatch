import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { generateResumeFromScratch } from "@/lib/tools";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireToolAccess("/tools/resume-from-scratch");
    if (!session) return response!;

    const body = await req.json();
    const { fullName, education, projects, skills, targetRole, jobTitle, jobText } = body;

    if (!education?.trim() || !projects?.trim() || !skills?.trim()) {
      return NextResponse.json(
        { error: "Preencha formação, projetos/atividades e habilidades." },
        { status: 400 }
      );
    }

    const result = await generateResumeFromScratch({
      fullName: fullName ?? "",
      education,
      projects,
      skills,
      targetRole: targetRole ?? "",
      jobTitle: jobTitle ?? "",
      jobText: jobText ?? "",
    });

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        fileName: "Currículo gerado do zero",
        rawText: result.summary,
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

    return NextResponse.json({ analysisId: analysis.id });
  } catch (error) {
    console.error("Erro ao gerar currículo do zero:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
