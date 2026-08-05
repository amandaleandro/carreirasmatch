import { NextRequest, NextResponse } from "next/server";
import { getInterviewFeedbackBatch } from "@/lib/tools";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

export async function POST(req: NextRequest) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.interviewComplete);
  if (!session) return response!;

  try {
    const body = await req.json();
    const { jobTitle, unifiedAnswer } = body;
    let qas = body.qas;

    if (unifiedAnswer && typeof unifiedAnswer === "string" && unifiedAnswer.trim() && Array.isArray(qas)) {
      qas = qas.map((item: { question: string }) => ({
        question: item.question,
        answer: unifiedAnswer.trim(),
      }));
    }

    if (!Array.isArray(qas) || qas.length === 0 || qas.some((qa) => !qa?.question?.trim() || !qa?.answer?.trim())) {
      await release!.cancel();
      return NextResponse.json(
        { error: "Preencha a(s) resposta(s) antes de finalizar a simulação." },
        { status: 400 }
      );
    }

    const results = await getInterviewFeedbackBatch(qas, jobTitle ?? "");
    await release!.confirm();
    return NextResponse.json({ results });
  } catch (error) {
    await release!.cancel();
    console.error("Erro ao gerar feedback de entrevista:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
