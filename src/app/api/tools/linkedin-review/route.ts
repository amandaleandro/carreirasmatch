import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { reserveFeatureForSession } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";
import { analyzeLinkedIn } from "@/lib/tools";

export async function POST(req: NextRequest) {
  const { session, response: authResponse } = await requireToolAccess("/tools/linkedin-review");
  if (!session) return authResponse!;

  const { allowed, response: quotaResponse, release } = await reserveFeatureForSession(
    session.user.id,
    COMMERCIAL_FEATURE_KEYS.aiSimpleAction
  );
  if (!allowed) return quotaResponse!;

  try {
    const { linkedInText, targetRole } = await req.json();

    if (!linkedInText?.trim()) {
      await release.cancel();
      return NextResponse.json(
        { error: "Cole o conteúdo do seu perfil do LinkedIn." },
        { status: 400 }
      );
    }

    const result = await analyzeLinkedIn(linkedInText, targetRole ?? "");
    await release.confirm();
    return NextResponse.json(result);
  } catch (error) {
    await release.cancel();
    console.error("Erro ao analisar LinkedIn:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
