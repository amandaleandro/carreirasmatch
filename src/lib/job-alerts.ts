import { prisma } from "@/lib/prisma";

export interface HighMatchAlertResult {
  userId: string;
  userEmail: string;
  matchedCount: number;
  topJobTitles: string[];
}

/**
 * Processa todos os JobAlerts ativos e encontra vagas recentes com match de IA >= 85%.
 */
export async function processJobAlerts(): Promise<HighMatchAlertResult[]> {
  const alerts = await prisma.jobAlert.findMany({
    where: { active: true },
    include: {
      user: {
        select: { id: true, email: true, name: true, resumes: { select: { id: true }, orderBy: { createdAt: "desc" }, take: 1 } },
      },
    },
  });

  const results: HighMatchAlertResult[] = [];

  for (const alert of alerts) {
    if (!alert.user?.email || alert.user.resumes.length === 0) continue;

    const latestResumeId = alert.user.resumes[0].id;

    // Busca matches >= 85 no banco de dados para este currículo
    const matches = await prisma.jobMatch.findMany({
      where: {
        resumeId: latestResumeId,
        fitScore: { gte: 85 },
      },
      include: {
        job: { select: { id: true, jobTitle: true, company: true, city: true, state: true, url: true } },
      },
      orderBy: { fitScore: "desc" },
      take: 5,
    });

    if (matches.length === 0) continue;

    const dedupeKey = `job_alert_${alert.id}_${new Date().toISOString().slice(0, 10)}`;

    // Checa idempotência no EmailLog
    const existingLog = await prisma.emailLog.findUnique({
      where: {
        type_dedupeKey: {
          type: "job_alert_high_match",
          dedupeKey,
        },
      },
    });

    if (existingLog) continue;

    // Registra o log do alerta de alta adesão
    await prisma.emailLog.create({
      data: {
        type: "job_alert_high_match",
        dedupeKey,
        email: alert.user.email,
      },
    });

    results.push({
      userId: alert.user.id,
      userEmail: alert.user.email,
      matchedCount: matches.length,
      topJobTitles: matches.map((m) => `${m.job.jobTitle} (${m.fitScore}% match)`),
    });
  }

  return results;
}
