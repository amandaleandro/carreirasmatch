import { describe, expect, it } from "vitest";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";
import { decideFeatureAccess, planHasFeature } from "@/lib/commercial-plan-access";

describe("commercial plan access", () => {
  it("allows usage below a finite limit", () => {
    expect(decideFeatureAccess("pro", COMMERCIAL_FEATURE_KEYS.analysisFull, 4, 2)).toEqual({
      allowed: true,
      limit: 20,
      used: 4,
      requested: 2,
      remaining: 16,
      reason: "allowed",
    });
  });

  it("blocks a request that would cross the limit", () => {
    const decision = decideFeatureAccess("free", COMMERCIAL_FEATURE_KEYS.analysisFull, 0);
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("limit_reached");
    expect(decision.remaining).toBe(0);
  });

  it("rejects zero or negative quantities", () => {
    expect(decideFeatureAccess("pro", COMMERCIAL_FEATURE_KEYS.analysisFull, 0, 0).reason).toBe("invalid_quantity");
    expect(decideFeatureAccess("pro", COMMERCIAL_FEATURE_KEYS.analysisFull, 0, -1).allowed).toBe(false);
  });

  it("keeps unlimited application access unlimited", () => {
    const decision = decideFeatureAccess("pro", COMMERCIAL_FEATURE_KEYS.jobApplications, 9999, 100);
    expect(decision.allowed).toBe(true);
    expect(decision.limit).toBeNull();
    expect(decision.remaining).toBeNull();
  });

  it("reports whether a plan exposes a feature", () => {
    expect(planHasFeature("free", COMMERCIAL_FEATURE_KEYS.careerGrowthPlan)).toBe(false);
    expect(planHasFeature("essential", COMMERCIAL_FEATURE_KEYS.careerGrowthPlan)).toBe(true);
  });
});

