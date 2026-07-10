import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { isValidMercadoPagoSignature } from "@/lib/webhook-secret";

const SECRET = "my-secret";
const DATA_ID = "123456";
const REQUEST_ID = "req-abc";
const TS = "1700000000000";

function buildSignature(secret: string, dataId: string, requestId: string, ts: string): string {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const hash = createHmac("sha256", secret).update(manifest).digest("hex");
  return `ts=${ts},v1=${hash}`;
}

describe("isValidMercadoPagoSignature", () => {
  it("accepts a correctly signed request", () => {
    const xSignature = buildSignature(SECRET, DATA_ID, REQUEST_ID, TS);
    expect(
      isValidMercadoPagoSignature({ xSignature, xRequestId: REQUEST_ID, dataId: DATA_ID, secret: SECRET })
    ).toBe(true);
  });

  it("rejects a signature built with the wrong secret", () => {
    const xSignature = buildSignature("other-secret", DATA_ID, REQUEST_ID, TS);
    expect(
      isValidMercadoPagoSignature({ xSignature, xRequestId: REQUEST_ID, dataId: DATA_ID, secret: SECRET })
    ).toBe(false);
  });

  it("rejects when dataId doesn't match the signed manifest", () => {
    const xSignature = buildSignature(SECRET, DATA_ID, REQUEST_ID, TS);
    expect(
      isValidMercadoPagoSignature({ xSignature, xRequestId: REQUEST_ID, dataId: "999", secret: SECRET })
    ).toBe(false);
  });

  it("rejects when required inputs are missing", () => {
    expect(
      isValidMercadoPagoSignature({ xSignature: null, xRequestId: REQUEST_ID, dataId: DATA_ID, secret: SECRET })
    ).toBe(false);
    expect(
      isValidMercadoPagoSignature({ xSignature: "ts=1,v1=abc", xRequestId: null, dataId: DATA_ID, secret: SECRET })
    ).toBe(false);
    expect(
      isValidMercadoPagoSignature({ xSignature: "ts=1,v1=abc", xRequestId: REQUEST_ID, dataId: null, secret: SECRET })
    ).toBe(false);
    expect(
      isValidMercadoPagoSignature({
        xSignature: "ts=1,v1=abc",
        xRequestId: REQUEST_ID,
        dataId: DATA_ID,
        secret: undefined,
      })
    ).toBe(false);
  });

  it("rejects a malformed signature header", () => {
    expect(
      isValidMercadoPagoSignature({ xSignature: "garbage", xRequestId: REQUEST_ID, dataId: DATA_ID, secret: SECRET })
    ).toBe(false);
  });
});
