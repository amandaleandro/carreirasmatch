import { VOCATION_AREAS, VocationAreaConfig } from "@/lib/vocation-areas";
import { generateAreaOfTheDayExplanation, AreaOfTheDayResult } from "@/lib/tools";

const explanationCache = new Map<string, Promise<AreaOfTheDayResult>>();

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getAreaOfTheDay(): VocationAreaConfig {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return VOCATION_AREAS[dayIndex % VOCATION_AREAS.length];
}

export async function getAreaOfTheDayExplanation(): Promise<{
  area: VocationAreaConfig;
  explanation: AreaOfTheDayResult;
}> {
  const area = getAreaOfTheDay();
  const cacheKey = `${todayKey()}:${area.slug}`;

  let pending = explanationCache.get(cacheKey);
  if (!pending) {
    pending = generateAreaOfTheDayExplanation(area);
    explanationCache.set(cacheKey, pending);
  }

  try {
    const explanation = await pending;
    return { area, explanation };
  } catch (error) {
    explanationCache.delete(cacheKey);
    throw error;
  }
}
