import { prisma } from "@/lib/prisma";

/**
 * Coloca a vaga do Kit Candidatura recém-liberado no painel de candidaturas do
 * usuário (uma vez por análise). Nunca lança: falha aqui não pode derrubar a
 * confirmação de pagamento.
 */
export async function ensureApplicationForDiagnostic(userId: string, analysisId: string): Promise<void> {
  try {
    const details = await prisma.analysis.findUnique({
      where: { id: analysisId },
      select: { jobTitle: true, overallScore: true },
    });
    if (!details) return;

    const existing = await prisma.application.findFirst({
      where: { userId, analysisId },
      select: { id: true },
    });
    if (existing) return;

    await prisma.application.create({
      data: {
        userId,
        analysisId,
        jobTitle: details.jobTitle,
        fitScore: details.overallScore,
        status: "saved",
        notes: "Adicionada automaticamente ao liberar o Kit Candidatura.",
      },
    });
  } catch (error) {
    console.error("application-autotrack: falha ao criar candidatura automática", error);
  }
}
