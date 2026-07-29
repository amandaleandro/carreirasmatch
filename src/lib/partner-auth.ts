import { cache } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireAccountPage, requireAccountApi } from "@/lib/account-auth";

export const requirePartnerPage = cache(async () => {
  const session = await auth();
  const { entity: partner } = await requireAccountPage(
    session,
    "partner",
    session?.user?.partnerId,
    () => prisma.partner.findUnique({ where: { id: session!.user.partnerId! } }),
    "/parceiro/login",
  );
  return { session: session!, partner };
});

export async function requirePartnerApi() {
  const session = await auth();
  const { entity: partner, response } = await requireAccountApi(
    session,
    "partner",
    session?.user?.partnerId,
    () => prisma.partner.findUnique({ where: { id: session!.user.partnerId! } }),
    {
      noSession: "Faça login como parceiro.",
      wrongAccountType: "Acesso restrito a parceiros.",
      expired: "Sua sessão expirou. Entre novamente.",
    },
  );
  return { partner, response };
}
