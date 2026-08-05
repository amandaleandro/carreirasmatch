import { NextResponse } from "next/server";
import { calculateEnemAnalysis } from "@/lib/ensino-medio-tools";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

export async function POST(req: Request) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.studyTool);
  if (!session) return response!;

  try {
    const body = await req.json();
    const { linguagens, humanas, natureza, matematica, redacao, targetCourse } = body;

    if (
      typeof linguagens !== "number" ||
      typeof humanas !== "number" ||
      typeof natureza !== "number" ||
      typeof matematica !== "number" ||
      typeof redacao !== "number" ||
      !targetCourse
    ) {
      await release!.cancel();
      return NextResponse.json(
        { error: "Todas as 5 notas do ENEM e o curso desejado são obrigatórios." },
        { status: 400 }
      );
    }

    const analysis = await calculateEnemAnalysis({
      linguagens,
      humanas,
      natureza,
      matematica,
      redacao,
      targetCourse,
    });

    await release!.confirm();
    return NextResponse.json(analysis);
  } catch (error) {
    await release!.cancel();
    console.error("[API calculadora-enem] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao calcular a nota com o Gemini." },
      { status: 500 }
    );
  }
}
