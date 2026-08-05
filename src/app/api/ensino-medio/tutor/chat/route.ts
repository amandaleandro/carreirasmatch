import { NextResponse } from "next/server";
import { askVirtualTutor, TutorChatMessage } from "@/lib/ensino-medio-tools";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

export async function POST(req: Request) {
  const { session, response: authResponse, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.studyTool);
  if (!session) return authResponse!;

  try {
    const body = await req.json();
    const { messages, subject } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      await release!.cancel();
      return NextResponse.json(
        { error: "O histórico de mensagens é obrigatório." },
        { status: 400 }
      );
    }

    const tutorResponse = await askVirtualTutor(messages as TutorChatMessage[], subject);
    await release!.confirm();
    return NextResponse.json(tutorResponse);
  } catch (error) {
    await release!.cancel();
    console.error("[API tutor/chat] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao obter resposta do Tutor Gemini." },
      { status: 500 }
    );
  }
}
