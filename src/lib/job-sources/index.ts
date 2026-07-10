import { prisma } from "@/lib/prisma";
import { fetchArbeitnowJobs } from "./arbeitnow";
import { fetchRemoteOkJobs } from "./remoteok";
import { fetchAdzunaJobs, isAdzunaConfigured } from "./adzuna";
import { fetchLinkedInJobs } from "./linkedin";
import { fetchIndeedJobs } from "./indeed";
import { fetchGupyJobs, isGupyConfigured } from "./gupy";
import { fetchTheMuseJobs } from "./themuse";
import { fetchJoobleJobs, isJoobleConfigured } from "./jooble";
import { fetchGlassdoorJobs, isGlassdoorConfigured } from "./glassdoor";
import { fetchHimalayasJobs } from "./himalayas";
import { fetchRemoteJobsOrgJobs } from "./remotejobsorg";
import { fetchSolidesJobs, isSolidesConfigured } from "./solides";
import { FetchedJob, JobSearchTerms } from "./types";

export type RequestContext = {
  userIp: string;
  userAgent: string;
};

export async function fetchNewJobsFromAllSources(
  searchTerms?: JobSearchTerms,
  requestContext?: RequestContext
): Promise<{ added: number; errors: string[] }> {
  const errors: string[] = [];
  const filterKeywords = searchTerms
    ? [searchTerms.titleEn, ...searchTerms.keywords]
    : undefined;
  const sources: { name: string; fetch: () => Promise<FetchedJob[]> }[] = [
    { name: "arbeitnow", fetch: () => fetchArbeitnowJobs(filterKeywords) },
    { name: "remoteok", fetch: () => fetchRemoteOkJobs(filterKeywords) },
    { name: "linkedin", fetch: () => fetchLinkedInJobs(searchTerms) },
    { name: "indeed", fetch: () => fetchIndeedJobs(searchTerms?.titlePt) },
    { name: "themuse", fetch: () => fetchTheMuseJobs(filterKeywords) },
    { name: "himalayas", fetch: () => fetchHimalayasJobs(filterKeywords) },
    { name: "remotejobsorg", fetch: () => fetchRemoteJobsOrgJobs(filterKeywords) },
  ];
  if (isAdzunaConfigured()) {
    sources.push({ name: "adzuna", fetch: () => fetchAdzunaJobs(searchTerms?.titlePt) });
  }
  if (isGupyConfigured()) {
    sources.push({ name: "gupy", fetch: () => fetchGupyJobs() });
  }
  if (isSolidesConfigured()) {
    sources.push({ name: "solides", fetch: () => fetchSolidesJobs() });
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
      errors.push(`${sources[index].name}: ${result.reason?.message ?? "erro desconhecido"}`);
    }
  });

  const candidates = [...candidatesByUrl.values()];
  if (candidates.length === 0) return { added: 0, errors };

  const existing = await prisma.job.findMany({
    where: { url: { in: candidates.map((job) => job.url) } },
    select: { url: true },
  });
  const existingUrls = new Set(existing.map((job) => job.url));

  const newJobs = candidates.filter((job) => !existingUrls.has(job.url));

  if (newJobs.length > 0) {
    await prisma.job.createMany({
      data: newJobs,
    });
  }

  return { added: newJobs.length, errors };
}
