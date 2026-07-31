import { NextRequest, NextResponse } from "next/server";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";
import { generateBehavioralSummary } from "@/lib/tools";
import {
  BEHAVIORAL_QUESTIONS,
  computeBehavioralScores,
  PERSONALITY_TRAIT_LABELS,
  type BehavioralAnswers,
} from "@/lib/behavioral-test";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.aiSimpleAction);
  if (!session) return response!;

  try {
    const { answers, targetRole } = (await req.json()) as {
      answers: BehavioralAnswers;
      targetRole?: string;
    };

    if (!answers || BEHAVIORAL_QUESTIONS.some((q) => typeof answers[q.id] !== "number")) {
      await release!.cancel();
      return NextResponse.json(
        { error: "Responda todas as perguntas do teste." },
        { status: 400 }
      );
    }

    const { skillScores, personalityScores, dominantTrait } = computeBehavioralScores(answers);
    const summary = await generateBehavioralSummary(
      skillScores,
      personalityScores,
      dominantTrait,
      targetRole ?? ""
    );

    await prisma.softSkillTestResult.create({
      data: {
        userId: session.user.id,
        answers: JSON.stringify(answers),
        skillScores: JSON.stringify(skillScores),
        personalityType: dominantTrait,
        personalityLabel: PERSONALITY_TRAIT_LABELS[dominantTrait],
        summary: summary.profileSummary,
      },
    });

    await release!.confirm();
    return NextResponse.json({
      skillScores,
      personalityScores,
      dominantTrait,
      dominantTraitLabel: PERSONALITY_TRAIT_LABELS[dominantTrait],
      ...summary,
    });
  } catch (error) {
    await release!.cancel();
    console.error("Erro ao processar teste comportamental:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
