import { NextResponse } from "next/server";
import { runJsonPrompt } from "@/lib/groq";
import { z } from "zod";

const starFeedbackSchema = z.object({
  situationScore: z.number().int().min(0).max(100),
  situationFeedback: z.string(),
  taskScore: z.number().int().min(0).max(100),
  taskFeedback: z.string(),
  actionScore: z.number().int().min(0).max(100),
  actionFeedback: z.string(),
  resultScore: z.number().int().min(0).max(100),
  resultFeedback: z.string(),
  overallScore: z.number().int().min(0).max(100),
  overallVerdict: z.string(),
  improvedAnswer: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, answer, jobTitle = "Profissional" } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Pergunta e resposta são obrigatórias." },
        { status: 400 }
      );
    }

    const systemPrompt = `Você é um recrutador sênior e especialista em entrevistas de emprego no Brasil.
Sua missão é avaliar a resposta de um candidato a uma pergunta de entrevista usando o método STAR:
- S (Situação): O candidato explicou o contexto de forma clara e objetiva?
- T (Tarefa): O candidato deixou claro qual era o desafio ou meta?
- A (Ação): O candidato detalhou as ações concretas que ELE tomou (verbos de ação, ferramentas usadas)?
- R (Resultado): O candidato quantificou o resultado final com números, métricas ou benefícios reais?

Retorne estritamente um JSON com a estrutura solicitada.`;

    const userMessage = `CARGO ALVO: ${jobTitle}
PERGUNTA DA ENTREVISTA: ${question}
RESPOSTA DO CANDIDATO: ${answer}`;

    const feedback = await runJsonPrompt(
      systemPrompt,
      userMessage,
      0.2,
      2500,
      undefined,
      starFeedbackSchema,
      "star_interview_feedback"
    );

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error("Erro no feedback STAR:", error);
    return NextResponse.json(
      { error: "Falha ao processar avaliação STAR." },
      { status: 500 }
    );
  }
}
