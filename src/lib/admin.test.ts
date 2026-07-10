import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/full-access-users", () => ({ hasFullAccessEmail: vi.fn(() => false) }));

import { isAdminEmail } from "@/lib/admin";
import { hasFullAccessEmail } from "@/lib/full-access-users";

describe("isAdminEmail", () => {
  const originalAdminEmails = process.env.ADMIN_EMAILS;

  beforeEach(() => {
    vi.mocked(hasFullAccessEmail).mockReturnValue(false);
    process.env.ADMIN_EMAILS = "admin@example.com, Other@Example.com";
  });

  afterEach(() => {
    process.env.ADMIN_EMAILS = originalAdminEmails;
  });

  it("returns false for null/undefined email", () => {
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
  });

  it("matches emails listed in ADMIN_EMAILS case-insensitively", () => {
    expect(isAdminEmail("admin@example.com")).toBe(true);
    expect(isAdminEmail("OTHER@example.com")).toBe(true);
  });

  it("returns false for emails not in the admin list", () => {
    expect(isAdminEmail("random@example.com")).toBe(false);
  });

  it("returns true when the email has full access, regardless of ADMIN_EMAILS", () => {
    vi.mocked(hasFullAccessEmail).mockReturnValue(true);
    expect(isAdminEmail("owner@example.com")).toBe(true);
  });

  it("handles an unset ADMIN_EMAILS env var", () => {
    delete process.env.ADMIN_EMAILS;
    expect(isAdminEmail("admin@example.com")).toBe(false);
  });
});
