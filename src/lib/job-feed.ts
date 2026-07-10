import { prisma } from "@/lib/prisma";
import { compareJobs } from "@/lib/tools";

const MAX_JOBS_PER_BATCH = 4;
export const FEED_PAGE_SIZE = 10;

async function scoreUnscoredJobs(resumeId: string, resumeText: string) {
  const unscoredJobs = await prisma.job.findMany({
    where: { active: true, matches: { none: { resumeId } } },
    take: MAX_JOBS_PER_BATCH,
    // Mais antigas primeiro: evita que vagas novas cheguem em cada carregamento
    // de página e "empurrem" vagas antigas para sempre fora do lote.
    orderBy: { createdAt: "asc" },
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
  // Pontuar vagas novas envolve uma chamada de IA, que é lenta. Isso não deve
  // bloquear o carregamento da página: disparamos em segundo plano e servimos
  // o feed com o que já está pontuado no banco.
  scoreUnscoredJobs(resumeId, resumeText).catch((error) => {
    console.error("Falha ao pontuar vagas no feed:", error);
  });

  // Um usuário pode ter mais de um Resume (um por diagnóstico refeito). As
  // vagas combinadas ficam presas ao resumeId, então buscamos por todos os
  // currículos do usuário para não perder o histórico de matches ao refazer
  // o diagnóstico.
  const matches = await prisma.jobMatch.findMany({
    where: { resume: { userId }, status: { not: "discarded" } },
    orderBy: { createdAt: "desc" },
    include: { job: true },
  });

  const seenJobIds = new Set<string>();
  const deduped = [];
  for (const match of matches) {
    if (seenJobIds.has(match.jobId)) continue;
    seenJobIds.add(match.jobId);
    deduped.push(match);
  }

  deduped.sort((a, b) => b.fitScore - a.fitScore);

  return deduped;
}
