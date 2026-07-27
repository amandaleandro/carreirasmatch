import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Token assinado (não é JWT, só HMAC) que identifica o usuário no clique do
 * e-mail de NPS sem exigir login: `<userId>.<hmac>`. Sem isso, qualquer um
 * poderia votar em nome de outro usuário só adivinhando o id.
 */
function secret() {
  return process.env.NEXTAUTH_SECRET ?? "dev-nps-secret";
}

export function createNpsToken(userId: string): string {
  const hmac = createHmac("sha256", secret()).update(userId).digest("hex");
  return `${userId}.${hmac}`;
}

export function verifyNpsToken(token: string): string | null {
  const [userId, hmac] = token.split(".");
  if (!userId || !hmac) return null;
  const expected = createHmac("sha256", secret()).update(userId).digest("hex");
  const providedBuf = Buffer.from(hmac);
  const expectedBuf = Buffer.from(expected);
  if (providedBuf.length !== expectedBuf.length) return null;
  return timingSafeEqual(providedBuf, expectedBuf) ? userId : null;
}
