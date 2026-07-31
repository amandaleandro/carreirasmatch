import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { reserveFeatureForSession } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";
import { generateExamMap, ExamMapAnswers, ExamType } from "@/lib/tools";
import { getVocationArea } from "@/lib/vocation-areas";

const VALID_EXAM_TYPES: ExamType[] = ["enem", "vestibular", "ambos"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ area: string }> }
) {
  const { session, response: authResponse } = await requireToolAccess("/tools/vocation-test", "student");
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
    const examType = body.examType as ExamType;
    const timeUntilExam = (body.timeUntilExam as string) ?? "";
    const weeklyStudyHours = (body.weeklyStudyHours as string) ?? "";
    const subjectStrengths = Array.isArray(body.subjectStrengths) ? body.subjectStrengths : [];
    const subjectWeaknesses = Array.isArray(body.subjectWeaknesses) ? body.subjectWeaknesses : [];

    if (!VALID_EXAM_TYPES.includes(examType) || !timeUntilExam.trim() || !weeklyStudyHours.trim()) {
      await release.cancel();
      return NextResponse.json(
        { error: "Responda todas as perguntas do mapa de estudos." },
        { status: 400 }
      );
    }

    const answers: ExamMapAnswers = {
      examType,
      timeUntilExam,
      weeklyStudyHours,
      subjectStrengths,
      subjectWeaknesses,
    };

    const result = await generateExamMap(area, answers);

    await release.confirm();
    return NextResponse.json(result);
  } catch (error) {
    await release.cancel();
    console.error("Erro ao gerar mapa de estudos:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
