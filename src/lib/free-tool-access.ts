import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";
import { hasActiveSubscriptionAccess } from "@/lib/entitlements";

export async function authorizeFreeAiTool(tool: string, consume: boolean) {
  const { session, response } = await requireAuth();
  if (!session) return { session: null, response, subscriber: false };

  if (await hasActiveSubscriptionAccess(session.user.id)) {
    return { session, response: null, subscriber: true };
  }

  const usage = await prisma.freeToolUsage.findUnique({
    where: { userId_tool: { userId: session.user.id, tool } },
  });

  if (!consume) {
    if (usage) return { session, response: null, subscriber: false };
    return {
      session: null,
      subscriber: false,
      response: NextResponse.json({ error: "Inicie sua experiência gratuita para continuar." }, { status: 403 }),
    };
  }

  if (usage) {
    return {
      session: null,
      subscriber: false,
      response: NextResponse.json(
        { error: "Você já usou sua experiência gratuita. Assine para usar novamente." },
        { status: 402 }
      ),
    };
  }

  await prisma.freeToolUsage.create({ data: { userId: session.user.id, tool } });
  return { session, response: null, subscriber: false };
}

export async function releaseFreeAiToolUsage(userId: string, tool: string) {
  await prisma.freeToolUsage.deleteMany({ where: { userId, tool } });
}
