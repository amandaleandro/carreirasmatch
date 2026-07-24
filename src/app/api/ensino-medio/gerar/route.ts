import { NextResponse } from "next/server";
import { generateEnsinoMedioMaterial } from "@/lib/ensino-medio";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subjectSlug, topic } = body;

    if (!subjectSlug || typeof subjectSlug !== "string") {
      return NextResponse.json(
        { error: "O parâmetro subjectSlug é obrigatório." },
        { status: 400 }
      );
    }

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json(
        { error: "O parâmetro topic é obrigatório." },
        { status: 400 }
      );
    }

    const content = await generateEnsinoMedioMaterial(subjectSlug, topic.trim());
    return NextResponse.json(content);
  } catch (error) {
    console.error("[API ensino-medio/gerar] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao gerar material com o Gemini. Tente novamente." },
      { status: 500 }
    );
  }
}
