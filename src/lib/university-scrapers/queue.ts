import { prisma } from "@/lib/prisma";

export type UniversityScrapeJobStatus = "pending" | "running" | "completed" | "failed";

export async function enqueueUniversityScrapeJob(input: {
  universityId: string;
  universityCourseId?: string;
  url: string;
  adapter?: string;
  priority?: number;
}) {
  return prisma.universityScrapeJob.upsert({
    where: { universityId_url: { universityId: input.universityId, url: input.url } },
    create: {
      universityId: input.universityId,
      universityCourseId: input.universityCourseId,
      url: input.url,
      adapter: input.adapter ?? "auto",
      priority: input.priority ?? 100,
    },
    update: {
      universityCourseId: input.universityCourseId,
      adapter: input.adapter ?? "auto",
      priority: input.priority ?? 100,
    },
  });
}

export async function startUniversityScrapeJob(id: string) {
  const updated = await prisma.universityScrapeJob.updateMany({
    where: { id, status: { in: ["pending", "failed"] }, nextAttemptAt: { lte: new Date() } },
    data: { status: "running", attempts: { increment: 1 }, lastAttemptAt: new Date(), lastError: null },
  });
  return updated.count === 1;
}

export async function completeUniversityScrapeJob(id: string) {
  return prisma.universityScrapeJob.update({
    where: { id },
    data: { status: "completed", processedAt: new Date(), lastError: null },
  });
}

export async function failUniversityScrapeJob(id: string, error: unknown) {
  const job = await prisma.universityScrapeJob.findUnique({ where: { id }, select: { attempts: true } });
  const attempts = job?.attempts ?? 1;
  const delayHours = Math.min(24 * 7, 2 ** Math.min(attempts, 8));
  return prisma.universityScrapeJob.update({
    where: { id },
    data: {
      status: "failed",
      lastError: error instanceof Error ? error.message.slice(0, 2000) : String(error).slice(0, 2000),
      nextAttemptAt: new Date(Date.now() + delayHours * 60 * 60 * 1000),
    },
  });
}

export async function listPendingUniversityScrapeJobs(limit = 25) {
  return prisma.universityScrapeJob.findMany({
    where: { status: { in: ["pending", "failed"] }, nextAttemptAt: { lte: new Date() } },
    orderBy: [{ priority: "asc" }, { nextAttemptAt: "asc" }],
    take: Math.max(1, Math.min(limit, 100)),
    include: { university: true, universityCourse: true },
  });
}
