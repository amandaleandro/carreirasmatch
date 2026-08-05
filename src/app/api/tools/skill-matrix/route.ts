import { NextRequest, NextResponse } from "next/server";
import { runJsonPrompt } from "@/lib/groq";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

export async function POST(req: NextRequest) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.aiSimpleAction);
  if (!session) return response!;

  try {
    const { previousRole, targetRole, previousSkills } = await req.json();
    if (!previousRole || !targetRole) {
      await release!.cancel();
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

    await release!.confirm();
    return NextResponse.json({ success: true, matrix: data });
  } catch (error) {
    await release!.cancel();
    console.error("Erro ao gerar matriz de equivalência:", error);
    return NextResponse.json({ error: "Não foi possível gerar a matriz de skills." }, { status: 500 });
  }
}
