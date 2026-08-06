import { runJsonPrompt } from "@/lib/groq";

export type CareerGrowthPlanResult = {
  competencyGaps: string[];
  developmentActions: { action: string; timeframe: string }[];
  negotiationTalkingPoints: string[];
  leadershipReadiness: string;
};

const BASE_RULES = `Responda SEMPRE em português do Brasil. Seja realista e específico, sem inflar conquistas nem prometer garantias. Responda SOMENTE com um objeto JSON válido, sem texto antes ou depois.`;

/** Gera um plano de evolução profissional (cargo atual → próximo cargo): quais
 * competências faltam, um plano de desenvolvimento com prazos, argumentos concretos
 * pra uma conversa de promoção/negociação salarial, e uma leitura honesta de prontidão
 * para liderança (só entra se fizer sentido pro próximo cargo). */
export async function generateCareerGrowthPlan(
  currentRole: string,
  currentSeniority: string,
  targetRole: string,
  pastAnalysis?: { strengths: string[]; weaknesses: string[]; fixes: string[] } | null
): Promise<CareerGrowthPlanResult> {
  const systemPrompt = `Você é um mentor de carreira ajudando um profissional que já está empregado a crescer DENTRO da carreira, do cargo atual para o próximo — não é sobre trocar de emprego, é sobre evoluir onde já está.
${BASE_RULES}
${pastAnalysis ? "Use a análise de currículo mais recente da pessoa (pontos fortes, pontos fracos e correções sugeridas) como base real do que ela já demonstra e do que ainda precisa desenvolver — não repita esses itens literalmente, incorpore o que for relevante para o próximo cargo." : ""}
Formato de resposta:
{
  "competencyGaps": string[] (3-5 competências ou entregas concretas que separam o cargo atual do próximo, específicas e acionáveis, não genéricas),
  "developmentActions": [{ "action": string (ação concreta e realista), "timeframe": string (prazo sugerido, ex: "Próximos 30 dias") }] (4-6 itens, ordenados do mais urgente ao mais estrutural),
  "negotiationTalkingPoints": string[] (3-5 argumentos concretos que a pessoa pode usar numa conversa de promoção/aumento com o gestor, baseados em entregas e impacto, não em tempo de casa),
  "leadershipReadiness": string (2-3 frases avaliando com honestidade se o próximo cargo envolve liderança de pessoas e, se sim, o que já demonstra prontidão e o que ainda precisa desenvolver; se o próximo cargo não envolve liderança, diga isso claramente em vez de forçar o tema)
}`;

  const userMessage = `CARGO ATUAL: ${currentRole}
SENIORIDADE ATUAL: ${currentSeniority || "não informada"}
PRÓXIMO CARGO DESEJADO: ${targetRole}${
    pastAnalysis
      ? `

ANÁLISE DE CURRÍCULO MAIS RECENTE DESTA PESSOA:
Pontos fortes: ${pastAnalysis.strengths.join("; ") || "não informado"}
Pontos fracos: ${pastAnalysis.weaknesses.join("; ") || "não informado"}
Correções sugeridas: ${pastAnalysis.fixes.join("; ") || "não informado"}`
      : ""
  }`;

  return runJsonPrompt<CareerGrowthPlanResult>(
    systemPrompt,
    userMessage,
    0.4,
    1800,
    undefined,
    undefined,
    "career_growth_plan",
    "cerebras"
  );
}
