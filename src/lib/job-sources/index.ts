import { prisma } from "@/lib/prisma";
import { fetchArbeitnowJobs } from "./arbeitnow";
import { fetchRemoteOkJobs } from "./remoteok";
import { fetchAdzunaJobs, isAdzunaConfigured } from "./adzuna";
import { fetchLinkedInJobs } from "./linkedin";
import { fetchIndeedJobs, isIndeedConfigured } from "./indeed";
import { fetchGupyJobs, isGupyConfigured } from "./gupy";
import { fetchTheMuseJobs } from "./themuse";
import { fetchJoobleJobs, isJoobleConfigured } from "./jooble";
import { fetchGlassdoorJobs, isGlassdoorConfigured } from "./glassdoor";
import { fetchHimalayasJobs } from "./himalayas";
import { fetchRemoteJobsOrgJobs } from "./remotejobsorg";
import { fetchSolidesJobs, isSolidesConfigured } from "./solides";
import { fetchJobicyJobs } from "./jobicy";
import { fetchRemotiveJobs } from "./remotive";
import { fetchGreenhouseJobs, isGreenhouseConfigured } from "./greenhouse";
import { fetchLeverJobs, isLeverConfigured } from "./lever";
import { FetchedJob, JobSearchTerms } from "./types";
import { classifyJobForStorage } from "@/lib/feed-tags";

export type RequestContext = {
  userIp: string;
  userAgent: string;
};

function toSourceError(sourceName: string, reason: unknown): string {
  const message = reason instanceof Error ? reason.message : "erro desconhecido";

  if (message.includes("403")) {
    return `${sourceName}: fonte externa bloqueou a consulta`;
  }

  return `${sourceName}: ${message}`;
}

function fingerprint(job: { jobTitle: string; company?: string; location?: string | null }): string {
  return [job.jobTitle, job.company ?? "", job.location ?? ""]
    .join("|")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchNewJobsFromAllSources(
  searchTerms?: JobSearchTerms,
  requestContext?: RequestContext,
  location?: string
): Promise<{ added: number; errors: string[] }> {
  const errors: string[] = [];
  const filterKeywords = searchTerms
    ? [searchTerms.titleEn, ...searchTerms.keywords]
    : undefined;
  const sources: { name: string; fetch: () => Promise<FetchedJob[]> }[] = [
    { name: "arbeitnow", fetch: () => fetchArbeitnowJobs(filterKeywords) },
    { name: "remoteok", fetch: () => fetchRemoteOkJobs(filterKeywords) },
    { name: "linkedin", fetch: () => fetchLinkedInJobs(searchTerms, location) },
    { name: "themuse", fetch: () => fetchTheMuseJobs(filterKeywords) },
    { name: "himalayas", fetch: () => fetchHimalayasJobs(filterKeywords) },
    { name: "remotejobsorg", fetch: () => fetchRemoteJobsOrgJobs(filterKeywords) },
    { name: "jobicy", fetch: () => fetchJobicyJobs(filterKeywords) },
    { name: "remotive", fetch: () => fetchRemotiveJobs(filterKeywords) },
  ];
  if (isIndeedConfigured()) {
    sources.push({ name: "indeed", fetch: () => fetchIndeedJobs(searchTerms?.titlePt, location) });
  }
  if (isAdzunaConfigured()) {
    sources.push({ name: "adzuna", fetch: () => fetchAdzunaJobs(searchTerms?.titlePt, location) });
  }
  if (isGupyConfigured()) {
    sources.push({ name: "gupy", fetch: () => fetchGupyJobs() });
  }
  if (isSolidesConfigured()) {
    sources.push({ name: "solides", fetch: () => fetchSolidesJobs() });
  }
  if (isGreenhouseConfigured()) {
    sources.push({ name: "greenhouse", fetch: () => fetchGreenhouseJobs(undefined, filterKeywords) });
  }
  if (isLeverConfigured()) {
    sources.push({ name: "lever", fetch: () => fetchLeverJobs(undefined, filterKeywords) });
  }
  if (isJoobleConfigured()) {
    sources.push({ name: "jooble", fetch: () => fetchJoobleJobs(searchTerms?.titlePt) });
  }
  if (isGlassdoorConfigured() && requestContext) {
    sources.push({
      name: "glassdoor",
      fetch: () =>
        fetchGlassdoorJobs(searchTerms?.titlePt, requestContext.userIp, requestContext.userAgent),
    });
  }

  const results = await Promise.allSettled(sources.map((source) => source.fetch()));

  const candidatesByUrl = new Map<string, FetchedJob>();
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      for (const job of result.value) {
        if (!candidatesByUrl.has(job.url)) candidatesByUrl.set(job.url, job);
      }
    } else {
      errors.push(toSourceError(sources[index].name, result.reason));
    }
  });

  const candidates = [...candidatesByUrl.values()];
  if (candidates.length === 0) return { added: 0, errors };

  const existing = await prisma.job.findMany({
    where: { url: { in: candidates.map((job) => job.url) } },
    select: { url: true },
  });
  const existingUrls = new Set(existing.map((job) => job.url));

  const activeExisting = await prisma.job.findMany({
    where: { active: true },
    select: { jobTitle: true, company: true, location: true },
  });
  const existingFingerprints = new Set(activeExisting.map(fingerprint));

  const newJobs = candidates.filter((job) => {
    if (existingUrls.has(job.url)) return false;
    const tags = classifyJobForStorage(job);
    const key = fingerprint({ ...job, company: tags.company });
    if (existingFingerprints.has(key)) return false;
    existingFingerprints.add(key);
    return true;
  });

  if (newJobs.length > 0) {
    await prisma.job.createMany({
      data: newJobs.map((job) => ({
        ...job,
        ...classifyJobForStorage(job),
        expiresAt: new Date(Date.now() + jobRetentionDays() * 24 * 60 * 60 * 1000),
      })),
    });
  }

  return { added: newJobs.length, errors };
}

function jobRetentionDays(): number {
  const raw = Number(process.env.JOB_RETENTION_DAYS);
  return Number.isFinite(raw) && raw > 0 ? raw : 45;
}
