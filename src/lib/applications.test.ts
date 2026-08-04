import { describe, expect, it } from "vitest";
import {
  APPLICATION_STATUSES,
  computeJourneyMetrics,
  normalizeApplicationStatus,
} from "@/lib/applications";

describe("application pipeline", () => {
  it("keeps the persisted status names aligned with the pipeline", () => {
    expect(APPLICATION_STATUSES).toContain("tailor_resume");
    expect(normalizeApplicationStatus("tailor_resume")).toBe("tailor_resume");
    expect(normalizeApplicationStatus("resume_review")).toBe("saved");
  });

  it("calculates response metrics only from applications that advanced", () => {
    const now = new Date("2026-08-04T12:00:00.000Z");
    const applications = [
      { status: "saved", createdAt: new Date("2026-08-01T12:00:00.000Z") },
      { status: "applied", createdAt: new Date("2026-08-02T12:00:00.000Z") },
      { status: "interview", createdAt: new Date("2026-08-03T12:00:00.000Z") },
      { status: "rejected", createdAt: new Date("2026-08-03T18:00:00.000Z") },
    ];

    expect(computeJourneyMetrics(applications, now)).toEqual({
      daysSearching: 3,
      responseRate: 67,
      rejectionRate: 50,
    });
  });
});
