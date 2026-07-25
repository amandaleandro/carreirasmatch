import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Autenticação necessária." },
        { status: 401 }
      );
    }

    // 1. Busca dados do usuário, cargo de interesse e área profissional
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        interestedRoles: true,
        professionalArea: true,
        city: true,
        state: true,
      },
    });

    // 2. Busca o último currículo e a última análise do usuário no banco
    const latestResume = await prisma.resume.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        analyses: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
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

    const latestAnalysis = latestResume?.analyses?.[0];
    const candidateTargetRoles: string[] = Array.from(
      new Set(
        [
          latestAnalysis?.jobTitle,
          latestAnalysis?.careerTrack,
          user?.professionalArea,
          ...interestedRolesList,
        ]
          .filter(Boolean)
          .map((r) => String(r).trim().toLowerCase())
      )
    );

    // Extrai palavras-chave do currículo e da análise
    const candidateKeywordsSet = new Set<string>();
    if (latestAnalysis?.keywordsFound) {
      try {
        const parsed = JSON.parse(latestAnalysis.keywordsFound);
        if (Array.isArray(parsed)) {
          parsed.forEach((k) => candidateKeywordsSet.add(String(k).toLowerCase()));
        }
      } catch {
        latestAnalysis.keywordsFound
          .split(",")
          .forEach((k) => candidateKeywordsSet.add(k.trim().toLowerCase()));
      }
    }

    // Adiciona termos relevantes do rawText do currículo (tecnologias/skills de 3+ letras)
    if (latestResume?.rawText) {
      const words = latestResume.rawText.match(/[a-zA-ZÀ-ÿ0-9+#.-]{3,}/g) || [];
      const commonStopwords = new Set([
        "para", "com", "como", "mais", "sobre", "entre", "onde", "quando",
        "mesmo", "todos", "foram", "sendo", "fazer", "suas", "seus", "muito",
        "anos", "área", "experiência", "projeto", "projetos", "trabalho", "atuação"
      ]);
      words.forEach((w) => {
        const clean = w.toLowerCase();
        if (clean.length >= 3 && !commonStopwords.has(clean)) {
          candidateKeywordsSet.add(clean);
        }
      });
    }

    const candidateKeywords = Array.from(candidateKeywordsSet);
    const hasProfileContext = candidateTargetRoles.length > 0 || candidateKeywords.length > 0;

    // 3. Busca vagas no banco de dados
    const jobs = await prisma.job.findMany({
      take: 100,
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

    // 4. Calcula o score de match real e fundamentado para cada vaga
    const formattedRadarFeed = jobs.map((job) => {
      const jobTitleLower = job.jobTitle.toLowerCase();
      const jobTextLower = (job.jobTitle + " " + (job.jobText || "")).toLowerCase();

      let matchScore = hasProfileContext ? 40 : 70; // Pontuação base
      let matchedRole: string | null = null;
      const matchedSkills: string[] = [];

      // A) Verificação de alinhamento com título/cargo almejado
      for (const role of candidateTargetRoles) {
        if (role && (jobTitleLower.includes(role) || role.includes(jobTitleLower))) {
          matchScore += 35;
          matchedRole = role;
          break;
        } else if (role) {
          // Checa sobreposição parcial de palavras do cargo (ex: "DevOps" em "DevOps Specialist")
          const roleTokens = role.split(/\s+/).filter((t) => t.length > 3);
          const hasTokenMatch = roleTokens.some((token) => jobTitleLower.includes(token));
          if (hasTokenMatch) {
            matchScore += 20;
            matchedRole = role;
            break;
          }
        }
      }

      // B) Verificação de sobreposição de competências/skills presentes no currículo
      for (const kw of candidateKeywords) {
        if (kw.length >= 3 && jobTextLower.includes(kw)) {
          matchedSkills.push(kw);
          matchScore += 4;
        }
      }

      // Limita score entre 35 e 98
      const finalScore = Math.min(Math.max(matchScore, 35), 98);

      // C) Motivo da recomendação personalizado
      let recommendationReason = "Vaga relevante disponível no radar diário.";
      const topSkillsMatched = Array.from(new Set(matchedSkills))
        .filter((s) => s.length > 3)
        .slice(0, 3)
        .map((s) => s.toUpperCase());

      if (topSkillsMatched.length > 0) {
        recommendationReason = `Alinhado com as competências do seu currículo: ${topSkillsMatched.join(", ")}.`;
      } else if (matchedRole) {
        recommendationReason = `Foco profissional em ${matchedRole.toUpperCase()} alinhado com seu perfil.`;
      } else if (finalScore >= 80) {
        recommendationReason = "Alta compatibilidade identificada com seu histórico profissional.";
      } else if (finalScore < 60) {
        recommendationReason = "Oportunidade da área com menor sobreposição direta de requisitos.";
      }

      return {
        id: job.id,
        title: job.jobTitle,
        companyName: job.company,
        location: job.location,
        description: job.jobText,
        jobUrl: job.url,
        createdAt: job.createdAt,
        matchScore: finalScore,
        recommendationReason,
      };
    });

    // 5. Ordena o Radar Feed por MAIOR score de match primeiro
    formattedRadarFeed.sort((a, b) => b.matchScore - a.matchScore);

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
