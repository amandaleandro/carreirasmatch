import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";

/** Contexto mínimo (vaga + currículo) de uma candidatura ou análise já
 * existente, para ferramentas avulsas (carta, respostas de candidatura)
 * pré-preencherem em vez de pedir pro usuário colar tudo de novo quando ele
 * já veio da candidatura ou do resultado da análise. */
export async function GET(req: NextRequest) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const applicationId = req.nextUrl.searchParams.get("applicationId");
  const analysisId = req.nextUrl.searchParams.get("analysisId");

  if (applicationId) {
    const application = await prisma.application.findFirst({
      where: { id: applicationId, userId: session.user.id },
      include: {
        job: { select: { jobText: true } },
        analysis: { select: { resumeId: true } },
      },
    });
    if (!application) return NextResponse.json({ error: "Candidatura não encontrada." }, { status: 404 });

    const resume = application.analysis?.resumeId
      ? await prisma.resume.findUnique({ where: { id: application.analysis.resumeId }, select: { rawText: true } })
      : null;

    return NextResponse.json({
      jobTitle: application.jobTitle,
      company: application.company,
      jobText: application.job?.jobText || application.notes || "",
      resumeText: resume?.rawText || "",
    });
  }

  if (analysisId) {
    const analysis = await prisma.analysis.findFirst({
      where: { id: analysisId, resume: { userId: session.user.id } },
      select: { jobTitle: true, jobText: true, resumeId: true },
    });
    if (!analysis) return NextResponse.json({ error: "Análise não encontrada." }, { status: 404 });

    const resume = await prisma.resume.findUnique({ where: { id: analysis.resumeId }, select: { rawText: true } });

    return NextResponse.json({
      jobTitle: analysis.jobTitle,
      company: "",
      jobText: analysis.jobText,
      resumeText: resume?.rawText || "",
    });
  }

  return NextResponse.json({ error: "Informe applicationId ou analysisId." }, { status: 400 });
}
