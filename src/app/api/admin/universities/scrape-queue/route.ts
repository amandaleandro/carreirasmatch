import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { listPendingUniversityScrapeJobs } from "@/lib/university-scrapers/queue";

export const dynamic = "force-dynamic";

export async function GET() {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  const [pending, running, completed, failed, jobs] = await Promise.all([
    prisma.universityScrapeJob.count({ where: { status: "pending" } }),
    prisma.universityScrapeJob.count({ where: { status: "running" } }),
    prisma.universityScrapeJob.count({ where: { status: "completed" } }),
    prisma.universityScrapeJob.count({ where: { status: "failed" } }),
    listPendingUniversityScrapeJobs(25),
  ]);

  return NextResponse.json({
    totals: { pending, running, completed, failed },
    jobs: jobs.map((job) => ({
      id: job.id,
      university: job.university.name,
      course: job.universityCourse?.title ?? null,
      url: job.url,
      adapter: job.adapter,
      status: job.status,
      priority: job.priority,
      attempts: job.attempts,
      nextAttemptAt: job.nextAttemptAt,
      lastError: job.lastError,
    })),
  });
}
