import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { reserveFeatureForSession } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";
import { gradeEssay } from "@/lib/tools";
import { logStudyActivity } from "@/lib/study-activity";

export async function POST(req: NextRequest) {
  const { session, response: authResponse } = await requireToolAccess("/tools/essay-grader");
  if (!session) return authResponse!;

  const { allowed, response: quotaResponse, release } = await reserveFeatureForSession(
    session.user.id,
    COMMERCIAL_FEATURE_KEYS.studyTool
  );
  if (!allowed) return quotaResponse!;

  try {
    const { essayText, theme } = await req.json();

    if (!essayText || !essayText.trim()) {
      await release.cancel();
      return NextResponse.json({ error: "Cole o texto da redação." }, { status: 400 });
    }

    const result = await gradeEssay(essayText, theme ?? "");

    void logStudyActivity(session.user.id, "redacao_concurso", result.totalScore);

    await release.confirm();
    return NextResponse.json(result);
  } catch (error) {
    await release.cancel();
    console.error("Erro ao corrigir redação:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
