import { NextRequest, NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";
import { COMPANY_PLAN, activateCompanyPlan, hasActiveCompanyPlan } from "@/lib/company-billing";
import { createPreapproval } from "@/lib/mercadopago";
import { sendCompanySubscriptionConfirmationEmail, notifyAdminPurchase } from "@/lib/resend";
import { notifyAdminPurchaseWhatsapp } from "@/lib/evolution";

function getAppUrl(req: NextRequest) {
  return process.env.APP_URL ?? req.nextUrl.origin;
}

// Assina o plano recorrente da empresa (vagas + triagens ilimitadas).
export async function POST(req: NextRequest) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  if (hasActiveCompanyPlan(company)) {
    return NextResponse.json({ error: "Sua empresa já tem o plano ativo." }, { status: 400 });
  }

  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const token = (body.token ?? "").trim();
  if (!token) {
    return NextResponse.json({ error: "Dados de cartão ausentes." }, { status: 400 });
  }

  let result;
  try {
    result = await createPreapproval({
      cardTokenId: token,
      transactionAmount: COMPANY_PLAN.priceCents / 100,
      reason: COMPANY_PLAN.label,
      payerEmail: company.email,
      externalReference: `${company.id}:company_subscription`,
      backUrl: `${getAppUrl(req)}/empresa/billing`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao processar assinatura." },
      { status: 400 }
    );
  }

  const status = result.status === "authorized" ? "paid" : "pending";

  const payment = await prisma.companyPayment.create({
    data: {
      companyId: company.id,
      kind: COMPANY_PLAN.kind,
      credits: 0,
      amount: COMPANY_PLAN.priceCents,
      status,
      mpPaymentId: result.id,
      paidAt: status === "paid" ? new Date() : null,
    },
  });

  if (status === "paid") {
    const currentPeriodEnd = await activateCompanyPlan(payment.id);
    if (currentPeriodEnd) {
      void sendCompanySubscriptionConfirmationEmail(company.email, { currentPeriodEnd });
      void notifyAdminPurchase({ product: `${COMPANY_PLAN.label} (empresa)`, amountCents: COMPANY_PLAN.priceCents, email: company.email });
      void notifyAdminPurchaseWhatsapp({ product: `${COMPANY_PLAN.label} (empresa)`, amountCents: COMPANY_PLAN.priceCents, email: company.email });
    }
  }

  return NextResponse.json({ status: result.status });
}
