import { prisma } from "@/lib/prisma";
import { compareJobs } from "@/lib/tools";
import { resolveFreeText } from "@/lib/area-taxonomy";

type JobProfileContext = { areas: string[]; roles: string[] };

function jobsPerBatch(): number {
  const raw = Number(process.env.FEED_MATCH_BATCH_SIZE);
  return Number.isFinite(raw) && raw > 0 ? raw : 20;
}

export const FEED_PAGE_SIZE = 10;

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function tokens(value: string): string[] {
  return normalize(value).split(/[^a-z0-9+#.]+/).filter((token) => token.length >= 3);
}

function readRoles(value: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(value ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).slice(0, 20)
      : [];
  } catch {
    return [];
  }
}

function profileAlignment(
  job: { jobTitle: string; jobText: string; area: string; subarea: string },
  context: JobProfileContext
): number | null {
  if (!context.areas.length && !context.roles.length) return null;

  const title = normalize(job.jobTitle);
  const jobText = normalize(`${job.jobTitle} ${job.jobText} ${job.area} ${job.subarea}`);
  const jobArea = resolveFreeText(job.area);
  const profileAreas = context.areas.map(resolveFreeText).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const areaMatch = profileAreas.some((area) => Boolean(jobArea && area.areaSlug === jobArea.areaSlug));
  const roleMatch = context.roles.some((role) => {
    const roleText = normalize(role);
    if (title.includes(roleText)) return true;
    const roleTokens = tokens(roleText);
    const titleTokens = new Set(tokens(title));
    return roleTokens.length > 0 && roleTokens.filter((token) => titleTokens.has(token)).length >= Math.max(1, Math.ceil(roleTokens.length / 2));
  });
  const subareaMatch = context.roles.some((role) => {
    const roleTokens = tokens(role);
    const jobTokens = new Set(tokens(jobText));
    return roleTokens.length > 0 && roleTokens.filter((token) => jobTokens.has(token)).length >= Math.max(1, Math.ceil(roleTokens.length / 2));
  });
  const knownAreaMismatch = profileAreas.length > 0 && Boolean(jobArea) && !areaMatch;

  if (knownAreaMismatch && !roleMatch) return 25;
  if (roleMatch && areaMatch) return 100;
  if (roleMatch || subareaMatch) return 88;
  if (areaMatch) return 78;
  return 50;
}

function applyProfileAlignment<T extends { fitScore: number; reason: string; job: { jobTitle: string; jobText: string; area: string; subarea: string } }>(
  match: T,
  context: JobProfileContext
): T {
  const alignment = profileAlignment(match.job, context);
  if (alignment === null) return match;
  const fitScore = Math.max(0, Math.min(100, Math.round(match.fitScore * 0.75 + alignment * 0.25)));
  const focus = context.roles[0] || context.areas[0];
  const reason = alignment <= 25
    ? `${match.reason} A nota foi reduzida porque a vaga está fora da área escolhida.`
    : alignment >= 88 && focus
      ? `${match.reason} Também está alinhada ao seu foco em ${focus}.`
      : match.reason;
  return { ...match, fitScore, reason };
}

async function loadProfileContext(userId: string): Promise<JobProfileContext> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { professionalArea: true, targetProfessionalArea: true, studyCourse: true, interestedRoles: true },
  });
  return {
    areas: [user?.targetProfessionalArea, user?.professionalArea, user?.studyCourse]
      .filter((value): value is string => Boolean(value?.trim())),
    roles: readRoles(user?.interestedRoles),
  };
}

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
      unscoredJobs.map((job) => ({ id: job.id, jobTitle: job.jobTitle, jobText: job.jobText })),
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
  const profileContext = await loadProfileContext(userId);
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

  const alignedMatches = matches.map((match) => applyProfileAlignment(match, profileContext));
  const seenJobIds = new Set<string>();
  const deduped = [];
  for (const match of alignedMatches) {
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
