import { beforeEach, describe, expect, it, vi } from "vitest";

const { countMock } = vi.hoisted(() => ({ countMock: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: { analysis: { count: countMock } },
}));

import {
  FREE_ANALYSIS_DAILY_LIMIT,
  FREE_ANALYSIS_MONTHLY_LIMIT,
  getFreeAnalysisAllowance,
  saoPauloPeriodBounds,
} from "@/lib/free-analysis-limit";

describe("saoPauloPeriodBounds", () => {
  it("calcula a virada do dia e do mês em UTC-3", () => {
    const bounds = saoPauloPeriodBounds(new Date("2026-07-18T15:00:00Z"));
    expect(bounds.dayStart.toISOString()).toBe("2026-07-18T03:00:00.000Z");
    expect(bounds.monthStart.toISOString()).toBe("2026-07-01T03:00:00.000Z");
    expect(bounds.nextDayStart.toISOString()).toBe("2026-07-19T03:00:00.000Z");
    expect(bounds.nextMonthStart.toISOString()).toBe("2026-08-01T03:00:00.000Z");
  });
});

describe("getFreeAnalysisAllowance", () => {
  beforeEach(() => countMock.mockReset());

  it("permite quando os dois limites têm saldo", async () => {
    countMock.mockResolvedValueOnce(2).mockResolvedValueOnce(9);
    const result = await getFreeAnalysisAllowance(
      "user-1",
      new Date("2026-07-18T15:00:00Z")
    );
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeNull();
  });

  it("bloqueia ao atingir o limite diário", async () => {
    countMock
      .mockResolvedValueOnce(FREE_ANALYSIS_DAILY_LIMIT)
      .mockResolvedValueOnce(5);
    const result = await getFreeAnalysisAllowance(
      "user-1",
      new Date("2026-07-18T15:00:00Z")
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("daily");
    expect(result.retryAfterSeconds).toBe(43_200);
  });

  it("prioriza o bloqueio mensal quando ambos foram atingidos", async () => {
    countMock
      .mockResolvedValueOnce(FREE_ANALYSIS_DAILY_LIMIT)
      .mockResolvedValueOnce(FREE_ANALYSIS_MONTHLY_LIMIT);
    const result = await getFreeAnalysisAllowance(
      "user-1",
      new Date("2026-07-18T15:00:00Z")
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("monthly");
    expect(result.retryAfterSeconds).toBeGreaterThan(43_200);
  });
});
