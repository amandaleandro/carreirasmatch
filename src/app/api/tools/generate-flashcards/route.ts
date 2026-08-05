import { NextRequest, NextResponse } from "next/server";
import { runJsonPrompt } from "@/lib/groq";
import { logStudyActivity } from "@/lib/study-activity";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

type GeneratedFlashcard = {
  front: string;
  back: string;
  mnemonicTip: string;
};

export async function POST(req: NextRequest) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.studyTool);
  if (!session) return response!;

  try {
    const { subject, topic, quantity } = await req.json();
    if (!subject) {
      await release!.cancel();
      return NextResponse.json({ error: "Informe a disciplina/matéria." }, { status: 400 });
    }

    const systemPrompt = `Você é um tutor especialista em concursos e vestibulares.
Sua missão é criar cartões de memorização (flashcards) com a técnica ANKI no formato Pergunta x Resposta Direta.
Retorne um JSON com a seguinte estrutura estrita:
{
  "flashcards": [
    { "front": "...", "back": "...", "mnemonicTip": "..." }
  ]
}`;

    const userPrompt = `DISCIPLINA: ${subject}
TÓPICO/ASSUNTO: ${topic || "Geral da disciplina"}
QUANTIDADE DE FLASHCARDS: ${quantity || 5}`;

    const data = await runJsonPrompt<{ flashcards: GeneratedFlashcard[] }>(
      systemPrompt,
      userPrompt,
      0.3
    );

    void logStudyActivity(session.user.id, "flashcards_concurso");

    await release!.confirm();
    return NextResponse.json({ success: true, flashcards: data.flashcards || [] });
  } catch (error) {
    await release!.cancel();
    console.error("Erro ao gerar flashcards:", error);
    return NextResponse.json({ error: "Erro ao gerar flashcards." }, { status: 500 });
  }
}
