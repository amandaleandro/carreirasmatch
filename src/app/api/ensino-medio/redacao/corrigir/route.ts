import { NextResponse } from "next/server";
import { evaluateEnemEssay } from "@/lib/ensino-medio-tools";
import { logStudyActivity } from "@/lib/study-activity";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

export async function POST(req: Request) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.studyTool);
  if (!session) return response!;

  try {
    const body = await req.json();
    const { topic, essayText } = body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      await release!.cancel();
      return NextResponse.json(
        { error: "O tema da redação é obrigatório." },
        { status: 400 }
      );
    }

    if (!essayText || typeof essayText !== "string" || essayText.trim().length < 50) {
      await release!.cancel();
      return NextResponse.json(
        { error: "A redação precisa ter no mínimo 50 caracteres para avaliação." },
        { status: 400 }
      );
    }

    const evaluation = await evaluateEnemEssay(topic.trim(), essayText.trim());

    void logStudyActivity(session.user.id, "redacao_enem", evaluation.totalScore);

    await release!.confirm();
    return NextResponse.json(evaluation);
  } catch (error) {
    await release!.cancel();
    console.error("[API redacao/corrigir] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao avaliar a redação com o Gemini. Tente novamente." },
      { status: 500 }
    );
  }
}
