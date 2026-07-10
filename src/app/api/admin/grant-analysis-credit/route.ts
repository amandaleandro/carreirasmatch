import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { normalizeCareerSegment } from "@/lib/career-segments";

export async function POST(req: NextRequest) {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  const { userId } = await req.json();
  if (typeof userId !== "string" || !userId) {
    return NextResponse.json({ error: "Usuário não informado." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { careerSegment: true } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const payment = await prisma.payment.create({
    data: {
      userId,
      kind: "first_analysis",
      segment: normalizeCareerSegment(user.careerSegment) ?? "career_pro",
      amount: 0,
      status: "paid",
      mpPaymentId: `admin-grant-${randomUUID()}`,
      paidAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, paymentId: payment.id });
}
