import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Valida o header `x-signature` do webhook do Mercado Pago.
 * Formato: "ts=<timestamp>,v1=<hmac_sha256>", calculado sobre o manifest
 * "id:<dataId>;request-id:<requestId>;ts:<ts>;" com o secret configurado no painel.
 * https://www.mercadopago.com.br/developers/pt/docs/checkout-api/webhooks/webhooks#editor_5
 */
export function isValidMercadoPagoSignature(input: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  secret: string | undefined;
}): boolean {
  const { xSignature, xRequestId, dataId, secret } = input;
  if (!xSignature || !xRequestId || !dataId || !secret) return false;

  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key?.trim(), value?.trim()];
    })
  );
  const ts = parts.ts;
  const providedHash = parts.v1;
  if (!ts || !providedHash) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expectedHash = createHmac("sha256", secret).update(manifest).digest("hex");

  const providedBuf = Buffer.from(providedHash);
  const expectedBuf = Buffer.from(expectedHash);
  if (providedBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(providedBuf, expectedBuf);
}
