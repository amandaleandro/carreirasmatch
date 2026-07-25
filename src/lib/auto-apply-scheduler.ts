import { runAutoApplyBatch } from "@/lib/auto-apply";

const INITIAL_DELAY_MS = 60 * 1000;
const INTERVAL_MS = 30 * 60 * 1000;

let started = false;
let running = false;

export async function runAutoApplyTick(): Promise<void> {
  if (running) return;
  running = true;
  try {
    const result = await runAutoApplyBatch();
    if (result.queued || result.applied || result.failed || result.unsupported) {
      console.log(
        `auto-apply: queued=${result.queued} applied=${result.applied} unsupported=${result.unsupported} failed=${result.failed}`,
      );
    }
  } catch (error) {
    console.error("auto-apply: falha no processamento do lote", error);
  } finally {
    running = false;
  }
}

export function startAutoApplyScheduler(): void {
  if (started) return;
  started = true;
  setTimeout(() => {
    void runAutoApplyTick();
    setInterval(() => void runAutoApplyTick(), INTERVAL_MS);
  }, INITIAL_DELAY_MS);
}
