import { FetchedJob } from "./types";
import { fetchJobFromUrl } from "@/lib/scrape-job";
import { stripHtmlFromText } from "@/lib/job-snippet";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const DEFAULT_QUERIES = [
  'site:gupy.io/job "remoto" "brasil"',
  'site:gupy.io/job "estágio" brasil',
  'site:gupy.io/job "jovem aprendiz" brasil',
  'site:gupy.io/job "analista" "são paulo"',
  'site:job-boards.greenhouse.io OR site:boards.greenhouse.io "remoto"',
  'site:jobs.lever.co "remoto" OR "brasil"',
  'site:vagas.solides.com.br "remoto"',
  'site:workable.com "remoto" "brasil"',
  'site:ashbyhq.com "remoto" "brasil"',
  'site:jobs.smartrecruiters.com "brasil"',
];

async function searchWebForJobUrls(query: string): Promise<string[]> {
  try {
    const params = new URLSearchParams({ q: query });
    const res = await fetch("https://lite.duckduckgo.com/lite/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": USER_AGENT,
      },
      body: params.toString(),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return [];

    const html = await res.text();
    const urls: string[] = [];
    const regex = /href="(https?:\/\/[^"]+)"/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const link = match[1];
      if (
        link.includes("gupy.io/job") ||
        link.includes("greenhouse.io") ||
        link.includes("lever.co") ||
        link.includes("solides.jobs") ||
        link.includes("workable.com") ||
        link.includes("ashbyhq.com") ||
        link.includes("smartrecruiters.com")
      ) {
        urls.push(link.split("?")[0]);
      }
    }
    return urls;
  } catch {
    return [];
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    results.push(...(await Promise.all(batch.map(fn))));
  }
  return results;
}

export async function fetchWebSearchJobs(keywords?: string[]): Promise<FetchedJob[]> {
  const queries =
    keywords && keywords.length > 0
      ? keywords.slice(0, 3).map((kw) => `site:gupy.io/job OR site:greenhouse.io OR site:lever.co "${kw}" brasil`)
      : DEFAULT_QUERIES;

  const urlSets = await Promise.allSettled(queries.map(searchWebForJobUrls));
  const jobUrls = new Set<string>();

  for (const result of urlSets) {
    if (result.status === "fulfilled") {
      for (const url of result.value) jobUrls.add(url);
    }
  }

  const urlsToFetch = [...jobUrls].slice(0, 40);
  const scrapedJobs = await mapWithConcurrency(urlsToFetch, 5, async (url) => {
    const res = await fetchJobFromUrl(url);
    if ("error" in res) return null;
    const job: FetchedJob = {
      url,
      jobTitle: res.jobTitle,
      jobText: stripHtmlFromText(res.jobText),
      source: "websearch",
      location: res.location,
    };
    return job;
  });

  return scrapedJobs.filter((j): j is FetchedJob => j !== null);
}
