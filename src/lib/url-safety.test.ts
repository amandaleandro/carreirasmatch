import { describe, expect, it, vi, beforeEach } from "vitest";

const { lookupMock } = vi.hoisted(() => ({ lookupMock: vi.fn() }));

vi.mock("node:dns/promises", () => ({
  default: { lookup: lookupMock },
  lookup: lookupMock,
}));

import { assertPublicHttpUrl } from "@/lib/url-safety";

describe("assertPublicHttpUrl", () => {
  beforeEach(() => {
    lookupMock.mockReset();
  });

  it("rejects non-http(s) protocols", async () => {
    await expect(assertPublicHttpUrl("file:///etc/passwd")).rejects.toThrow();
    await expect(assertPublicHttpUrl("ftp://example.com")).rejects.toThrow();
  });

  it("rejects malformed URLs", async () => {
    await expect(assertPublicHttpUrl("not a url")).rejects.toThrow();
  });

  it("rejects localhost", async () => {
    await expect(assertPublicHttpUrl("http://localhost:3000/admin")).rejects.toThrow();
    await expect(assertPublicHttpUrl("http://foo.localhost/")).rejects.toThrow();
  });

  it("rejects direct private/loopback/link-local IPs without a DNS lookup", async () => {
    await expect(assertPublicHttpUrl("http://127.0.0.1/")).rejects.toThrow();
    await expect(assertPublicHttpUrl("http://169.254.169.254/latest/meta-data")).rejects.toThrow();
    await expect(assertPublicHttpUrl("http://10.0.0.5/")).rejects.toThrow();
    await expect(assertPublicHttpUrl("http://192.168.1.1/")).rejects.toThrow();
    await expect(assertPublicHttpUrl("http://172.16.0.1/")).rejects.toThrow();
    await expect(assertPublicHttpUrl("http://[::1]/")).rejects.toThrow();
    expect(lookupMock).not.toHaveBeenCalled();
  });

  it("allows a public IP directly without a DNS lookup", async () => {
    await expect(assertPublicHttpUrl("http://8.8.8.8/")).resolves.toBeUndefined();
    expect(lookupMock).not.toHaveBeenCalled();
  });

  it("rejects a hostname that resolves to a private IP", async () => {
    lookupMock.mockResolvedValue([{ address: "10.0.0.1", family: 4 }]);
    await expect(assertPublicHttpUrl("http://internal.example.com/")).rejects.toThrow();
  });

  it("rejects a hostname that resolves to the cloud metadata IP", async () => {
    lookupMock.mockResolvedValue([{ address: "169.254.169.254", family: 4 }]);
    await expect(assertPublicHttpUrl("http://metadata.internal/")).rejects.toThrow();
  });

  it("allows a hostname that resolves only to public IPs", async () => {
    lookupMock.mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);
    await expect(assertPublicHttpUrl("https://example.com/job/123")).resolves.toBeUndefined();
  });

  it("rejects when DNS resolution fails", async () => {
    lookupMock.mockRejectedValue(new Error("ENOTFOUND"));
    await expect(assertPublicHttpUrl("https://this-does-not-resolve.invalid/")).rejects.toThrow();
  });
});
