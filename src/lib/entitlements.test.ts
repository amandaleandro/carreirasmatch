import { describe, expect, it, vi, beforeEach } from "vitest";

const { prismaMock, hasFullAccessUserIdMock, isInfluencerUserMock } = vi.hoisted(() => ({
  prismaMock: {
    subscription: { findUnique: vi.fn(), upsert: vi.fn() },
    payment: { findFirst: vi.fn(), update: vi.fn(), count: vi.fn(), create: vi.fn() },
    analysis: { count: vi.fn(), findFirst: vi.fn(), findMany: vi.fn() },
    user: { updateMany: vi.fn() },
    $transaction: vi.fn(),
  },
  hasFullAccessUserIdMock: vi.fn(),
  isInfluencerUserMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/full-access-users", () => ({ hasFullAccessUserId: hasFullAccessUserIdMock }));
vi.mock("@/lib/influencer", () => ({ isInfluencerUser: isInfluencerUserMock }));

import {
  hasActiveSubscriptionAccess,
  hasAnalysisCredit,
  canViewFullDiagnostic,
} from "@/lib/entitlements";

function resetMocks() {
  prismaMock.subscription.findUnique.mockReset();
  prismaMock.subscription.upsert.mockReset();
  prismaMock.payment.findFirst.mockReset();
  prismaMock.payment.update.mockReset();
  prismaMock.payment.count.mockReset();
  prismaMock.payment.create.mockReset();
  prismaMock.analysis.count.mockReset();
  prismaMock.analysis.findFirst.mockReset().mockResolvedValue(null);
  prismaMock.analysis.findMany.mockReset().mockResolvedValue([]);
  prismaMock.user.updateMany.mockReset().mockResolvedValue({ count: 0 });
  prismaMock.$transaction.mockReset().mockImplementation(
    (callback: (tx: typeof prismaMock) => unknown) => callback(prismaMock),
  );
  hasFullAccessUserIdMock.mockReset().mockResolvedValue(false);
  isInfluencerUserMock.mockReset().mockResolvedValue(false);
}

describe("hasActiveSubscriptionAccess", () => {
  beforeEach(resetMocks);

  it("grants access to full-access users without checking subscriptions", async () => {
    hasFullAccessUserIdMock.mockResolvedValue(true);
    expect(await hasActiveSubscriptionAccess("user-1")).toBe(true);
    expect(prismaMock.subscription.findUnique).not.toHaveBeenCalled();
  });

  it("grants access to influencer users without an active subscription", async () => {
    isInfluencerUserMock.mockResolvedValue(true);
    prismaMock.subscription.findUnique.mockResolvedValue(null);
    expect(await hasActiveSubscriptionAccess("user-inf")).toBe(true);
  });

  it("grants access when the subscription is active and not expired", async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 86_400_000),
    });
    expect(await hasActiveSubscriptionAccess("user-2")).toBe(true);
  });

  it("denies access when the subscription is expired", async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({
      status: "active",
      currentPeriodEnd: new Date(Date.now() - 86_400_000),
    });
    expect(await hasActiveSubscriptionAccess("user-3")).toBe(false);
  });

  it("denies access when there is no subscription", async () => {
    prismaMock.subscription.findUnique.mockResolvedValue(null);
    expect(await hasActiveSubscriptionAccess("user-4")).toBe(false);
  });

  it("denies access when the subscription status is not active", async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({
      status: "canceled",
      currentPeriodEnd: new Date(Date.now() + 86_400_000),
    });
    expect(await hasActiveSubscriptionAccess("user-5")).toBe(false);
  });
});

describe("hasAnalysisCredit", () => {
  beforeEach(resetMocks);

  it("is always free to create an analysis", async () => {
    expect(await hasAnalysisCredit()).toBe(true);
  });
});

describe("canViewFullDiagnostic", () => {
  beforeEach(resetMocks);

  it("unlocks for full-access users", async () => {
    hasFullAccessUserIdMock.mockResolvedValue(true);
    expect(await canViewFullDiagnostic("user-1", "analysis-1")).toBe(true);
  });

  it("unlocks for active subscribers", async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 86_400_000),
    });
    expect(await canViewFullDiagnostic("user-2", "analysis-2")).toBe(true);
  });

  it("unlocks when there is a paid diagnostic payment for this analysis", async () => {
    prismaMock.subscription.findUnique.mockResolvedValue(null);
    prismaMock.payment.findFirst.mockResolvedValue({ id: "pay-1" });
    expect(await canViewFullDiagnostic("user-3", "analysis-3")).toBe(true);
  });

  it("stays locked without subscription or diagnostic payment", async () => {
    prismaMock.subscription.findUnique.mockResolvedValue(null);
    prismaMock.payment.findFirst.mockResolvedValue(null);
    expect(await canViewFullDiagnostic("user-4", "analysis-4")).toBe(false);
  });

  it("unlocks the user's first analysis for free", async () => {
    prismaMock.subscription.findUnique.mockResolvedValue(null);
    prismaMock.payment.findFirst.mockResolvedValue(null);
    prismaMock.analysis.findFirst.mockResolvedValue({ id: "analysis-first" });

    expect(await canViewFullDiagnostic("user-5", "analysis-first")).toBe(true);
    expect(prismaMock.user.updateMany).not.toHaveBeenCalled();
  });

  it("consumes one referral credit and persists the analysis unlock", async () => {
    prismaMock.subscription.findUnique.mockResolvedValue(null);
    prismaMock.payment.findFirst.mockResolvedValue(null);
    prismaMock.user.updateMany.mockResolvedValue({ count: 1 });

    expect(await canViewFullDiagnostic("user-6", "analysis-6")).toBe(true);
    expect(prismaMock.user.updateMany).toHaveBeenCalledWith({
      where: { id: "user-6", unlockedFullDiagnosticCredits: { gt: 0 } },
      data: { unlockedFullDiagnosticCredits: { decrement: 1 } },
    });
    expect(prismaMock.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-6",
        kind: "diagnostic",
        amount: 0,
        status: "paid",
        analysisId: "analysis-6",
        source: "referral",
      }),
    });
  });
});
