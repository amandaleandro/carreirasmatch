import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { generateConcursoMockExam } from "@/lib/tools";

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireToolAccess("/tools/concurso/simulado");
    if (!session) return response!;

    const { cargo, banca, disciplina } = await req.json();

    if (!disciplina || !String(disciplina).trim()) {
      return NextResponse.json({ error: "Escolha a disciplina do simulado." }, { status: 400 });
    }

    const result = await generateConcursoMockExam({
      cargo: String(cargo ?? ""),
      banca: String(banca ?? ""),
      disciplina: String(disciplina),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao gerar simulado de concurso:", error);
    return NextResponse.json({ error: "Erro ao processar. Tente novamente." }, { status: 500 });
  }
}
