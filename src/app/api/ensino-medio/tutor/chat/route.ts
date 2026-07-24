import { NextResponse } from "next/server";
import { askVirtualTutor, TutorChatMessage } from "@/lib/ensino-medio-tools";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, subject } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "O histórico de mensagens é obrigatório." },
        { status: 400 }
      );
    }

    const response = await askVirtualTutor(messages as TutorChatMessage[], subject);
    return NextResponse.json(response);
  } catch (error) {
    console.error("[API tutor/chat] Erro:", error);
    return NextResponse.json(
      { error: "Falha ao obter resposta do Tutor Gemini." },
      { status: 500 }
    );
  }
}
