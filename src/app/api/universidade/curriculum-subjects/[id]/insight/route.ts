import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateSubjectCareerInsight } from "@/lib/university";
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
    include: { universityCourse: { select: { title: true } }, insight: true },
  });
  if (!subject) {
    return NextResponse.json({ error: "Disciplina não encontrada." }, { status: 404 });
  }

  // Compartilhado entre todos os alunos do curso: se já foi gerado por outro aluno
  // recentemente, reaproveita em vez de gastar IA de novo — por isso o cache é lido
  // pra todo mundo logado, e só quem vai de fato disparar a geração (gastar cota)
  // precisa reservar.
  if (subject.insight) {
    return NextResponse.json({ insight: subject.insight });
  }

  const { response, release } = await reserveFeatureForRoute(COMMERCIAL_FEATURE_KEYS.universitySubjectInsight);
  if (response) return response;

  try {
    const generated = await generateSubjectCareerInsight(subject.name, subject.universityCourse.title);
    const insight = await prisma.curriculumSubjectInsight.create({
      data: {
        curriculumSubjectId: subject.id,
        competencies: JSON.stringify(generated.competencies),
        relatedProfessions: JSON.stringify(generated.relatedProfessions),
        suggestedProject: generated.suggestedProject,
      },
    });
    await release!.confirm();
    return NextResponse.json({ insight });
  } catch (error) {
    await release!.cancel();
    console.error("Erro ao gerar conexão com carreira da disciplina do catálogo:", error);
    return NextResponse.json({ error: "Erro ao processar. Tente novamente." }, { status: 500 });
  }
}
