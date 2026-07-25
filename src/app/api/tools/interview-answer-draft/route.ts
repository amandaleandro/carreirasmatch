import { NextRequest, NextResponse } from "next/server";
import { authorizeFreeAiTool, releaseFreeAiToolUsage } from "@/lib/free-tool-access";
import { generateInterviewAnswerDraft, type InterviewSimulatorInput, type InterviewTurn } from "@/lib/tools";

const MAX_FIELD_LENGTH = 200;
const MAX_ANSWER_LENGTH = 4000;

function parseHistory(raw: unknown): InterviewTurn[] | null {
  if (!Array.isArray(raw)) return null;

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
  let freeStartUserId: string | null = null;
  try {
    const body = await req.json();
    const targetRole = String(body.targetRole ?? "").trim();
    const question = String(body.question ?? "").trim();

    if (!targetRole) {
      return NextResponse.json({ error: "Informe o cargo-alvo." }, { status: 400 });
    }
    if (!question) {
      return NextResponse.json({ error: "Informe a pergunta." }, { status: 400 });
    }

    const history = parseHistory(body.history ?? []);
    if (!history) {
      return NextResponse.json(
        { error: "Não consegui ler o histórico da entrevista. Recomece a simulação." },
        { status: 400 },
      );
    }

    const { session, response, subscriber } = await authorizeFreeAiTool("interview-simulator", false);
    if (!session) return response!;
    if (!subscriber) freeStartUserId = session.user.id;

    const input: InterviewSimulatorInput & { question: string; mode?: "curta" | "star" | "tecnica" } = {
      targetRole: targetRole.slice(0, MAX_FIELD_LENGTH),
      area: String(body.area ?? "").trim().slice(0, MAX_FIELD_LENGTH),
      seniority: String(body.seniority ?? "").trim().slice(0, MAX_FIELD_LENGTH),
      history,
      question: question.slice(0, 2000),
      mode: body.mode === "star" || body.mode === "tecnica" ? body.mode : "curta",
    };

    return NextResponse.json(await generateInterviewAnswerDraft(input));
  } catch (error) {
    if (freeStartUserId) await releaseFreeAiToolUsage(freeStartUserId, "interview-simulator");
    console.error("Erro no rascunho de resposta de entrevista:", error);
    return NextResponse.json({ error: "Erro ao processar. Tente novamente." }, { status: 500 });
  }
}
