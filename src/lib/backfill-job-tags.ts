import { prisma } from "@/lib/prisma";
import { classifyJobForStorage } from "@/lib/feed-tags";

function jobRetentionDays(): number {
  const raw = Number(process.env.JOB_RETENTION_DAYS);
  return Number.isFinite(raw) && raw > 0 ? raw : 45;
}

/**
 * Cheap guard: how many active jobs were never tagged. `classifyJobForStorage`
 * always returns a non-empty `company` (falling back to "Empresa"), so an active
 * job with an empty company - or a null `expiresAt` - has never been processed.
 * Returns 0 once the backfill is complete, which makes the startup hook a no-op.
 *
 * `contractType` is intentionally NOT part of this guard: unlike `company`, an
 * empty `contractType` is also a legitimate outcome (no CLT/PJ/Estagio/Aprendiz
 * wording found in the ad), so using it here would make the backfill re-run on
 * every startup forever. The one-time pass to fill `contractType` on jobs that
 * predate that column is tracked separately via `countJobsNeedingContractType`.
 */
export function countJobsNeedingTags(): Promise<number> {
  return prisma.job.count({
    where: { active: true, OR: [{ company: "" }, { expiresAt: null }] },
  });
}

const CONTRACT_TYPE_BACKFILL_KEY = "job-tags:contract-type-backfilled-v1";

/**
 * One-time pass (tracked via app-settings, not column contents) to derive
 * `contractType` for jobs ingested before that column existed.
 */
export async function backfillContractTypeIfNeeded(): Promise<{ scanned: number; updated: number } | null> {
  const { getSetting, setSetting } = await import("@/lib/app-settings");
  if (await getSetting(CONTRACT_TYPE_BACKFILL_KEY)) return null;

  const jobs = await prisma.job.findMany({
    where: { active: true, contractType: "" },
    select: { id: true, jobTitle: true, jobText: true, url: true, location: true },
  });

  let updated = 0;
  for (const job of jobs) {
    const contractType = classifyJobForStorage(job).contractType;
    if (!contractType) continue;
    await prisma.job.update({ where: { id: job.id }, data: { contractType } });
    updated += 1;
  }

  await setSetting(CONTRACT_TYPE_BACKFILL_KEY, "true");
  return { scanned: jobs.length, updated };
}

/**
 * One-time backfill: derives area/seniority/workModel/entryLevel/company/salaryMin
 * (and fills a null expiresAt) for jobs ingested before the job-tags migration,
 * which have empty tag columns. Idempotent - only rows whose derived values still
 * differ from what is stored are written, so it is safe to run repeatedly.
 */
export async function backfillJobTags(): Promise<{ scanned: number; updated: number }> {
  const jobs = await prisma.job.findMany({
    where: { active: true },
    select: {
      id: true,
      jobTitle: true,
      jobText: true,
      url: true,
      location: true,
      company: true,
      area: true,
      seniority: true,
      workModel: true,
      contractType: true,
      entryLevel: true,
      salaryMin: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  const retentionMs = jobRetentionDays() * 24 * 60 * 60 * 1000;
  let updated = 0;

  for (const job of jobs) {
    const tags = classifyJobForStorage(job);
    const nextExpiresAt =
      job.expiresAt ?? new Date(job.createdAt.getTime() + retentionMs);

    const changed =
      tags.company !== job.company ||
      tags.area !== job.area ||
      tags.seniority !== job.seniority ||
      tags.workModel !== job.workModel ||
      tags.contractType !== job.contractType ||
      tags.entryLevel !== job.entryLevel ||
      (tags.salaryMin ?? null) !== job.salaryMin ||
      job.expiresAt === null;

    if (!changed) continue;

    await prisma.job.update({
      where: { id: job.id },
      data: {
        company: tags.company,
        area: tags.area,
        seniority: tags.seniority,
        workModel: tags.workModel,
        contractType: tags.contractType,
        entryLevel: tags.entryLevel,
        salaryMin: tags.salaryMin ?? null,
        expiresAt: nextExpiresAt,
      },
    });
    updated += 1;
  }

  return { scanned: jobs.length, updated };
}
