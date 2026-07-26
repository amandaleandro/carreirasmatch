import { prisma } from "@/lib/prisma";
import { compareJobs } from "@/lib/tools";

function jobsPerBatch(): number {
  const raw = Number(process.env.FEED_MATCH_BATCH_SIZE);
  return Number.isFinite(raw) && raw > 0 ? raw : 20;
}

export const FEED_PAGE_SIZE = 10;

async function scoreUnscoredJobs(resumeId: string, resumeText: string) {
  const unscoredJobs = await prisma.job.findMany({
    where: { active: true, matches: { none: { resumeId } } },
    take: jobsPerBatch(),
    orderBy: { createdAt: "desc" },
  });

  if (unscoredJobs.length === 0) return;

  try {
    const result = await compareJobs(
      resumeText,
      unscoredJobs.map((job) => ({ id: job.id, jobTitle: job.jobTitle, jobText: job.jobText }))
    );

    const jobsById = new Map(unscoredJobs.map((job) => [job.id, job]));

    const data = result.ranking
      .map((entry) => {
        const job = jobsById.get(entry.jobId);
        if (!job) return null;
        return {
          resumeId,
          jobId: job.id,
          fitScore: entry.fitScore,
          reason: entry.reason,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    if (data.length > 0) {
      await prisma.$transaction(
        data.map((entry) =>
          prisma.jobMatch.upsert({
            where: { resumeId_jobId: { resumeId: entry.resumeId, jobId: entry.jobId } },
            update: {},
            create: entry,
          })
        )
      );
    }
  } catch (error) {
    console.error("Falha ao pontuar vagas no feed:", error);
  }
}

export async function getOrCreateFeedMatches(userId: string, resumeId: string, resumeText: string) {
  async function findMatches() {
    return prisma.jobMatch.findMany({
      where: { resume: { userId }, status: { not: "discarded" } },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { job: true },
    });
  }

  const matches = await findMatches();
  if (matches.length === 0) {
    // A análise de IA não deve bloquear a abertura do Feed.
    void scoreUnscoredJobs(resumeId, resumeText).catch((error) => {
      console.error("Falha ao pontuar vagas no feed:", error);
    });
  } else {
    scoreUnscoredJobs(resumeId, resumeText).catch((error) => {
      console.error("Falha ao pontuar vagas no feed:", error);
    });
  }

  const seenJobIds = new Set<string>();
  const deduped = [];
  for (const match of matches) {
    if (seenJobIds.has(match.jobId)) continue;
    seenJobIds.add(match.jobId);
    deduped.push(match);
  }

  deduped.sort(
    (a, b) =>
      b.fitScore - a.fitScore || b.job.createdAt.getTime() - a.job.createdAt.getTime()
  );

  return deduped;
}
