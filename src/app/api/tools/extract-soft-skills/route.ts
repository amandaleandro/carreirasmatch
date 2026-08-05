import { NextRequest, NextResponse } from "next/server";
import { runJsonPrompt } from "@/lib/groq";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

export async function POST(req: NextRequest) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.aiSimpleAction);
  if (!session) return response!;

  try {
    const { projectDescription, targetRole } = await req.json();
    if (!projectDescription) {
      await release!.cancel();
      return NextResponse.json({ error: "Descreva um projeto, trabalho escolar ou trabalho voluntário." }, { status: 400 });
    }

    const systemPrompt = `Você é um consultor de carreira especializado em Jovem Aprendiz e Primeiro Emprego.
Sua missão é transformar descrições de trabalhos escolares, feiras de ciências, liderança de grêmio, trabalho voluntário ou projetos pessoais em blocos profissionais estruturados para o currículo.
Retorne um JSON estrito:
{
  "projectTitle": "...",
  "softSkillsIdentified": ["..."],
  "resumeExperienceBlock": {
    "roleTitle": "...",
    "bullets": ["...", "...", "..."]
  },
  "interviewTalkingPoints": ["..."]
}`;

    const userPrompt = `OBJETIVO PROFISSIONAL: ${targetRole || "Jovem Aprendiz / Primeiro Emprego"}
DESCRIÇÃO DA ATIVIDADE/PROJETO:
${projectDescription}`;

    const data = await runJsonPrompt(systemPrompt, userPrompt, 0.3);

    await release!.confirm();
    return NextResponse.json({ success: true, extracted: data });
  } catch (error) {
    await release!.cancel();
    console.error("Erro ao extrair soft skills:", error);
    return NextResponse.json({ error: "Erro ao transformar projeto em experiência." }, { status: 500 });
  }
}
