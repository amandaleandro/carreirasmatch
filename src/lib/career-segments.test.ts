import { describe, expect, it } from "vitest";
import { isCareerSegment, normalizeCareerSegment } from "@/lib/career-segments";

describe("isCareerSegment", () => {
  it("accepts known segments", () => {
    expect(isCareerSegment("student")).toBe(true);
    expect(isCareerSegment("career_pro")).toBe(true);
  });

  it("rejects unknown values", () => {
    expect(isCareerSegment("not_a_segment")).toBe(false);
    expect(isCareerSegment("")).toBe(false);
  });
});

describe("normalizeCareerSegment", () => {
  it("passes through valid segments unchanged", () => {
    expect(normalizeCareerSegment("student")).toBe("student");
  });

  it("maps legacy segment values to their current equivalent", () => {
    expect(normalizeCareerSegment("reemployment")).toBe("career_pro");
    expect(normalizeCareerSegment("better_job")).toBe("career_pro");
    expect(normalizeCareerSegment("growth")).toBe("career_pro");
  });

  it("returns null for empty or unrecognized values", () => {
    expect(normalizeCareerSegment(null)).toBeNull();
    expect(normalizeCareerSegment(undefined)).toBeNull();
    expect(normalizeCareerSegment("")).toBeNull();
    expect(normalizeCareerSegment("totally_unknown")).toBeNull();
  });
});
