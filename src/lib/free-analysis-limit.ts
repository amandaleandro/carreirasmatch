import { prisma } from "@/lib/prisma";

export const FREE_ANALYSIS_DAILY_LIMIT = 3;
export const FREE_ANALYSIS_MONTHLY_LIMIT = 10;

const SAO_PAULO_UTC_OFFSET_HOURS = 3;

export type FreeAnalysisAllowance = {
  allowed: boolean;
  dailyUsed: number;
  monthlyUsed: number;
  reason: "daily" | "monthly" | null;
  retryAfterSeconds: number;
};

/**
 * São Paulo está em UTC-3 e não adota horário de verão. Retorna os inícios do
 * dia e do mês local como instantes UTC para consultas Prisma.
 */
export function saoPauloPeriodBounds(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  const year = value("year");
  const month = value("month");
  const day = value("day");

  const dayStart = new Date(
    Date.UTC(year, month - 1, day, SAO_PAULO_UTC_OFFSET_HOURS)
  );
  const monthStart = new Date(
    Date.UTC(year, month - 1, 1, SAO_PAULO_UTC_OFFSET_HOURS)
  );
  const nextDayStart = new Date(
    Date.UTC(year, month - 1, day + 1, SAO_PAULO_UTC_OFFSET_HOURS)
  );
  const nextMonthStart = new Date(
    Date.UTC(year, month, 1, SAO_PAULO_UTC_OFFSET_HOURS)
  );

  return { dayStart, monthStart, nextDayStart, nextMonthStart };
}

export async function getFreeAnalysisAllowance(
  userId: string,
  now = new Date()
): Promise<FreeAnalysisAllowance> {
  const { dayStart, monthStart, nextDayStart, nextMonthStart } =
    saoPauloPeriodBounds(now);

  const [dailyUsed, monthlyUsed] = await Promise.all([
    prisma.analysis.count({
      where: { resume: { userId }, createdAt: { gte: dayStart } },
    }),
    prisma.analysis.count({
      where: { resume: { userId }, createdAt: { gte: monthStart } },
    }),
  ]);

  const dailyBlocked = dailyUsed >= FREE_ANALYSIS_DAILY_LIMIT;
  const monthlyBlocked = monthlyUsed >= FREE_ANALYSIS_MONTHLY_LIMIT;
  const resetAt = monthlyBlocked ? nextMonthStart : nextDayStart;

  return {
    allowed: !dailyBlocked && !monthlyBlocked,
    dailyUsed,
    monthlyUsed,
    reason: monthlyBlocked ? "monthly" : dailyBlocked ? "daily" : null,
    retryAfterSeconds:
      dailyBlocked || monthlyBlocked
        ? Math.max(1, Math.ceil((resetAt.getTime() - now.getTime()) / 1000))
        : 0,
  };
}
