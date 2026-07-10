import { describe, expect, it, vi, beforeEach } from "vitest";

const { findUniqueMock } = vi.hoisted(() => ({ findUniqueMock: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: findUniqueMock } },
}));

import { hasFullAccessEmail, hasFullAccessUserId } from "@/lib/full-access-users";

describe("hasFullAccessEmail", () => {
  it("matches the known full-access email case-insensitively and trims whitespace", () => {
    expect(hasFullAccessEmail("amandaleandrosoares@gmail.com")).toBe(true);
    expect(hasFullAccessEmail("  AmandaLeandroSoares@Gmail.com  ")).toBe(true);
  });

  it("returns false for other emails", () => {
    expect(hasFullAccessEmail("someone-else@example.com")).toBe(false);
    expect(hasFullAccessEmail(null)).toBe(false);
    expect(hasFullAccessEmail(undefined)).toBe(false);
  });
});

describe("hasFullAccessUserId", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
  });

  it("returns false without querying the database when userId is missing", async () => {
    expect(await hasFullAccessUserId(null)).toBe(false);
    expect(await hasFullAccessUserId(undefined)).toBe(false);
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("returns true when the user's email has full access", async () => {
    findUniqueMock.mockResolvedValue({ email: "amandaleandrosoares@gmail.com" });
    expect(await hasFullAccessUserId("user-1")).toBe(true);
  });

  it("returns false when the user's email does not have full access", async () => {
    findUniqueMock.mockResolvedValue({ email: "other@example.com" });
    expect(await hasFullAccessUserId("user-2")).toBe(false);
  });

  it("returns false when the user is not found", async () => {
    findUniqueMock.mockResolvedValue(null);
    expect(await hasFullAccessUserId("missing-user")).toBe(false);
  });
});
