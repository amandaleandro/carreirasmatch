import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateSubjectStudyMaterial } from "@/lib/university";
import { reserveFeatureForRoute } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  }

  const { id } = await params;
  const subject = await prisma.curriculumSubject.findUnique({
    where: { id },
    include: { universityCourse: { select: { title: true } }, studyMaterial: true },
  });
  if (!subject) {
    return NextResponse.json({ error: "Disciplina não encontrada." }, { status: 404 });
  }

  // Compartilhado entre todos os alunos do curso: mesmo esquema de cache do insight/exercícios.
  if (subject.studyMaterial) {
    return NextResponse.json({ studyMaterial: subject.studyMaterial });
  }

  const { response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.studyTool);
  if (response) return response;

  try {
    const generated = await generateSubjectStudyMaterial(subject.name, subject.universityCourse.title);
    const studyMaterial = await prisma.curriculumSubjectStudyMaterial.create({
      data: {
        curriculumSubjectId: subject.id,
        summary: generated.summary,
        topics: JSON.stringify(generated.topics),
        keyPoints: JSON.stringify(generated.keyPoints),
      },
    });
    await release!.confirm();
    return NextResponse.json({ studyMaterial });
  } catch (error) {
    await release!.cancel();
    console.error("Erro ao gerar material de estudo da disciplina do catálogo:", error);
    return NextResponse.json({ error: "Erro ao processar. Tente novamente." }, { status: 500 });
  }
}
