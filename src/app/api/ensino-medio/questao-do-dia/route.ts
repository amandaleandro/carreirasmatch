import { NextResponse } from "next/server";
import { getDailyQuestion } from "@/lib/ensino-medio-tools";

export async function GET() {
  try {
    const question = await getDailyQuestion();
    return NextResponse.json(question);
  } catch (error) {
    console.error("[API questao-do-dia] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao obter a questão do dia com o Gemini." },
      { status: 500 }
    );
  }
}
