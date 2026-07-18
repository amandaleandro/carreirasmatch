import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/email";

export class CouponOwnerError extends Error {}

/**
 * Resolve o e-mail do influenciador dono do cupom para um `ownerUserId`.
 * - `undefined` (campo não enviado): retorna `undefined` (não mexe no dono).
 * - "" ou null: retorna `null` (desvincula o dono).
 * - e-mail: exige um usuário existente com esse e-mail e retorna o id dele.
 *
 * Lança CouponOwnerError com mensagem amigável quando o usuário não existe ou
 * quando ele já é dono de outro cupom (ownerUserId é único).
 */
export async function resolveCouponOwnerId(
  ownerEmail: unknown,
  couponId: string | null
): Promise<string | null | undefined> {
  if (ownerEmail === undefined) return undefined;
  if (ownerEmail === null || (typeof ownerEmail === "string" && !ownerEmail.trim())) {
    return null;
  }
  if (typeof ownerEmail !== "string") {
    throw new CouponOwnerError("E-mail do influenciador inválido.");
  }

  const email = normalizeEmail(ownerEmail);
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, ownedCoupon: { select: { id: true, code: true } } },
  });

  if (!user) {
    throw new CouponOwnerError(
      "Nenhum usuário com esse e-mail. Peça para o influenciador criar a conta primeiro."
    );
  }

  if (user.ownedCoupon && user.ownedCoupon.id !== couponId) {
    throw new CouponOwnerError(
      `Este usuário já é dono do cupom ${user.ownedCoupon.code}. Cada influenciador pode ter só um cupom.`
    );
  }

  return user.id;
}
