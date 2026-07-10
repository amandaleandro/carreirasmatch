import { describe, expect, it, vi, afterEach } from "vitest";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the limit", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit(key, { limit: 3, windowMs: 1000 }).allowed).toBe(true);
    }
  });

  it("blocks requests past the limit within the window", () => {
    const key = `test-${Math.random()}`;
    checkRateLimit(key, { limit: 2, windowMs: 1000 });
    checkRateLimit(key, { limit: 2, windowMs: 1000 });
    const result = checkRateLimit(key, { limit: 2, windowMs: 1000 });
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets the count after the window elapses", () => {
    vi.useFakeTimers();
    const key = `test-${Math.random()}`;
    const opts = { limit: 1, windowMs: 1000 };
    expect(checkRateLimit(key, opts).allowed).toBe(true);
    expect(checkRateLimit(key, opts).allowed).toBe(false);

    vi.advanceTimersByTime(1001);

    expect(checkRateLimit(key, opts).allowed).toBe(true);
  });

  it("tracks separate keys independently", () => {
    const opts = { limit: 1, windowMs: 1000 };
    const keyA = `test-a-${Math.random()}`;
    const keyB = `test-b-${Math.random()}`;
    expect(checkRateLimit(keyA, opts).allowed).toBe(true);
    expect(checkRateLimit(keyB, opts).allowed).toBe(true);
    expect(checkRateLimit(keyA, opts).allowed).toBe(false);
  });
});

describe("getClientIp", () => {
  it("prefers the first entry of x-forwarded-for", () => {
    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("https://example.com", {
      headers: { "x-real-ip": "9.9.9.9" },
    });
    expect(getClientIp(req)).toBe("9.9.9.9");
  });

  it("falls back to unknown when no IP headers are present", () => {
    const req = new Request("https://example.com");
    expect(getClientIp(req)).toBe("unknown");
  });
});
