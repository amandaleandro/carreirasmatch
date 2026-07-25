import { prisma } from "@/lib/prisma";
import { sendCompanyNewApplicationWhatsapp } from "@/lib/evolution";
import { sendCompanyNewApplicationEmail } from "@/lib/resend";
import { parseAutoApplyProfile, type AutoApplyProfile } from "@/lib/auto-apply-profile";
import { applyToExternalJob } from "@/lib/external-auto-apply";

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
  profile: AutoApplyProfile;
  resumeFileName: string;
  resumePdf: Uint8Array | null;
};

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

    const externalResult = await applyToExternalJob({
      jobUrl: item.jobUrl,
      profile: external.profile,
      resumeFileName: external.resumeFileName,
      resumePdf: external.resumePdf,
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
    select: { id: true, fileName: true, pdfData: true },
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
