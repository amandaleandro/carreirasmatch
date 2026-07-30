import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { gradeEssay } from "@/lib/tools";
import { logStudyActivity } from "@/lib/study-activity";

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireToolAccess("/tools/essay-grader");
    if (!session) return response!;

    const { essayText, theme } = await req.json();

    if (!essayText || !essayText.trim()) {
      return NextResponse.json({ error: "Cole o texto da redação." }, { status: 400 });
    }

    const result = await gradeEssay(essayText, theme ?? "");

    void logStudyActivity(session.user.id, "redacao_concurso", result.totalScore);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao corrigir redação:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
