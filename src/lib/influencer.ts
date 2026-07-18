import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Um influenciador é um usuário comum que é dono de um cupom (Coupon.ownerUserId).
 * Ele loga com a conta normal, ganha acesso total ao sistema sem pagar e enxerga
 * o painel /influencer com as vendas e cadastros atribuídos ao cupom dele.
 */
export async function isInfluencerUser(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  const count = await prisma.coupon.count({ where: { ownerUserId: userId } });
  return count > 0;
}

/** Cupom do qual o usuário é dono, ou null se ele não for influenciador. */
export async function getOwnedCoupon(userId: string | null | undefined) {
  if (!userId) return null;
  return prisma.coupon.findUnique({ where: { ownerUserId: userId } });
}

/** Para page components: exige login como influenciador, senão redireciona. */
export async function requireInfluencerPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const coupon = await getOwnedCoupon(session.user.id);
  if (!coupon) redirect("/dashboard");

  return { session, coupon };
}
