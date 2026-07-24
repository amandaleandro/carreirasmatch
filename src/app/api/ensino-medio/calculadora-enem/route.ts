import { NextResponse } from "next/server";
import { calculateEnemAnalysis } from "@/lib/ensino-medio-tools";

export async function POST(req: Request) {
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

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("[API calculadora-enem] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao calcular a nota com o Gemini." },
      { status: 500 }
    );
  }
}
