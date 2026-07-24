import { describe, it, expect } from "vitest";
import { HIGH_SCHOOL_SUBJECTS, getSubjectBySlug } from "./ensino-medio";

describe("Ensino Médio Module Helpers", () => {
  it("should have metadata for all main subjects", () => {
    expect(HIGH_SCHOOL_SUBJECTS.length).toBeGreaterThanOrEqual(8);
    const slugs = HIGH_SCHOOL_SUBJECTS.map((s) => s.slug);
    expect(slugs).toContain("matematica");
    expect(slugs).toContain("biologia");
    expect(slugs).toContain("portugues");
  });

  it("should fetch subject by slug correctly", () => {
    const math = getSubjectBySlug("matematica");
    expect(math).toBeDefined();
    expect(math?.name).toBe("Matemática");
    expect(math?.collegeCourses.length).toBeGreaterThan(0);
    expect(math?.technicalCourses.length).toBeGreaterThan(0);
  });

  it("should return undefined for unknown subject slug", () => {
    const unknown = getSubjectBySlug("disciplina-inexistente");
    expect(unknown).toBeUndefined();
  });
});
