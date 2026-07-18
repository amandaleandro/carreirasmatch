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

  it("grants concurso and oab access to their study tools", () => {
    expect(hasToolAccess("concurseiro", "/tools/concurso/plano-de-estudo")).toBe(true);
    expect(hasToolAccess("oab", "/tools/concurso/simulado")).toBe(true);
    expect(hasToolAccess("oab", "/tools/oab/segunda-fase")).toBe(true);
  });

  it("scopes segment-specific study tools", () => {
    // nota-de-corte is concurso-only; the OAB 2ª fase is oab-only
    expect(hasToolAccess("oab", "/tools/concurso/nota-de-corte")).toBe(false);
    expect(hasToolAccess("concurseiro", "/tools/oab/segunda-fase")).toBe(false);
    // a career segment has access to neither
    expect(hasToolAccess("career_pro", "/tools/concurso/plano-de-estudo")).toBe(false);
  });

  it("allows any segment when the href is not in the catalog", () => {
    expect(hasToolAccess("student", "/tools/unknown-tool")).toBe(true);
    expect(hasToolAccess(null, "/tools/unknown-tool")).toBe(true);
  });
});
