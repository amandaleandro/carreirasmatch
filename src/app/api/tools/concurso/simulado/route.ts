import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { reserveFeatureForSession } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";
import { generateConcursoMockExam } from "@/lib/tools";
import { logStudyActivity } from "@/lib/study-activity";

export async function POST(req: NextRequest) {
  const { session, response: authResponse } = await requireToolAccess("/tools/concurso/simulado");
  if (!session) return authResponse!;

  const { allowed, response: quotaResponse, release } = await reserveFeatureForSession(
    session.user.id,
    COMMERCIAL_FEATURE_KEYS.studyTool
  );
  if (!allowed) return quotaResponse!;

  try {
    const { cargo, banca, disciplina } = await req.json();

    if (!disciplina || !String(disciplina).trim()) {
      await release.cancel();
      return NextResponse.json({ error: "Escolha a disciplina do simulado." }, { status: 400 });
    }

    const result = await generateConcursoMockExam({
      cargo: String(cargo ?? ""),
      banca: String(banca ?? ""),
      disciplina: String(disciplina),
    });

    void logStudyActivity(session.user.id, "simulado_concurso");

    await release.confirm();
    return NextResponse.json(result);
  } catch (error) {
    await release.cancel();
    console.error("Erro ao gerar simulado de concurso:", error);
    return NextResponse.json({ error: "Erro ao processar. Tente novamente." }, { status: 500 });
  }
}
