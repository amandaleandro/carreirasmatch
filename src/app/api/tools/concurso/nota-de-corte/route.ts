import { NextRequest, NextResponse } from "next/server";
import { requireToolSegmentAccess } from "@/lib/require-auth";
import { reserveFeatureForSession } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";
import { estimateConcursoCutoff } from "@/lib/tools";

export async function POST(req: NextRequest) {
  const { session, response: authResponse } = await requireToolSegmentAccess("/tools/concurso/nota-de-corte");
  if (!session) return authResponse!;

  const { allowed, response: quotaResponse, release } = await reserveFeatureForSession(
    session.user.id,
    COMMERCIAL_FEATURE_KEYS.studyTool
  );
  if (!allowed) return quotaResponse!;

  try {
    const { cargo, banca, regiao, userScore } = await req.json();

    if (!cargo || !String(cargo).trim()) {
      await release.cancel();
      return NextResponse.json({ error: "Informe o cargo ou concurso." }, { status: 400 });
    }

    const score = Number(userScore);
    if (!Number.isFinite(score) || score < 0) {
      await release.cancel();
      return NextResponse.json({ error: "Informe sua pontuação estimada (percentual de acerto ou nota)." }, { status: 400 });
    }

    const result = await estimateConcursoCutoff({
      cargo: String(cargo),
      banca: String(banca ?? ""),
      regiao: String(regiao ?? ""),
      userScore: score,
    });

    await release.confirm();
    return NextResponse.json(result);
  } catch (error) {
    await release.cancel();
    console.error("Erro ao estimar nota de corte:", error);
    return NextResponse.json({ error: "Erro ao processar. Tente novamente." }, { status: 500 });
  }
}
