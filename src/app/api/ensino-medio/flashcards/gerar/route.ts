import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { runJsonAcrossProviders } from "@/lib/ai-providers";
import { getSubjectBySlug } from "@/lib/ensino-medio";
import { logStudyActivity } from "@/lib/study-activity";

export interface GeneratedFlashcardDeck {
  subjectName: string;
  yearLabel: string;
  topic: string;
  cards: Array<{
    id: number;
    front: string;
    back: string;
    category: string;
    tip: string;
  }>;
}

export async function POST(req: Request) {
  try {
    const { subjectSlug, yearId, customTopic } = await req.json();

    const subject = getSubjectBySlug(subjectSlug);
    const subjectName = subject ? subject.name : subjectSlug;

    const yearLabels: Record<string, string> = {
      "1o-ano": "1º Ano do Ensino Médio",
      "2o-ano": "2º Ano do Ensino Médio",
      "3o-ano": "3º Ano & ENEM",
      all: "Ensino Médio Completo",
    };

    const targetYearLabel = yearLabels[yearId] || yearLabels["all"];
    const topicToUse = customTopic ? customTopic.trim() : "Principais Conceitos e Fórmulas";

    const systemPrompt = `Você é um professor especialista em técnicas de memorização e spaced repetition (repetição espaçada) para estudantes do Ensino Médio no Brasil.
Seu objetivo é gerar um baralho de 8 a 10 Flashcards (cartões de memória) sobre "${subjectName}" (${targetYearLabel}) focando no tema "${topicToUse}".

Cada cartão deve ter:
- Frente (front): Pergunta, conceito, fórmula ou termo direto.
- Verso (back): Resposta clara, didática e objetiva.
- Categoria (category): ex: "Fórmula", "Conceito", "Data Histórica", "Gramática", "Regra".
- Dica de memorização (tip): Mnemônica ou truque mental para lembrar.

Retorne EXATAMENTE um objeto JSON válido seguindo a estrutura:
{
  "subjectName": "${subjectName}",
  "yearLabel": "${targetYearLabel}",
  "topic": "${topicToUse}",
  "cards": [
    {
      "id": 1,
      "front": "Pergunta ou conceito na frente do cartão",
      "back": "Explicação completa e objetiva no verso",
      "category": "Fórmula",
      "tip": "Dica mnemônica para guardar a resposta"
    }
  ]
}`;

    const userMessage = `Gere os flashcards de memorização para ${subjectName} sobre ${topicToUse} da grade do ${targetYearLabel}.`;

    const rawJson = await runJsonAcrossProviders(
      systemPrompt,
      userMessage,
      0.7,
      4000,
      "llama-3.3-70b-versatile",
      undefined,
      "ensino_medio_flashcards",
      "gemini"
    );

    const parsed = JSON.parse(rawJson) as GeneratedFlashcardDeck;

    const session = await auth();
    if (session?.user?.id) void logStudyActivity(session.user.id, "flashcards_ensino_medio");

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[API ensino-medio/flashcards/gerar] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao gerar baralho de flashcards. Tente novamente." },
      { status: 500 }
    );
  }
}
