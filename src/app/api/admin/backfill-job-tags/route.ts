import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { classifyJobForStorage } from "@/lib/feed-tags";

export const dynamic = "force-dynamic";

function jobRetentionDays(): number {
  const raw = Number(process.env.JOB_RETENTION_DAYS);
  return Number.isFinite(raw) && raw > 0 ? raw : 45;
}

/**
 * One-time backfill: derives area/seniority/workModel/entryLevel/company/salaryMin
 * for jobs that were ingested before the job-tags migration and therefore have
 * empty tag columns. Idempotent — re-running only touches rows whose derived
 * values still differ from what is stored, so it is safe to hit repeatedly.
 */
async function backfill() {
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
        entryLevel: tags.entryLevel,
        salaryMin: tags.salaryMin ?? null,
        expiresAt: nextExpiresAt,
      },
    });
    updated += 1;
  }

  return { scanned: jobs.length, updated };
}

export async function GET() {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  const result = await backfill();
  return NextResponse.json({ ok: true, ...result });
}
