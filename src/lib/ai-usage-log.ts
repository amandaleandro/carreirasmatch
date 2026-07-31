import { prisma } from "@/lib/prisma";

export type AiUsageLogInput = {
  userId?: string | null;
  featureKey: string;
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  cachedInputTokens?: number;
  estimatedCostUsd?: number | null;
  durationMs: number;
  success: boolean;
  errorType?: string | null;
};

export async function recordAiUsageLog(input: AiUsageLogInput) {
  return prisma.aiUsageLog.create({
    data: {
      userId: input.userId ?? null,
      featureKey: input.featureKey,
      provider: input.provider,
      model: input.model,
      inputTokens: input.inputTokens ?? 0,
      outputTokens: input.outputTokens ?? 0,
      cachedInputTokens: input.cachedInputTokens ?? 0,
      estimatedCostUsd: input.estimatedCostUsd ?? null,
      durationMs: Math.max(0, Math.round(input.durationMs)),
      success: input.success,
      errorType: input.errorType ?? null,
    },
  });
}
