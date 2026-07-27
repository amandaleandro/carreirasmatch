import { prisma } from "@/lib/prisma";
import { sendCompanyNewApplicationWhatsapp } from "@/lib/evolution";
import { sendCompanyNewApplicationEmail, sendAutoApplyManualActionEmail, sendOnce } from "@/lib/resend";
import { parseAutoApplyProfile, type AutoApplyProfile } from "@/lib/auto-apply-profile";
import { applyToExternalJob } from "@/lib/external-auto-apply";
import { extractStructuredResume, tailorResumeForJob } from "@/lib/groq";
import { renderResumePdf } from "@/lib/resume-pdf";

export type AutoApplyRunResult = {
  queued: number;
  applied: number;
  unsupported: number;
  failed: number;
  skipped: number;
};

const EMPTY_RESULT: AutoApplyRunResult = {
  queued: 0,
  applied: 0,
  unsupported: 0,
  failed: 0,
  skipped: 0,
};
const MAX_APPLICATIONS_PER_RUN = 5;

type ExternalContext = {
  enabled: boolean;
  autoTailorResume: boolean;
  profile: AutoApplyProfile;
  resumeFileName: string;
  resumePdf: Uint8Array | null;
  resumeRawText: string | null;
};

/**
 * Reescreve o currículo (resumo/skills/experiências) com ênfase na vaga e renderiza um PDF novo,
 * pra candidatura externa não sair sempre com o currículo genérico. Qualquer falha (IA fora do ar,
 * currículo sem texto extraído etc.) cai de volta pro PDF original — nunca bloqueia a candidatura.
 */
async function buildTailoredResumePdf(
  resumeRawText: string | null,
  jobTitle: string,
  company: string,
  jobText: string,
  fallbackPdf: Uint8Array | null,
): Promise<Uint8Array | null> {
  if (!resumeRawText?.trim()) return fallbackPdf;
  try {
    const structured = await extractStructuredResume(resumeRawText);
    const tailored = await tailorResumeForJob(structured, jobTitle, company, jobText);
    const pdfBytes = await renderResumePdf({
      summary: tailored.summary,
      resumeStructured: {
        ...structured,
        skills: tailored.skills,
        experiences: tailored.experiences,
      },
    });
    return pdfBytes;
  } catch (error) {
    console.error("auto-apply: falha ao adaptar currículo, usando o original", error);
    return fallbackPdf;
  }
}

function startOfUtcDay(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

async function notifyCompany(
  companyId: string,
  candidateName: string,
  vagaTitle: string,
  vagaId: string,
): Promise<void> {
  const [owners, company] = await Promise.all([
    prisma.companyMember.findMany({
      where: { companyId, role: "owner" },
      select: { email: true },
    }),
    prisma.company.findUnique({
      where: { id: companyId },
      select: { phone: true },
    }),
  ]);

  const emails = owners.map((owner) => owner.email).filter(Boolean);
  await Promise.allSettled([
    sendCompanyNewApplicationEmail(emails, { candidateName, vagaTitle, vagaId }),
    company?.phone
      ? sendCompanyNewApplicationWhatsapp(company.phone, { candidateName, vagaTitle, vagaId })
      : Promise.resolve(),
  ]);
}

async function processQueueItem(
  queueId: string,
  userId: string,
  candidateName: string,
  external: ExternalContext,
): Promise<"applied" | "unsupported" | "failed" | "skipped"> {
  const claimed = await prisma.autoApplicationQueue.updateMany({
    where: { id: queueId, userId, status: "queued" },
    data: { status: "processing", failureReason: null },
  });
  if (claimed.count === 0) return "skipped";

  const item = await prisma.autoApplicationQueue.findUnique({
    where: { id: queueId },
    include: { job: true },
  });
  if (!item?.jobId || !item.job?.active) {
    await prisma.autoApplicationQueue.update({
      where: { id: queueId },
      data: { status: "failed", failureReason: "A vaga não está mais disponível." },
    });
    return "failed";
  }

  const vaga = await prisma.companyVaga.findFirst({
    where: {
      feedJobId: item.jobId,
      publishedToFeed: true,
      status: "open",
    },
    select: { id: true, title: true, companyId: true },
  });

  if (!vaga) {
    if (!external.enabled) {
      await prisma.autoApplicationQueue.update({
        where: { id: queueId },
        data: {
          status: "unsupported_external",
          failureReason: "Ative a automação de navegador para processar vagas externas.",
        },
      });
      return "unsupported";
    }

    const resumePdf = external.autoTailorResume
      ? await buildTailoredResumePdf(
          external.resumeRawText,
          item.jobTitle,
          item.company,
          item.job.jobText,
          external.resumePdf,
        )
      : external.resumePdf;

    const externalResult = await applyToExternalJob({
      jobUrl: item.jobUrl,
      profile: external.profile,
      resumeFileName: external.resumeFileName,
      resumePdf: resumePdf,
    });

    if (externalResult.status !== "applied") {
      await prisma.autoApplicationQueue.update({
        where: { id: queueId },
        data: {
          status: externalResult.status === "blocked" ? "blocked_external" : "failed",
          failureReason: externalResult.detail,
        },
      });
      return externalResult.status === "blocked" ? "unsupported" : "failed";
    }

    const appliedAt = new Date();
    await prisma.$transaction(async (tx) => {
      const tracked = await tx.application.findFirst({
        where: { userId, jobId: item.jobId },
        select: { id: true, status: true },
      });
      if (tracked) {
        await tx.application.update({
          where: { id: tracked.id },
          data: {
            status: "applied",
            appliedAt,
            fitScore: item.fitScore,
            notes: "Enviada automaticamente em formulário externo.",
          },
        });
        if (tracked.status !== "applied") {
          await tx.applicationActivity.create({
            data: { applicationId: tracked.id, fromStatus: tracked.status, toStatus: "applied" },
          });
        }
      } else {
        const application = await tx.application.create({
          data: {
            userId,
            jobId: item.jobId,
            company: item.company,
            jobTitle: item.jobTitle,
            jobUrl: item.jobUrl,
            fitScore: item.fitScore,
            status: "applied",
            appliedAt,
            notes: "Enviada automaticamente em formulário externo.",
          },
        });
        await tx.applicationActivity.create({
          data: { applicationId: application.id, toStatus: "applied" },
        });
      }
      await tx.autoApplicationQueue.update({
        where: { id: queueId },
        data: { status: "applied", appliedAt, failureReason: null },
      });
    });
    return "applied";
  }

  try {
    const appliedAt = new Date();
    const wasAlreadyApplied = await prisma.companyJobApplication.findUnique({
      where: { vagaId_userId: { vagaId: vaga.id, userId } },
      select: { id: true },
    });

    await prisma.$transaction(async (tx) => {
      await tx.companyJobApplication.upsert({
        where: { vagaId_userId: { vagaId: vaga.id, userId } },
        create: {
          vagaId: vaga.id,
          userId,
          message: "Candidatura enviada automaticamente pelo Piloto Automático.",
        },
        update: {},
      });

      const tracked = await tx.application.findFirst({
        where: { userId, jobId: item.jobId },
        select: { id: true, status: true },
      });

      if (tracked) {
        await tx.application.update({
          where: { id: tracked.id },
          data: {
            status: "applied",
            appliedAt: appliedAt,
            fitScore: item.fitScore,
            notes: "Enviada automaticamente pelo Piloto Automático.",
          },
        });
        if (tracked.status !== "applied") {
          await tx.applicationActivity.create({
            data: {
              applicationId: tracked.id,
              fromStatus: tracked.status,
              toStatus: "applied",
            },
          });
        }
      } else {
        const application = await tx.application.create({
          data: {
            userId,
            jobId: item.jobId,
            company: item.company,
            jobTitle: item.jobTitle,
            jobUrl: item.jobUrl,
            fitScore: item.fitScore,
            status: "applied",
            appliedAt,
            notes: "Enviada automaticamente pelo Piloto Automático.",
          },
        });
        await tx.applicationActivity.create({
          data: { applicationId: application.id, toStatus: "applied" },
        });
      }

      await tx.autoApplicationQueue.update({
        where: { id: queueId },
        data: { status: "applied", appliedAt, failureReason: null },
      });
    });

    if (!wasAlreadyApplied) {
      await notifyCompany(vaga.companyId, candidateName, vaga.title, vaga.id);
    }
    return "applied";
  } catch (error) {
    const reason = error instanceof Error ? error.message.slice(0, 500) : "Falha inesperada no envio.";
    await prisma.autoApplicationQueue.update({
      where: { id: queueId },
      data: { status: "failed", failureReason: reason },
    });
    return "failed";
  }
}

/**
 * Avisa o candidato (uma vez por dia, em lote) das vagas que o robô encontrou mas não conseguiu
 * concluir sozinho nesta execução (CAPTCHA, login exigido, campo sem resposta configurada) — sem
 * isso o item some numa fila que o candidato pode nunca abrir, e a vaga fica intransponível pro
 * robô mas continua aberta pra candidatura manual.
 */
async function notifyBlockedExternalItems(
  userId: string,
  runStart: Date,
  user: { name: string | null; email: string | null } | null,
): Promise<void> {
  if (!user?.email) return;
  const blocked = await prisma.autoApplicationQueue.findMany({
    where: { userId, status: "blocked_external", updatedAt: { gte: runStart } },
    select: { jobTitle: true, company: true, jobUrl: true, failureReason: true },
  });
  if (!blocked.length) return;
  await sendOnce(
    "auto_apply_manual_action",
    `${userId}:${startOfUtcDay(runStart).toISOString()}`,
    user.email,
    () =>
      sendAutoApplyManualActionEmail(user.email!, {
        name: user.name,
        items: blocked.map((item) => ({
          jobTitle: item.jobTitle,
          company: item.company,
          jobUrl: item.jobUrl,
          reason: item.failureReason,
        })),
      }),
  );
}

export async function runAutoApplyForUser(
  userId: string,
  now = new Date(),
): Promise<AutoApplyRunResult> {
  const settings = await prisma.autoApplicationSettings.findUnique({
    where: { userId },
  });
  if (!settings?.enabled || !settings.consentedAt) return { ...EMPTY_RESULT };

  const resume = await prisma.resume.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, fileName: true, pdfData: true, rawText: true },
  });
  if (!resume) return { ...EMPTY_RESULT, skipped: 1 };

  const [alreadyAppliedToday, user] = await Promise.all([
    prisma.autoApplicationQueue.count({
      where: {
        userId,
        status: "applied",
        appliedAt: { gte: startOfUtcDay(now) },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, phone: true, city: true, state: true },
    }),
  ]);

  const storedProfile = parseAutoApplyProfile(settings.applicationProfile);
  const externalContext: ExternalContext = {
    enabled: settings.externalAutomationEnabled && Boolean(settings.externalConsentedAt),
    autoTailorResume: settings.autoTailorResume,
    profile: {
      ...storedProfile,
      fullName: storedProfile.fullName || user?.name || "",
      email: storedProfile.email || user?.email || "",
      phone: storedProfile.phone || user?.phone || "",
      city: storedProfile.city || user?.city || "",
      state: storedProfile.state || user?.state || "",
    },
    resumeFileName: resume.fileName,
    resumePdf: resume.pdfData ? new Uint8Array(resume.pdfData) : null,
    resumeRawText: resume.rawText,
  };

  const remaining = Math.max(0, settings.dailyLimit - alreadyAppliedToday);
  if (remaining === 0) return { ...EMPTY_RESULT, skipped: 1 };

  const pending = await prisma.autoApplicationQueue.findMany({
    where: { userId, status: "queued" },
    orderBy: { createdAt: "asc" },
    take: Math.min(remaining, MAX_APPLICATIONS_PER_RUN),
    select: { id: true },
  });

  const result = { ...EMPTY_RESULT };
  for (const item of pending) {
    const outcome = await processQueueItem(
      item.id,
      userId,
      user?.name?.trim() || "Um candidato",
      externalContext,
    );
    if (outcome === "applied") result.applied += 1;
    else if (outcome === "unsupported") result.unsupported += 1;
    else if (outcome === "failed") result.failed += 1;
    else result.skipped += 1;
  }

  const slotsLeft = Math.max(0, remaining - result.applied);
  if (slotsLeft === 0) {
    await prisma.autoApplicationSettings.update({
      where: { userId },
      data: { lastRunAt: now },
    });
    await notifyBlockedExternalItems(userId, now, user);
    return result;
  }

  const matches = await prisma.jobMatch.findMany({
    where: {
      resumeId: resume.id,
      fitScore: { gte: settings.minMatchScore },
      job: { active: true },
    },
    include: { job: true },
    orderBy: [{ fitScore: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  const queueIds: string[] = [];
  const runCapacity = Math.min(
    slotsLeft,
    Math.max(0, MAX_APPLICATIONS_PER_RUN - pending.length),
  );
  for (const match of matches) {
    if (queueIds.length >= runCapacity) break;
    const existing = await prisma.autoApplicationQueue.findFirst({
      where: { userId, jobId: match.jobId },
      select: { id: true },
    });
    if (existing) {
      result.skipped += 1;
      continue;
    }

    try {
      const item = await prisma.autoApplicationQueue.create({
        data: {
          userId,
          jobId: match.jobId,
          jobTitle: match.job.jobTitle,
          company: match.job.company,
          jobUrl: match.job.url,
          fitScore: match.fitScore,
          status: "queued",
          tailoredResumeId: null,
        },
      });
      queueIds.push(item.id);
      result.queued += 1;
    } catch {
      result.skipped += 1;
    }
  }

  for (const queueId of queueIds) {
    const outcome = await processQueueItem(
      queueId,
      userId,
      user?.name?.trim() || "Um candidato",
      externalContext,
    );
    if (outcome === "applied") result.applied += 1;
    else if (outcome === "unsupported") result.unsupported += 1;
    else if (outcome === "failed") result.failed += 1;
    else result.skipped += 1;
  }

  await notifyBlockedExternalItems(userId, now, user);

  await prisma.autoApplicationSettings.update({
    where: { userId },
    data: { lastRunAt: now },
  });
  return result;
}

export async function runAutoApplyBatch(): Promise<AutoApplyRunResult> {
  const enabled = await prisma.autoApplicationSettings.findMany({
    where: { enabled: true, consentedAt: { not: null } },
    select: { userId: true },
    take: 100,
  });

  const total = { ...EMPTY_RESULT };
  for (const { userId } of enabled) {
    try {
      const result = await runAutoApplyForUser(userId);
      total.queued += result.queued;
      total.applied += result.applied;
      total.unsupported += result.unsupported;
      total.failed += result.failed;
      total.skipped += result.skipped;
    } catch (error) {
      total.failed += 1;
      console.error(`auto-apply: falha para o usuário ${userId}`, error);
    }
  }
  return total;
}
