import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isCareerSegment, normalizeCareerSegment } from "@/lib/career-segments";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { COMMERCIAL_PLANS, type CommercialPlanKey } from "@/lib/commercial-plan-catalog";

/**
 * Registra um Payment "pending" assim que o usuário chega na tela de cartão do
 * Brick de assinatura (antes de digitar/submeter os dados) — não só quando a
 * cobrança é de fato tentada em /api/billing/subscription. Sem isso, quem abre
 * o checkout e desiste sem preencher o cartão não deixa rastro nenhum: não
 * aparece no funil de "checkout iniciado vs. pago" e não entra na régua de
 * e-mail de recuperação (sendCheckoutRecoveryEmails só varre a tabela Payment).
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });

  const { payerEmail, segment: requestedSegment, planKey: requestedPlanKey } = body;
  const planKey = typeof requestedPlanKey === "string" && requestedPlanKey in COMMERCIAL_PLANS ? (requestedPlanKey as CommercialPlanKey) : "pro";
  const selectedPlan = COMMERCIAL_PLANS[planKey];
  if (!selectedPlan.recurring || planKey === "free") {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const email = normalizeEmail(session?.user?.email ?? payerEmail);
  if (!isValidEmail(email)) {
    // E-mail ainda não preenchido nesse ponto do formulário: não é erro, só
    // não há como identificar quem abandonou.
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  let userId = session?.user?.id ?? null;
  const existingUser = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { careerSegment: true } })
    : await prisma.user.findUnique({ where: { email }, select: { id: true, careerSegment: true } });

  const segment =
    normalizeCareerSegment(existingUser?.careerSegment) ??
    (typeof requestedSegment === "string" && isCareerSegment(requestedSegment) ? requestedSegment : "career_pro");

  if (!userId) {
    const user = await prisma.user.upsert({
      where: { email },
      create: { email, careerSegment: segment },
      update: {},
      select: { id: true },
    });
    userId = user.id;
  }

  // Já existe uma intenção pendente recente pra esse usuário/plano? Reaproveita
  // em vez de acumular um Payment novo a cada re-render do formulário.
  const recentIntent = await prisma.payment.findFirst({
    where: {
      userId,
      kind: "subscription",
      segment,
      status: "pending",
      mpPaymentId: { startsWith: "intent_" },
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (recentIntent) {
    return NextResponse.json({ ok: true, paymentId: recentIntent.id });
  }

  const payment = await prisma.payment.create({
    data: {
      userId,
      kind: "subscription",
      segment,
      amount: selectedPlan.priceCents,
      status: "pending",
      mpPaymentId: `intent_${crypto.randomUUID()}`,
    },
  });

  return NextResponse.json({ ok: true, paymentId: payment.id });
}
