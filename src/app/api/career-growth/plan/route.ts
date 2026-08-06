import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCareerGrowthPlan } from "@/lib/career-growth";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

export async function POST(req: NextRequest) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.careerGrowthPlan);
  if (!session) return response!;

  const { currentRole, currentSeniority, targetRole } = await req.json();
  if (typeof currentRole !== "string" || !currentRole.trim() || typeof targetRole !== "string" || !targetRole.trim()) {
    await release!.cancel();
    return NextResponse.json({ error: "Informe o cargo atual e o próximo cargo desejado." }, { status: 400 });
  }

  try {
    const lastAnalysis = await prisma.analysis.findFirst({
      where: { resume: { userId: session.user.id } },
      orderBy: { createdAt: "desc" },
      select: { strengths: true, weaknesses: true, fixes: true },
    });
    const pastAnalysis = lastAnalysis
      ? {
          strengths: JSON.parse(lastAnalysis.strengths) as string[],
          weaknesses: JSON.parse(lastAnalysis.weaknesses) as string[],
          fixes: JSON.parse(lastAnalysis.fixes) as string[],
        }
      : null;

    const generated = await generateCareerGrowthPlan(
      currentRole.trim(),
      typeof currentSeniority === "string" ? currentSeniority.trim() : "",
      targetRole.trim(),
      pastAnalysis
    );

    const plan = await prisma.careerGrowthPlan.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        currentRole: currentRole.trim(),
        currentSeniority: typeof currentSeniority === "string" ? currentSeniority.trim() : "",
        targetRole: targetRole.trim(),
        competencyGaps: JSON.stringify(generated.competencyGaps),
        developmentActions: JSON.stringify(generated.developmentActions),
        negotiationTalkingPoints: JSON.stringify(generated.negotiationTalkingPoints),
        leadershipReadiness: generated.leadershipReadiness,
        generatedAt: new Date(),
      },
      update: {
        currentRole: currentRole.trim(),
        currentSeniority: typeof currentSeniority === "string" ? currentSeniority.trim() : "",
        targetRole: targetRole.trim(),
        competencyGaps: JSON.stringify(generated.competencyGaps),
        developmentActions: JSON.stringify(generated.developmentActions),
        negotiationTalkingPoints: JSON.stringify(generated.negotiationTalkingPoints),
        leadershipReadiness: generated.leadershipReadiness,
        generatedAt: new Date(),
      },
    });

    await release!.confirm();
    return NextResponse.json({ plan });
  } catch (error) {
    await release!.cancel();
    console.error("Erro ao gerar plano de evolução profissional:", error);
    return NextResponse.json({ error: "Erro ao processar. Tente novamente." }, { status: 500 });
  }
}
