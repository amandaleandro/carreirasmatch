import { NextResponse } from "next/server";
import { compareCollegeVsTechnical } from "@/lib/ensino-medio-tools";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

export async function POST(req: Request) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.studyTool);
  if (!session) return response!;

  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      await release!.cancel();
      return NextResponse.json(
        { error: "Informe a área ou curso para comparação." },
        { status: 400 }
      );
    }

    const comparison = await compareCollegeVsTechnical(query.trim());
    await release!.confirm();
    return NextResponse.json(comparison);
  } catch (error) {
    await release!.cancel();
    console.error("[API comparador/analisar] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao comparar as formações com o Gemini." },
      { status: 500 }
    );
  }
}
