import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { normalizeCareerSegment } from "@/lib/career-segments";

const ALLOWED_DAYS = [30, 90, 365];

export async function POST(req: NextRequest) {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  const { userId, days } = await req.json();
  if (typeof userId !== "string" || !userId || !ALLOWED_DAYS.includes(days)) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { careerSegment: true } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }
  const segment = normalizeCareerSegment(user.careerSegment) ?? "career_pro";
  const currentPeriodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const payment = await prisma.payment.create({
    data: {
      userId,
      kind: "subscription",
      segment,
      amount: 0,
      status: "paid",
      mpPaymentId: `admin-grant-${randomUUID()}`,
      paidAt: new Date(),
    },
  });

  await prisma.subscription.upsert({
    where: { userId },
    create: { userId, segment, status: "active", currentPeriodEnd, lastPaymentId: payment.id },
    update: { segment, status: "active", currentPeriodEnd, lastPaymentId: payment.id },
  });

  return NextResponse.json({ ok: true, currentPeriodEnd: currentPeriodEnd.toISOString() });
}
