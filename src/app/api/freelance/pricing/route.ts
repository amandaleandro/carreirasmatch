import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generatePricingSuggestion } from "@/lib/freelance-pricing";
import { checkRateLimit } from "@/lib/rate-limit";

// O marketplace freelancer é gratuito por enquanto (ver memória do projeto), então
// esta ferramenta não fica atrás de assinatura como as demais — só um limite diário
// pra evitar abuso de custo de IA, já que hoje não há nenhum controle nela.
const PRICING_LIMIT = { limit: 10, windowMs: 24 * 60 * 60 * 1000 };

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  }

  const rateLimit = checkRateLimit(`freelance-pricing:${session.user.id}`, PRICING_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Você atingiu o limite diário de sugestões de preço. Tente novamente amanhã." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const { category, skills, experienceLevel, projectScope } = await req.json();
  if (typeof projectScope !== "string" || !projectScope.trim()) {
    return NextResponse.json({ error: "Descreva o escopo do projeto." }, { status: 400 });
  }

  try {
    const suggestion = await generatePricingSuggestion({
      category: typeof category === "string" ? category : "",
      skills: Array.isArray(skills) ? skills.filter((s): s is string => typeof s === "string").slice(0, 20) : [],
      experienceLevel: typeof experienceLevel === "string" ? experienceLevel : "",
      projectScope: projectScope.trim().slice(0, 1000),
    });
    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("Erro ao gerar sugestão de precificação:", error);
    return NextResponse.json({ error: "Erro ao processar. Tente novamente." }, { status: 500 });
  }
}
