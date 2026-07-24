import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Autenticação necessária." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        interestedRoles: true,
        professionalArea: true,
        city: true,
        state: true,
      },
    });

    let interestedRolesList: string[] = [];
    try {
      if (user?.interestedRoles) {
        interestedRolesList = JSON.parse(user.interestedRoles);
      }
    } catch {
      interestedRolesList = [];
    }

    // Busca vagas recentes no banco do feed
    const jobs = await prisma.job.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        jobTitle: true,
        company: true,
        location: true,
        jobText: true,
        url: true,
        createdAt: true,
      },
    });

    // Calcula aderência simples baseada no alinhamento de título e área
    const formattedRadarFeed = jobs.map((job) => {
      const titleLower = job.jobTitle.toLowerCase();
      let matchScore = 70; // Score base do radar

      if (interestedRolesList.some((role) => titleLower.includes(role.toLowerCase()))) {
        matchScore += 20;
      }
      if (user?.professionalArea && titleLower.includes(user.professionalArea.toLowerCase())) {
        matchScore += 8;
      }

      return {
        id: job.id,
        title: job.jobTitle,
        companyName: job.company,
        location: job.location,
        description: job.jobText,
        jobUrl: job.url,
        createdAt: job.createdAt,
        matchScore: Math.min(matchScore, 98),
        recommendationReason: matchScore >= 85
          ? "Alta aderência com os cargos de seu perfil de interesse."
          : "Vaga relevante encontrada no feed diário.",
      };
    });

    return NextResponse.json({
      success: true,
      interestedRoles: interestedRolesList,
      radarFeed: formattedRadarFeed,
    });
  } catch (error) {
    console.error("Erro ao buscar feed do radar:", error);
    return NextResponse.json(
      { error: "Falha ao carregar Radar de Oportunidades." },
      { status: 500 }
    );
  }
}
