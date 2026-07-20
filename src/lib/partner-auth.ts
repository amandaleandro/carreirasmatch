import { cache } from "react";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const requirePartnerPage = cache(async () => {
  const session = await auth();
  if (session?.user?.accountType !== "partner" || !session.user.partnerId) {
    redirect("/parceiro/login");
  }
  const partner = await prisma.partner.findUnique({ where: { id: session.user.partnerId } });
  if (!partner) redirect("/parceiro/login");
  return { session, partner };
});

export async function requirePartnerApi() {
  const session = await auth();
  if (!session?.user?.id) {
    return { partner: null, response: NextResponse.json({ error: "Faça login como parceiro." }, { status: 401 }) };
  }
  if (session.user.accountType !== "partner" || !session.user.partnerId) {
    return { partner: null, response: NextResponse.json({ error: "Acesso restrito a parceiros." }, { status: 403 }) };
  }
  const partner = await prisma.partner.findUnique({ where: { id: session.user.partnerId } });
  if (!partner) {
    return {
      partner: null,
      response: NextResponse.json({ error: "Sua sessão expirou. Entre novamente." }, { status: 401 }),
    };
  }
  return { partner, response: null };
}
