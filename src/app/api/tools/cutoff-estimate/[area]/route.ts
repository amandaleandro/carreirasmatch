import { NextRequest, NextResponse } from "next/server";
import { requireToolSegmentAccess } from "@/lib/require-auth";
import { reserveFeatureForSession } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";
import { estimateCutoffChance } from "@/lib/tools";
import { getVocationArea } from "@/lib/vocation-areas";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ area: string }> }
) {
  const { session, response: authResponse } = await requireToolSegmentAccess("/tools/vocation-test");
  if (!session) return authResponse!;

  const { allowed, response: quotaResponse, release } = await reserveFeatureForSession(
    session.user.id,
    COMMERCIAL_FEATURE_KEYS.studyTool
  );
  if (!allowed) return quotaResponse!;

  try {
    const { area: areaSlug } = await params;
    const area = getVocationArea(areaSlug);
    if (!area) {
      await release.cancel();
      return NextResponse.json({ error: "Área inválida." }, { status: 400 });
    }

    const body = await req.json();
    const userScore = Number(body.userScore);
    const targetInstitutionType = (body.targetInstitutionType as string) ?? "";

    if (!Number.isFinite(userScore) || userScore <= 0 || userScore > 1000) {
      await release.cancel();
      return NextResponse.json({ error: "Informe uma nota válida (0-1000)." }, { status: 400 });
    }
    if (!targetInstitutionType.trim()) {
      await release.cancel();
      return NextResponse.json({ error: "Informe o tipo de instituição-alvo." }, { status: 400 });
    }

    const result = await estimateCutoffChance(area, userScore, targetInstitutionType);

    await release.confirm();
    return NextResponse.json(result);
  } catch (error) {
    await release.cancel();
    console.error("Erro ao estimar chance de corte:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
