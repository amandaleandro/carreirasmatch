import { prisma } from "@/lib/prisma";

/**
 * Vincula currículos/análises feitas anonimamente (via Lead, sem conta) ao
 * usuário que acabou de logar/cadastrar com o mesmo e-mail. Sem isso, o link
 * de "/report/[id]" enviado por e-mail (lead_followup) nunca é acessível: o
 * Resume fica com userId null pra sempre e a página sempre devolve 404.
 */
export async function claimLeadResumesForUser(email: string, userId: string): Promise<void> {
  const leads = await prisma.lead.findMany({
    where: { email },
    select: { analyses: { select: { resumeId: true } } },
  });

  const resumeIds = [...new Set(leads.flatMap((lead) => lead.analyses.map((a) => a.resumeId)))];
  if (resumeIds.length === 0) return;

  await prisma.resume.updateMany({
    where: { id: { in: resumeIds }, userId: null },
    data: { userId },
  });
}
