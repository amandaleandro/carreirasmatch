import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { checkFeatureAccess } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";
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
  const { session, response: authResponse } = await requireAuth();
  if (!session) return authResponse!;

  // Só checa (não consome): esse rascunho é um apoio dentro de uma entrevista que
  // já foi iniciada — quem consome a cota de `interviewComplete` é o
  // interview-simulator no início da sessão, não cada pergunta individual.
  const access = await checkFeatureAccess(session.user.id, COMMERCIAL_FEATURE_KEYS.interviewComplete);
  if (!access.allowed) {
    return NextResponse.json(
      { error: access.plan === "free" ? "Assine um plano pago para usar esta ferramenta." : "Você atingiu o limite deste mês." },
      { status: access.plan === "free" ? 402 : 429 }
    );
  }

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
    console.error("Erro no rascunho de resposta de entrevista:", error);
    return NextResponse.json({ error: "Erro ao processar. Tente novamente." }, { status: 500 });
  }
}
