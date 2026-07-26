import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { classifyArea, resolveFreeText } from "@/lib/area-taxonomy";
import { extractTechSkills } from "@/lib/feed-tags";

const STOPWORDS = new Set([
  "para", "com", "como", "mais", "sobre", "entre", "onde", "quando", "mesmo",
  "todos", "foram", "sendo", "fazer", "suas", "seus", "muito", "anos", "area",
  "experiencia", "projeto", "projetos", "trabalho", "atuacao", "responsavel",
  "empresa", "profissional", "conhecimento", "atividades", "desenvolvimento",
  "requisitos", "diferencial", "oportunidade", "vaga", "equipe", "cliente",
]);

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function tokens(value: string): string[] {
  return normalize(value)
    .split(/[^a-z0-9+#.]+/)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });

    const [user, latestResume] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          interestedRoles: true,
          professionalArea: true,
          targetProfessionalArea: true,
          currentProfessionalArea: true,
          studyCourse: true,
          city: true,
          state: true,
        },
      }),
      prisma.resume.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: { analyses: { orderBy: { createdAt: "desc" }, take: 1 } },
      }),
    ]);

    let interestedRolesList: string[] = [];
    try {
      if (user?.interestedRoles) interestedRolesList = JSON.parse(user.interestedRoles);
    } catch { /* perfil antigo ou valor inválido */ }

    const latestAnalysis = latestResume?.analyses?.[0];
    const candidateTargetRoles = Array.from(new Set([
      latestAnalysis?.jobTitle,
      user?.targetProfessionalArea,
      user?.professionalArea,
      user?.currentProfessionalArea,
      user?.studyCourse,
      ...interestedRolesList,
    ].filter(Boolean).map((value) => String(value).trim())));

    const candidateKeywordsSet = new Set<string>();
    if (latestAnalysis?.keywordsFound) {
      try {
        const parsed = JSON.parse(latestAnalysis.keywordsFound);
        if (Array.isArray(parsed)) parsed.forEach((value) => candidateKeywordsSet.add(normalize(String(value))));
      } catch {
        latestAnalysis.keywordsFound.split(",").forEach((value) => candidateKeywordsSet.add(normalize(value.trim())));
      }
    }
    if (latestResume?.rawText) {
      extractTechSkills(latestResume.rawText).forEach((skill) => candidateKeywordsSet.add(normalize(skill)));
    }

    const candidateKeywords = Array.from(candidateKeywordsSet).filter((keyword) => tokens(keyword).length > 0);
    const hasProfileContext = candidateTargetRoles.length > 0 || candidateKeywords.length > 0;
    const profileAreaText = [user?.targetProfessionalArea, user?.professionalArea, user?.currentProfessionalArea, user?.studyCourse]
      .filter(Boolean).join(" ");
    const profileArea = resolveFreeText(profileAreaText);
    const profileTokens = new Set(candidateTargetRoles.flatMap(tokens));

    const now = new Date();
    const jobs = await prisma.job.findMany({
      // Vagas antigas/importadas podem não ter recebido o campo active na
      // migração. Elas continuam válidas enquanto não estiverem expiradas.
      where: {
        OR: [
          { active: true, OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
          { active: false, OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
        ],
      },
      take: 100,
      orderBy: { createdAt: "desc" },
      select: { id: true, jobTitle: true, company: true, location: true, jobText: true, url: true, area: true, createdAt: true },
    });

    const formattedRadarFeed = jobs.map((job) => {
      const normalizedTitle = normalize(job.jobTitle);
      const normalizedText = normalize(`${job.jobTitle} ${job.jobText || ""}`);
      const classification = classifyArea(`${job.jobTitle} ${job.jobText}`, job.area);
      const jobArea = resolveFreeText(classification.area);
      const titleTokens = new Set(tokens(job.jobTitle));
      const titleOverlap = [...profileTokens].filter((token) => titleTokens.has(token)).length;

      let matchScore = hasProfileContext ? 20 : 55;
      let matchedRole: string | null = null;
      const matchedSkills: string[] = [];

      for (const role of candidateTargetRoles) {
        const roleText = normalize(role);
        if (normalizedTitle.includes(roleText) || roleText.includes(normalizedTitle)) {
          matchScore += 45;
          matchedRole = role;
          break;
        }
        const overlap = tokens(role).filter((token) => normalizedTitle.includes(token)).length;
        if (overlap > 0) {
          matchScore += Math.min(30, overlap * 15);
          matchedRole = role;
          break;
        }
      }

      for (const keyword of candidateKeywords) {
        if (keyword.length >= 3 && normalizedText.includes(keyword)) {
          matchedSkills.push(keyword);
          matchScore += 5;
        }
      }
      matchScore += Math.min(15, titleOverlap * 5);

      // Áreas diferentes podem representar transição, mas nunca devem parecer
      // uma alta aderência por causa de palavras genéricas compartilhadas.
      if (profileArea && jobArea && profileArea.areaSlug !== jobArea.areaSlug) matchScore -= 35;

      const finalScore = Math.min(Math.max(matchScore, 0), 98);
      const topSkills = Array.from(new Set(matchedSkills)).filter((skill) => skill.length > 3).slice(0, 3);
      let recommendationReason = "Vaga recente disponível no radar.";
      if (topSkills.length > 0) recommendationReason = `Alinhada às competências: ${topSkills.map((skill) => skill.toUpperCase()).join(", ")}.`;
      else if (matchedRole) recommendationReason = `Cargo relacionado ao seu objetivo: ${matchedRole}.`;
      else if (profileArea && jobArea && profileArea.areaSlug !== jobArea.areaSlug) recommendationReason = "Área diferente do seu foco profissional; confira antes de se candidatar.";

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

    const relevantFeed = (hasProfileContext ? formattedRadarFeed.filter((item) => item.matchScore >= 35) : formattedRadarFeed)
      .sort((a, b) => b.matchScore - a.matchScore || b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 60);

    return NextResponse.json({ success: true, interestedRoles: interestedRolesList, radarFeed: relevantFeed });
  } catch (error) {
    console.error("Erro ao buscar feed do radar:", error);
    return NextResponse.json({ error: "Falha ao carregar Radar de Oportunidades." }, { status: 500 });
  }
}
