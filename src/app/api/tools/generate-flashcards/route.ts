import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { runJsonPrompt } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Faça login para gerar flashcards." }, { status: 401 });
    }

    const { subject, topic, quantity } = await req.json();
    if (!subject) {
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

    const data = await runJsonPrompt<{ flashcards: any[] }>(systemPrompt, userPrompt, 0.3);

    return NextResponse.json({ success: true, flashcards: data.flashcards || [] });
  } catch (error) {
    console.error("Erro ao gerar flashcards:", error);
    return NextResponse.json({ error: "Erro ao gerar flashcards." }, { status: 500 });
  }
}
