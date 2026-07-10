import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { generateExamMap, ExamMapAnswers, ExamType } from "@/lib/tools";
import { getVocationArea } from "@/lib/vocation-areas";

const VALID_EXAM_TYPES: ExamType[] = ["enem", "vestibular", "ambos"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ area: string }> }
) {
  try {
    const { area: areaSlug } = await params;
    const area = getVocationArea(areaSlug);
    if (!area) {
      return NextResponse.json({ error: "Área inválida." }, { status: 400 });
    }

    const { session, response } = await requireToolAccess("/tools/vocation-test");
    if (!session) return response!;

    const body = await req.json();
    const examType = body.examType as ExamType;
    const timeUntilExam = (body.timeUntilExam as string) ?? "";
    const weeklyStudyHours = (body.weeklyStudyHours as string) ?? "";
    const subjectStrengths = Array.isArray(body.subjectStrengths) ? body.subjectStrengths : [];
    const subjectWeaknesses = Array.isArray(body.subjectWeaknesses) ? body.subjectWeaknesses : [];

    if (!VALID_EXAM_TYPES.includes(examType) || !timeUntilExam.trim() || !weeklyStudyHours.trim()) {
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

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao gerar mapa de estudos:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}
