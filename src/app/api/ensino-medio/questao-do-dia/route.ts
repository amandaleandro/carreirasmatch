import { NextResponse } from "next/server";
import { getDailyQuestion } from "@/lib/ensino-medio-tools";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

export async function GET() {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.studyTool);
  if (!session) return response!;

  try {
    const question = await getDailyQuestion();
    await release!.confirm();
    return NextResponse.json(question);
  } catch (error) {
    await release!.cancel();
    console.error("[API questao-do-dia] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao obter a questão do dia com o Gemini." },
      { status: 500 }
    );
  }
}
