import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { reserveFeatureForSession } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";
import { gradeOabSecondPhase } from "@/lib/tools";
import { logStudyActivity } from "@/lib/study-activity";

export async function POST(req: NextRequest) {
  const { session, response: authResponse } = await requireToolAccess("/tools/oab/segunda-fase");
  if (!session) return authResponse!;

  const { allowed, response: quotaResponse, release } = await reserveFeatureForSession(
    session.user.id,
    COMMERCIAL_FEATURE_KEYS.studyTool
  );
  if (!allowed) return quotaResponse!;

  try {
    const { area, pecaText } = await req.json();

    if (!pecaText || !String(pecaText).trim()) {
      await release.cancel();
      return NextResponse.json({ error: "Cole o texto da sua peça ou resposta discursiva." }, { status: 400 });
    }

    const result = await gradeOabSecondPhase(String(area ?? ""), String(pecaText));

    void logStudyActivity(session.user.id, "oab_segunda_fase");

    await release.confirm();
    return NextResponse.json(result);
  } catch (error) {
    await release.cancel();
    console.error("Erro ao corrigir peça da 2ª fase OAB:", error);
    return NextResponse.json({ error: "Erro ao processar. Tente novamente." }, { status: 500 });
  }
}
