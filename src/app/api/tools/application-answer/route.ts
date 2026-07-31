import { NextRequest, NextResponse } from "next/server";
import {
  generateApplicationAnswer,
  type ApplicationAnswerLength,
  type ApplicationAnswerTone,
} from "@/lib/tools";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

const VALID_LENGTHS: ApplicationAnswerLength[] = ["curta", "media", "longa"];
const VALID_TONES: ApplicationAnswerTone[] = ["direto", "caloroso", "formal"];
const MAX_QUESTION_CHARS = 500;

export async function POST(req: NextRequest) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.aiSimpleAction);
  if (!session) return response!;

  try {
    const { profileText, jobText, question, length, tone } = await req.json();

    if (!profileText?.trim() || !jobText?.trim() || !question?.trim()) {
      await release!.cancel();
      return NextResponse.json(
        { error: "Preencha seu perfil, a vaga e a pergunta." },
        { status: 400 }
      );
    }

    const resolvedLength: ApplicationAnswerLength = VALID_LENGTHS.includes(length) ? length : "media";
    const resolvedTone: ApplicationAnswerTone = VALID_TONES.includes(tone) ? tone : "direto";

    const result = await generateApplicationAnswer(
      profileText,
      jobText,
      String(question).trim().slice(0, MAX_QUESTION_CHARS),
      resolvedLength,
      resolvedTone
    );
    await release!.confirm();
    return NextResponse.json(result);
  } catch (error) {
    await release!.cancel();
    console.error("Erro ao gerar resposta de candidatura:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
