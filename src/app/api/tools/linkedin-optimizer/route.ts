import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { runJsonPrompt } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Faça login para otimizar perfil de LinkedIn." }, { status: 401 });
    }

    const { currentRole, targetRole, keySkills, bioSummary } = await req.json();
    if (!targetRole) {
      return NextResponse.json({ error: "Informe o cargo pretendido." }, { status: 400 });
    }

    const systemPrompt = `Você é um Top Voice do LinkedIn especialista em posicionamento profissional e branding pessoal.
Gere otimizações completas para o perfil do LinkedIn e postagens de autoridade.
Retorne um JSON estrito:
{
  "headlineOptions": ["...", "...", "..."],
  "aboutSection": "...",
  "experienceBullets": ["..."],
  "authorityPostSample": {
    "title": "...",
    "content": "..."
  }
}`;

    const userPrompt = `CARGO ATUAL/ÚLTIMO: ${currentRole || "Profissional"}
CARGO PRETENDIDO: ${targetRole}
PRINCIPAIS SKILLS: ${keySkills || "Geral da área"}
RESUMO/RESUMO HISTÓRICO: ${bioSummary || "Sem detalhes adicionais"}`;

    const data = await runJsonPrompt(systemPrompt, userPrompt, 0.3);

    return NextResponse.json({ success: true, linkedin: data });
  } catch (error) {
    console.error("Erro ao otimizar perfil do LinkedIn:", error);
    return NextResponse.json({ error: "Erro ao gerar otimização do LinkedIn." }, { status: 500 });
  }
}
