import { describe, expect, it } from "vitest";
import { hasToolAccess } from "@/lib/tool-access";

describe("hasToolAccess", () => {
  it("grants access when the segment is listed for the tool", () => {
    expect(hasToolAccess("student", "/tools/vocation-test")).toBe(true);
  });

  it("denies access when the segment is not listed for the tool", () => {
    expect(hasToolAccess("apprentice", "/tools/vocation-test")).toBe(false);
  });

  it("denies access when there is no segment", () => {
    expect(hasToolAccess(null, "/tools/vocation-test")).toBe(false);
    expect(hasToolAccess(undefined, "/tools/compare-jobs")).toBe(false);
  });

  it("normalizes legacy segment values before checking access", () => {
    // "reemployment" normalizes to "career_pro", which has access to compare-jobs
    expect(hasToolAccess("reemployment", "/tools/compare-jobs")).toBe(true);
  });

  it("allows any segment when the href is not in the catalog", () => {
    expect(hasToolAccess("student", "/tools/unknown-tool")).toBe(true);
    expect(hasToolAccess(null, "/tools/unknown-tool")).toBe(true);
  });
});
