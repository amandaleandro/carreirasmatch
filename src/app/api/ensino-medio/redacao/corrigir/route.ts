import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { evaluateEnemEssay } from "@/lib/ensino-medio-tools";
import { logStudyActivity } from "@/lib/study-activity";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, essayText } = body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json(
        { error: "O tema da redação é obrigatório." },
        { status: 400 }
      );
    }

    if (!essayText || typeof essayText !== "string" || essayText.trim().length < 50) {
      return NextResponse.json(
        { error: "A redação precisa ter no mínimo 50 caracteres para avaliação." },
        { status: 400 }
      );
    }

    const evaluation = await evaluateEnemEssay(topic.trim(), essayText.trim());

    const session = await auth();
    if (session?.user?.id) void logStudyActivity(session.user.id, "redacao_enem", evaluation.totalScore);

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("[API redacao/corrigir] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao avaliar a redação com o Gemini. Tente novamente." },
      { status: 500 }
    );
  }
}
