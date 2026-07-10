import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { normalizeCareerSegment } from "@/lib/career-segments";

export async function POST(req: NextRequest) {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  const { analysisId } = await req.json();
  if (typeof analysisId !== "string" || !analysisId) {
    return NextResponse.json({ error: "Análise não informada." }, { status: 400 });
  }

  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: { resume: { include: { user: { select: { careerSegment: true } } } } },
  });
  if (!analysis || !analysis.resume.userId) {
    return NextResponse.json({ error: "Análise não encontrada." }, { status: 404 });
  }

  const payment = await prisma.payment.create({
    data: {
      userId: analysis.resume.userId,
      kind: "diagnostic",
      segment: normalizeCareerSegment(analysis.resume.user?.careerSegment) ?? "career_pro",
      amount: 0,
      status: "paid",
      mpPaymentId: `admin-grant-${randomUUID()}`,
      analysisId,
      paidAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, paymentId: payment.id });
}
