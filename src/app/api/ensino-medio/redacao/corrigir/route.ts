import { NextResponse } from "next/server";
import { evaluateEnemEssay } from "@/lib/ensino-medio-tools";

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
    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("[API redacao/corrigir] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao avaliar a redação com o Gemini. Tente novamente." },
      { status: 500 }
    );
  }
}
