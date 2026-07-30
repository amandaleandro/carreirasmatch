import { runJsonPrompt } from "@/lib/groq";

export type PricingSuggestion = {
  hourlyMinReais: number;
  hourlyMaxReais: number;
  fixedMinReais: number;
  fixedMaxReais: number;
  reasoning: string;
  negotiationTips: string[];
};

const BASE_RULES = `Responda SEMPRE em português do Brasil, com valores realistas para o mercado freelancer brasileiro (não valores de agência nem de mercado americano). Responda SOMENTE com um objeto JSON válido, sem texto antes ou depois.`;

/** Sugere uma faixa de preço (por hora e fechado) para um freelancer brasileiro,
 * a partir de categoria, habilidades, nível de experiência e escopo do projeto. */
export async function generatePricingSuggestion(input: {
  category: string;
  skills: string[];
  experienceLevel: string;
  projectScope: string;
}): Promise<PricingSuggestion> {
  const systemPrompt = `Você é um consultor que ajuda freelancers brasileiros a precificar seu trabalho de forma justa e competitiva, nem por baixo (autossabotagem) nem por cima (fora do mercado real).
${BASE_RULES}
Formato de resposta:
{
  "hourlyMinReais": number (valor/hora mínimo sugerido em reais, sem centavos),
  "hourlyMaxReais": number (valor/hora máximo sugerido em reais),
  "fixedMinReais": number (valor fechado mínimo sugerido para o escopo descrito),
  "fixedMaxReais": number (valor fechado máximo sugerido para o escopo descrito),
  "reasoning": string (2-3 frases explicando por que essa faixa, considerando categoria/experiência/escopo),
  "negotiationTips": string[] (3-4 dicas práticas específicas pra defender esse preço numa conversa com o cliente)
}`;

  const userMessage = `CATEGORIA: ${input.category || "não informada"}
HABILIDADES: ${input.skills.join(", ") || "não informadas"}
NÍVEL DE EXPERIÊNCIA: ${input.experienceLevel || "não informado"}
ESCOPO DO PROJETO: ${input.projectScope}`;

  return runJsonPrompt<PricingSuggestion>(
    systemPrompt,
    userMessage,
    0.4,
    1200,
    undefined,
    undefined,
    "freelance_pricing_suggestion",
    "cerebras"
  );
}
