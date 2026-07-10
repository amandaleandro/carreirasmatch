import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { generateBehavioralSummary } from "@/lib/tools";
import {
  BEHAVIORAL_QUESTIONS,
  computeBehavioralScores,
  PERSONALITY_TRAIT_LABELS,
  type BehavioralAnswers,
} from "@/lib/behavioral-test";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireToolAccess("/tools/behavioral-test");
    if (!session) return response!;

    const { answers, targetRole } = (await req.json()) as {
      answers: BehavioralAnswers;
      targetRole?: string;
    };

    if (!answers || BEHAVIORAL_QUESTIONS.some((q) => typeof answers[q.id] !== "number")) {
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

    return NextResponse.json({
      skillScores,
      personalityScores,
      dominantTrait,
      dominantTraitLabel: PERSONALITY_TRAIT_LABELS[dominantTrait],
      ...summary,
    });
  } catch (error) {
    console.error("Erro ao processar teste comportamental:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
