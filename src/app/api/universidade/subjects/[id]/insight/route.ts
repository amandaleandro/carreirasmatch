import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSubjectCareerInsight } from "@/lib/university";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.universitySubjectInsight);
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
    const insight = await generateSubjectCareerInsight(subject.name, subject.enrollment.courseName);
    const updated = await prisma.universitySubject.update({
      where: { id: subject.id },
      data: {
        competencies: JSON.stringify(insight.competencies),
        relatedProfessions: JSON.stringify(insight.relatedProfessions),
        suggestedProject: insight.suggestedProject,
        generatedAt: new Date(),
      },
    });
    await release!.confirm();
    return NextResponse.json({ subject: updated });
  } catch (error) {
    await release!.cancel();
    console.error("Erro ao gerar conexão com carreira da disciplina:", error);
    return NextResponse.json({ error: "Erro ao processar. Tente novamente." }, { status: 500 });
  }
}
