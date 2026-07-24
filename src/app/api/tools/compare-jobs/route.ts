import { NextResponse } from "next/server";
import { runJsonPrompt } from "@/lib/groq";
import { z } from "zod";

const compareJobsSchema = z.object({
  comparisons: z.array(
    z.object({
      jobTitle: z.string(),
      companyName: z.string(),
      matchScore: z.number().int().min(0).max(100),
      effortToAdapt: z.enum(["Baixo", "Médio", "Alto"]),
      keyRequirementsFound: z.array(z.string()),
      criticalGaps: z.array(z.string()),
      recommendationVerdict: z.string(),
      tag: z.enum([
        "Melhor aposta agora",
        "Mais fácil de aplicar hoje",
        "Melhor crescimento futuro",
        "Exige preparação antes",
      ]),
    })
  ),
  overallWinnerIndex: z.number().int(),
  comparisonSummary: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobs = [], resumeText = "" } = body;

    if (!Array.isArray(jobs) || jobs.length < 2) {
      return NextResponse.json(
        { error: "Envie pelo menos 2 vagas para realizar a comparação." },
        { status: 400 }
      );
    }

    const systemPrompt = `Você é um estrategista de carreira e consultor especialista em recrutamento.
Sua missão é comparar até 5 vagas de emprego enviadas pelo usuário, cruzando com o perfil/currículo informado (se disponível).

Para cada vaga, avalie:
- matchScore (0-100%): Nível de alinhamento entre o currículo e os requisitos da vaga.
- effortToAdapt ("Baixo" | "Médio" | "Alto"): O esforço de ajuste necessário no currículo.
- keyRequirementsFound: 3-5 requisitos que o candidato atende.
- criticalGaps: 2-3 lacunas críticas.
- recommendationVerdict: Veredito conciso sobre valer a pena aplicar agora.
- tag: Atribua uma das tags ("Melhor aposta agora" | "Mais fácil de aplicar hoje" | "Melhor crescimento futuro" | "Exige preparação antes").

Identifique qual das vagas é a vencedora (overallWinnerIndex: 0-indexed) e forneça um resumo comparativo motivador.`;

    const userMessage = `CURRÍCULO DO CANDIDATO:
${resumeText || "Perfil geral de profissional em busca de recolocação/crescimento."}

VAGAS A COMPARAR:
${jobs.map((j: { title: string; description: string }, idx: number) => `--- VAGA ${idx + 1}: ${j.title} ---\n${j.description}`).join("\n\n")}`;

    const result = await runJsonPrompt(
      systemPrompt,
      userMessage,
      0.2,
      3000,
      undefined,
      compareJobsSchema,
      "compare_jobs"
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Erro na comparação de vagas:", error);
    return NextResponse.json(
      { error: "Falha ao comparar vagas." },
      { status: 500 }
    );
  }
}
