import { describe, expect, it } from "vitest";
import {
  COMMERCIAL_FEATURE_KEYS,
  COMMERCIAL_PLANS,
  getCommercialPlan,
  getFeatureLimit,
} from "@/lib/commercial-plan-catalog";

describe("commercial plan catalog", () => {
  it("uses Free as the safe fallback", () => {
    expect(getCommercialPlan(undefined).key).toBe("free");
    expect(getCommercialPlan("unknown").key).toBe("free");
  });

  it("marks Pro as the highlighted recurring plan", () => {
    expect(COMMERCIAL_PLANS.pro.highlighted).toBe(true);
    expect(COMMERCIAL_PLANS.pro.recurring).toBe(true);
    expect(COMMERCIAL_PLANS.pro.priceCents).toBe(2990);
  });

  it("keeps heavy AI features bounded", () => {
    for (const plan of Object.values(COMMERCIAL_PLANS)) {
      expect(plan.limits[COMMERCIAL_FEATURE_KEYS.analysisFull]).not.toBeNull();
      expect(plan.limits[COMMERCIAL_FEATURE_KEYS.aiSimpleAction]).not.toBeNull();
    }
  });

  it("allows unlimited applications only where the matrix says so", () => {
    expect(getFeatureLimit("free", COMMERCIAL_FEATURE_KEYS.jobApplications)).toBe(5);
    expect(getFeatureLimit("essential", COMMERCIAL_FEATURE_KEYS.jobApplications)).toBeNull();
    expect(getFeatureLimit("pro", COMMERCIAL_FEATURE_KEYS.jobApplications)).toBeNull();
  });

  it("models Sprint as a non-recurring seven-day product", () => {
    expect(COMMERCIAL_PLANS.sprint.recurring).toBe(false);
    expect(COMMERCIAL_PLANS.sprint.durationDays).toBe(7);
  });
});

