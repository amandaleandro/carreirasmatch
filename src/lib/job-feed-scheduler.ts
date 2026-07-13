import { getSetting, setSetting } from "@/lib/app-settings";
import { fetchNewJobsFromAllSources } from "@/lib/job-sources";
import type { JobSearchTerms } from "@/lib/job-sources/types";

const RUNS_SETTING_KEY = "job-feed:runs";
const CURSOR_SETTING_KEY = "job-feed:query_cursor";
const TICK_INTERVAL_MS = 15 * 60 * 1000;
const INITIAL_DELAY_MS = 45 * 1000;
const TIME_ZONE = "America/Sao_Paulo";
const DEFAULT_RUN_TIMES = ["08:00", "14:00", "20:00"];
const DEFAULT_QUERIES = [
  "Desenvolvedor Backend|Backend Developer|Node.js,Python,SQL",
  "Desenvolvedor Frontend|Frontend Developer|React,TypeScript,JavaScript",
  "Analista de Dados|Data Analyst|SQL,Python,Power BI",
  "Desenvolvedor Full Stack|Full Stack Developer|React,Node.js,TypeScript",
  "Estágio em Tecnologia|Technology Intern|estágio,trainee,tecnologia",
];

type RunLedger = {
  date: string;
  slots: string[];
};

function saoPauloParts(date = new Date()): { date: string; minutes: number } {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

function parseTimeToMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return hour * 60 + minute;
}

function runTimes(): string[] {
  const raw = process.env.JOB_FEED_RUN_TIMES;
  const values = raw ? raw.split(",").map((value) => value.trim()).filter(Boolean) : DEFAULT_RUN_TIMES;
  return values.filter((value) => parseTimeToMinutes(value) !== null).slice(0, 12);
}

function parseLedger(raw: string | null, date: string): RunLedger {
  if (!raw) return { date, slots: [] };

  try {
    const parsed = JSON.parse(raw) as Partial<RunLedger>;
    if (parsed.date === date && Array.isArray(parsed.slots)) {
      return { date, slots: parsed.slots.filter((slot): slot is string => typeof slot === "string") };
    }
  } catch {
    // Invalid stored state should not stop the scheduler.
  }

  return { date, slots: [] };
}

function dueSlot(times: string[], ranSlots: Set<string>, nowMinutes: number): string | null {
  return times.find((time) => {
    const minutes = parseTimeToMinutes(time);
    return minutes !== null && nowMinutes >= minutes && !ranSlots.has(time);
  }) ?? null;
}

function configuredQueries(): string[] {
  const raw = process.env.JOB_FEED_QUERIES;
  return raw ? raw.split(";").map((value) => value.trim()).filter(Boolean) : DEFAULT_QUERIES;
}

async function nextSearchTerms(): Promise<JobSearchTerms> {
  const queries = configuredQueries();
  const stored = await getSetting(CURSOR_SETTING_KEY);
  const cursor = stored ? Number.parseInt(stored, 10) : 0;
  const safeCursor = Number.isFinite(cursor) && cursor >= 0 ? cursor : 0;
  const raw = queries[safeCursor % queries.length] ?? DEFAULT_QUERIES[0];
  const [titlePt, titleEn, keywordsRaw] = raw.split("|").map((value) => value?.trim() ?? "");

  await setSetting(CURSOR_SETTING_KEY, String((safeCursor + 1) % queries.length));

  return {
    titlePt: titlePt || "Desenvolvedor",
    titleEn: titleEn || titlePt || "Developer",
    keywords: keywordsRaw ? keywordsRaw.split(",").map((value) => value.trim()).filter(Boolean) : [],
  };
}

let running = false;

export async function runJobFeedTick(): Promise<void> {
  if (running) return;

  const { date, minutes } = saoPauloParts();
  const times = runTimes();
  if (times.length === 0) return;

  const ledger = parseLedger(await getSetting(RUNS_SETTING_KEY), date);
  const slot = dueSlot(times, new Set(ledger.slots), minutes);
  if (!slot) return;

  running = true;
  try {
    const searchTerms = await nextSearchTerms();
    const result = await fetchNewJobsFromAllSources(searchTerms, {
      userIp: "127.0.0.1",
      userAgent: "CarreirasMatchJobFeedScheduler/1.0",
    });

    await setSetting(RUNS_SETTING_KEY, JSON.stringify({ date, slots: [...ledger.slots, slot] }));
    console.log(
      `job-feed-scheduler: slot=${slot} added=${result.added} errors=${result.errors.length}`
    );
  } catch (error) {
    console.error("job-feed-scheduler: failed to fetch jobs", error);
  } finally {
    running = false;
  }
}

let started = false;

export function startJobFeedScheduler(): void {
  if (started) return;
  started = true;

  setTimeout(() => {
    void runJobFeedTick();
    setInterval(() => void runJobFeedTick(), TICK_INTERVAL_MS);
  }, INITIAL_DELAY_MS);
}
