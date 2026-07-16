import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import {
  INTERVIEW_SIMULATION_QUESTIONS,
  evaluateInterviewAnswer,
  startInterviewSimulation,
  type InterviewSimulatorInput,
  type InterviewTurn,
} from "@/lib/tools";

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
  try {
    const { session, response } = await requireToolAccess("/tools/interview-simulator");
    if (!session) return response!;

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

    const input: InterviewSimulatorInput = {
      targetRole: targetRole.slice(0, MAX_FIELD_LENGTH),
      area: String(body.area ?? "").trim().slice(0, MAX_FIELD_LENGTH),
      seniority: String(body.seniority ?? "").trim().slice(0, MAX_FIELD_LENGTH),
      history,
    };

    if (history.length === 0) {
      return NextResponse.json(await startInterviewSimulation(input));
    }

    return NextResponse.json(await evaluateInterviewAnswer(input));
  } catch (error) {
    console.error("Erro no simulador de entrevista:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
