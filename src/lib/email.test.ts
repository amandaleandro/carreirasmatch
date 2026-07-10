import { describe, expect, it } from "vitest";
import { isValidEmail, normalizeEmail } from "@/lib/email";

describe("normalizeEmail", () => {
  it("trims whitespace and lowercases", () => {
    expect(normalizeEmail("  User@Example.COM  ")).toBe("user@example.com");
  });

  it("returns empty string for non-string input", () => {
    expect(normalizeEmail(undefined)).toBe("");
    expect(normalizeEmail(null)).toBe("");
    expect(normalizeEmail(123)).toBe("");
  });
});

describe("isValidEmail", () => {
  it("accepts well-formed emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("first.last+tag@sub.example.co")).toBe(true);
  });

  it("rejects malformed emails", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("missing-domain@")).toBe(false);
    expect(isValidEmail("@missing-local.com")).toBe(false);
    expect(isValidEmail("no-tld@example")).toBe(false);
    expect(isValidEmail("has spaces@example.com")).toBe(false);
  });
});
