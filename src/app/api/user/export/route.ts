import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  }

  const userId = session.user.id;

  const [user, resumes, applications, courses, jobAlerts, supportTickets, softSkillResults, vocationResults] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          careerSegment: true,
          employmentStatus: true,
          professionalArea: true,
          currentProfessionalArea: true,
          targetProfessionalArea: true,
          studyCourse: true,
          city: true,
          state: true,
          hasFormalEducation: true,
          interestedRoles: true,
          createdAt: true,
        },
      }),
      prisma.resume.findMany({
        where: { userId },
        select: {
          id: true,
          fileName: true,
          rawText: true,
          createdAt: true,
          analyses: {
            select: {
              id: true,
              jobTitle: true,
              overallScore: true,
              technicalScore: true,
              experienceScore: true,
              seniorityScore: true,
              atsScore: true,
              keywordsFound: true,
              keywordsMissing: true,
              suggestedSummary: true,
              strengths: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.application.findMany({
        where: { userId },
        select: {
          id: true,
          company: true,
          jobTitle: true,
          jobUrl: true,
          status: true,
          notes: true,
          appliedAt: true,
          createdAt: true,
        },
      }),
      prisma.userCourse.findMany({ where: { userId } }),
      prisma.jobAlert.findMany({ where: { userId } }),
      prisma.supportTicket.findMany({
        where: { userId },
        select: { id: true, subject: true, status: true, createdAt: true },
      }),
      prisma.softSkillTestResult.findMany({ where: { userId } }),
      prisma.vocationTestResult.findMany({ where: { userId } }),
    ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    perfil: user,
    curriculos: resumes,
    candidaturas: applications,
    cursos: courses,
    alertasDeVaga: jobAlerts,
    chamadosSuporte: supportTickets,
    testesSoftSkills: softSkillResults,
    testesVocacionais: vocationResults,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="carreirasmatch-meus-dados-${userId}.json"`,
    },
  });
}
