import { NextResponse } from "next/server";
import { generateEnsinoMedioMaterial } from "@/lib/ensino-medio";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

export async function POST(req: Request) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.studyTool);
  if (!session) return response!;

  try {
    const body = await req.json();
    const { subjectSlug, topic } = body;

    if (!subjectSlug || typeof subjectSlug !== "string") {
      await release!.cancel();
      return NextResponse.json(
        { error: "O parâmetro subjectSlug é obrigatório." },
        { status: 400 }
      );
    }

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      await release!.cancel();
      return NextResponse.json(
        { error: "O parâmetro topic é obrigatório." },
        { status: 400 }
      );
    }

    const content = await generateEnsinoMedioMaterial(subjectSlug, topic.trim());
    await release!.confirm();
    return NextResponse.json(content);
  } catch (error) {
    await release!.cancel();
    console.error("[API ensino-medio/gerar] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao gerar material com o Gemini. Tente novamente." },
      { status: 500 }
    );
  }
}
