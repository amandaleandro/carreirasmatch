import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { runJsonPrompt } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Faça login para utilizar a Matriz de Skills." }, { status: 401 });
    }

    const { previousRole, targetRole, previousSkills } = await req.json();
    if (!previousRole || !targetRole) {
      return NextResponse.json({ error: "Informe seu cargo anterior e o cargo pretendido." }, { status: 400 });
    }

    const systemPrompt = `Você é um mentor especialista em Transição de Carreira.
Sua missão é criar uma Matriz de Equivalência de Competências (Skill Matrix).
Traduza os termos e atividades da profissão/área antiga para o vocabulário técnico e valorizado da nova área.
Retorne um JSON estrito:
{
  "transitionalNarrative": "...",
  "skillEquivalencies": [
    { "previousSkill": "...", "targetEquivalent": "...", "howToDescribeInResume": "..." }
  ],
  "bridgeRoles": ["..."],
  "quickWinCertifications": ["..."]
}`;

    const userPrompt = `CARGO ANTERIOR: ${previousRole}
NOVO CARGO PRETENDIDO: ${targetRole}
HABILIDADES/ATIVIDADES DA ÁREA ANTERIOR: ${previousSkills || "Geral do cargo antigo"}`;

    const data = await runJsonPrompt(systemPrompt, userPrompt, 0.3);

    return NextResponse.json({ success: true, matrix: data });
  } catch (error) {
    console.error("Erro ao gerar matriz de equivalência:", error);
    return NextResponse.json({ error: "Não foi possível gerar a matriz de skills." }, { status: 500 });
  }
}
