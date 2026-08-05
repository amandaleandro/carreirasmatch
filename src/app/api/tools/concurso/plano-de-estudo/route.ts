import { NextRequest, NextResponse } from "next/server";
import { requireToolSegmentAccess } from "@/lib/require-auth";
import { reserveFeatureForSession } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";
import { generateConcursoStudyPlan } from "@/lib/tools";

export async function POST(req: NextRequest) {
  const { session, response: authResponse } = await requireToolSegmentAccess("/tools/concurso/plano-de-estudo");
  if (!session) return authResponse!;

  const { allowed, response: quotaResponse, release } = await reserveFeatureForSession(
    session.user.id,
    COMMERCIAL_FEATURE_KEYS.studyTool
  );
  if (!allowed) return quotaResponse!;

  try {
    const { cargo, banca, disciplinas, weeklyStudyHours, timeUntilExam } = await req.json();

    if (!cargo || !String(cargo).trim()) {
      await release.cancel();
      return NextResponse.json({ error: "Informe o cargo ou exame que você vai prestar." }, { status: 400 });
    }
    if (!disciplinas || !String(disciplinas).trim()) {
      await release.cancel();
      return NextResponse.json({ error: "Liste as disciplinas do edital." }, { status: 400 });
    }

    const result = await generateConcursoStudyPlan({
      cargo: String(cargo),
      banca: String(banca ?? ""),
      disciplinas: String(disciplinas),
      weeklyStudyHours: String(weeklyStudyHours ?? ""),
      timeUntilExam: String(timeUntilExam ?? ""),
    });

    await release.confirm();
    return NextResponse.json(result);
  } catch (error) {
    await release.cancel();
    console.error("Erro ao gerar plano de estudo de concurso:", error);
    return NextResponse.json({ error: "Erro ao processar. Tente novamente." }, { status: 500 });
  }
}
