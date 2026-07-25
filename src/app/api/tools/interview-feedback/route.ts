import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getInterviewFeedbackBatch } from "@/lib/tools";

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireAuth();
    if (!session) return response!;

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
      return NextResponse.json(
        { error: "Preencha a(s) resposta(s) antes de finalizar a simulação." },
        { status: 400 }
      );
    }

    const results = await getInterviewFeedbackBatch(qas, jobTitle ?? "");
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Erro ao gerar feedback de entrevista:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
