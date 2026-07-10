import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { analyzeLinkedIn } from "@/lib/tools";

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireToolAccess("/tools/linkedin-review");
    if (!session) return response!;

    const { linkedInText, targetRole } = await req.json();

    if (!linkedInText?.trim()) {
      return NextResponse.json(
        { error: "Cole o conteúdo do seu perfil do LinkedIn." },
        { status: 400 }
      );
    }

    const result = await analyzeLinkedIn(linkedInText, targetRole ?? "");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao analisar LinkedIn:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
