import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { response } = await requireAdminApi();
  if (response) return response;

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [usage, aiByFeature, payments, subscriptions] = await Promise.all([
    prisma.featureUsageRecord.findMany({ where: { updatedAt: { gte: since } }, select: { featureKey: true, count: true } }),
    prisma.aiUsageLog.groupBy({ by: ["featureKey"], where: { createdAt: { gte: since } }, _count: { _all: true }, _sum: { inputTokens: true, outputTokens: true, estimatedCostUsd: true }, _avg: { durationMs: true } }),
    prisma.payment.groupBy({ by: ["status"], where: { createdAt: { gte: since } }, _count: { _all: true }, _sum: { amount: true } }),
    prisma.subscription.groupBy({ by: ["planKey", "status"], _count: { _all: true } }),
  ]);

  return NextResponse.json({ since, usage, aiByFeature, payments, subscriptions });
}
