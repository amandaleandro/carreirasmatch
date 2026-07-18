import { describe, expect, it, vi, beforeEach } from "vitest";

const { prismaMock, hasFullAccessUserIdMock, isInfluencerUserMock } = vi.hoisted(() => ({
  prismaMock: {
    subscription: { findUnique: vi.fn(), upsert: vi.fn() },
    payment: { findFirst: vi.fn(), update: vi.fn(), count: vi.fn() },
    analysis: { count: vi.fn() },
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
  prismaMock.analysis.count.mockReset();
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
});
