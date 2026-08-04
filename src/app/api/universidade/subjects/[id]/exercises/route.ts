import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSubjectExercises } from "@/lib/university";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.studyTool);
  if (!session) return response!;

  const { id } = await params;
  const subject = await prisma.universitySubject.findFirst({
    where: { id, enrollment: { userId: session.user.id } },
    include: { enrollment: true },
  });
  if (!subject) {
    await release!.cancel();
    return NextResponse.json({ error: "Disciplina não encontrada." }, { status: 404 });
  }

  try {
    const generated = await generateSubjectExercises(subject.name, subject.enrollment.courseName);
    const updated = await prisma.universitySubject.update({
      where: { id: subject.id },
      data: {
        exercises: JSON.stringify(generated.questions),
        exercisesGeneratedAt: new Date(),
      },
    });
    await release!.confirm();
    return NextResponse.json({ subject: updated });
  } catch (error) {
    await release!.cancel();
    console.error("Erro ao gerar lista de exercícios da disciplina:", error);
    return NextResponse.json({ error: "Erro ao processar. Tente novamente." }, { status: 500 });
  }
}
