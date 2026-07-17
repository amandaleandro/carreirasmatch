import { getSetting, setSetting } from "@/lib/app-settings";
import { syncAllExternalSources } from "@/lib/external-source-sync";

const RUNS_SETTING_KEY = "external-sources:runs";
const TICK_INTERVAL_MS = 15 * 60 * 1000;
const INITIAL_DELAY_MS = 60 * 1000;
const TIME_ZONE = "America/Sao_Paulo";
const DEFAULT_RUN_TIMES = ["08:00", "14:00", "20:00"];

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
  const configured = process.env.EXTERNAL_SOURCES_RUN_TIMES;
  const values = configured
    ? configured.split(",").map((value) => value.trim()).filter(Boolean)
    : DEFAULT_RUN_TIMES;
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
    // Um estado inválido será substituído na próxima execução bem sucedida.
  }
  return { date, slots: [] };
}

function dueSlot(times: string[], completedSlots: Set<string>, nowMinutes: number): string | null {
  return times.find((time) => {
    const minutes = parseTimeToMinutes(time);
    return minutes !== null && nowMinutes >= minutes && !completedSlots.has(time);
  }) ?? null;
}

let running = false;

export async function runExternalSourceTick(): Promise<void> {
  if (running) return;
  const { date, minutes } = saoPauloParts();
  const times = runTimes();
  if (times.length === 0) return;

  const ledger = parseLedger(await getSetting(RUNS_SETTING_KEY), date);
  const slot = dueSlot(times, new Set(ledger.slots), minutes);
  if (!slot) return;

  running = true;
  try {
    const result = await syncAllExternalSources();
    if (result.errors.length > 0) {
      console.error(`external-source-scheduler: slot=${slot} errors=${result.errors.join(" | ")}`);
      return;
    }
    await setSetting(RUNS_SETTING_KEY, JSON.stringify({ date, slots: [...ledger.slots, slot] }));
    console.log(
      `external-source-scheduler: slot=${slot} courses=${result.courses} bulletins=${result.bulletins} opportunities=${result.opportunities}`,
    );
  } catch (error) {
    console.error("external-source-scheduler: synchronization failed", error);
  } finally {
    running = false;
  }
}

let started = false;

export function startExternalSourceScheduler(): void {
  if (started) return;
  started = true;
  setTimeout(() => {
    void runExternalSourceTick();
    setInterval(() => void runExternalSourceTick(), TICK_INTERVAL_MS);
  }, INITIAL_DELAY_MS);
}
