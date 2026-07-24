import { NextResponse } from "next/server";
import { compareCollegeVsTechnical } from "@/lib/ensino-medio-tools";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Informe a área ou curso para comparação." },
        { status: 400 }
      );
    }

    const comparison = await compareCollegeVsTechnical(query.trim());
    return NextResponse.json(comparison);
  } catch (error) {
    console.error("[API comparador/analisar] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao comparar as formações com o Gemini." },
      { status: 500 }
    );
  }
}
