import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { checkFeatureAccess, reserveFeature, confirmReservation, cancelReservation } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";
import { prisma } from "@/lib/prisma";
import {
  INTERVIEW_SIMULATION_QUESTIONS,
  evaluateInterviewAnswer,
  startInterviewSimulation,
  type InterviewSimulatorInput,
  type InterviewTurn,
} from "@/lib/tools";

async function loadAnalysisContext(analysisId: unknown, userId: string) {
  if (typeof analysisId !== "string" || !analysisId.trim()) return null;

  const analysis = await prisma.analysis.findFirst({
    where: { id: analysisId, resume: { userId } },
    select: { weaknesses: true, interviewQuestions: true },
  });
  if (!analysis) return null;

  try {
    const focusAreas = (JSON.parse(analysis.weaknesses) as string[]).slice(0, 5);
    const suggestedQuestions = (JSON.parse(analysis.interviewQuestions) as string[]).slice(0, 5);
    return { focusAreas, suggestedQuestions };
  } catch {
    return null;
  }
}

const MAX_FIELD_LENGTH = 200;
const MAX_ANSWER_LENGTH = 4000;

// O histórico vem do cliente (a simulação não é persistida), então é preciso
// checar formato e tamanho antes de mandar para a IA.
function parseHistory(raw: unknown): InterviewTurn[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length > INTERVIEW_SIMULATION_QUESTIONS) return null;

  const history: InterviewTurn[] = [];
  for (const turn of raw) {
    const question = (turn as InterviewTurn)?.question;
    const answer = (turn as InterviewTurn)?.answer;
    if (typeof question !== "string" || typeof answer !== "string") return null;
    if (!question.trim() || !answer.trim()) return null;
    history.push({
      question: question.slice(0, MAX_ANSWER_LENGTH),
      answer: answer.slice(0, MAX_ANSWER_LENGTH),
    });
  }

  return history;
}

export async function POST(req: NextRequest) {
  const { session, response: authResponse } = await requireAuth();
  if (!session) return authResponse!;

  const body = await req.json();
  const targetRole = String(body.targetRole ?? "").trim();

  if (!targetRole) {
    return NextResponse.json({ error: "Informe o cargo-alvo." }, { status: 400 });
  }

  const history = parseHistory(body.history ?? []);
  if (!history) {
    return NextResponse.json(
      { error: "Não consegui ler o histórico da entrevista. Recomece a simulação." },
      { status: 400 }
    );
  }

  // Só a primeira chamada (início da entrevista) consome cota — as respostas
  // seguintes fazem parte da mesma sessão já paga/reservada.
  const isStart = history.length === 0;
  const featureKey = COMMERCIAL_FEATURE_KEYS.interviewComplete;
  let reservationId: string | undefined;

  if (isStart) {
    const reserved = await reserveFeature(session.user.id, featureKey);
    if (!reserved.allowed) {
      return NextResponse.json(
        { error: reserved.plan === "free" ? "Assine um plano pago para usar esta ferramenta." : "Você atingiu o limite deste mês." },
        { status: reserved.plan === "free" ? 402 : 429 }
      );
    }
    reservationId = reserved.reservation?.id;
  } else {
    const access = await checkFeatureAccess(session.user.id, featureKey);
    if (!access.allowed) {
      return NextResponse.json({ error: "Você atingiu o limite deste mês." }, { status: 429 });
    }
  }

  try {
    const input: InterviewSimulatorInput = {
      targetRole: targetRole.slice(0, MAX_FIELD_LENGTH),
      area: String(body.area ?? "").trim().slice(0, MAX_FIELD_LENGTH),
      seniority: String(body.seniority ?? "").trim().slice(0, MAX_FIELD_LENGTH),
      history,
    };

    if (isStart) {
      const analysisContext = await loadAnalysisContext(body.analysisId, session.user.id);
      if (analysisContext) {
        input.focusAreas = analysisContext.focusAreas;
        input.suggestedQuestions = analysisContext.suggestedQuestions;
      }
      const result = await startInterviewSimulation(input);
      if (reservationId) await confirmReservation(reservationId);
      return NextResponse.json(result);
    }

    return NextResponse.json(await evaluateInterviewAnswer(input));
  } catch (error) {
    if (isStart && reservationId) await cancelReservation(reservationId);
    console.error("Erro no simulador de entrevista:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
