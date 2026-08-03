import { NextRequest, NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";
import { COMPANY_PLANS, type CompanyPlanKind, activateCompanyPlan, hasActiveCompanyPlan } from "@/lib/company-billing";
import { createPreapproval } from "@/lib/mercadopago";
import { sendCompanySubscriptionConfirmationEmail, notifyAdminPurchase } from "@/lib/resend";
import { notifyAdminPurchaseWhatsapp } from "@/lib/evolution";

function getAppUrl(req: NextRequest) {
  return process.env.APP_URL ?? req.nextUrl.origin;
}

// Assina o plano recorrente da empresa (vagas + cota mensal de triagens).
export async function POST(req: NextRequest) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  if (hasActiveCompanyPlan(company)) {
    return NextResponse.json({ error: "Sua empresa já tem o plano ativo." }, { status: 400 });
  }

  let body: { token?: string; planKind?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const token = (body.token ?? "").trim();
  if (!token) {
    return NextResponse.json({ error: "Dados de cartão ausentes." }, { status: 400 });
  }

  const planKind: CompanyPlanKind = body.planKind === "starter" ? "starter" : "pro";
  const plan = COMPANY_PLANS[planKind];

  let result;
  try {
    result = await createPreapproval({
      cardTokenId: token,
      transactionAmount: plan.priceCents / 100,
      reason: plan.label,
      payerEmail: company.email,
      externalReference: `${company.id}:${plan.kind}`,
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
      kind: plan.kind,
      credits: 0,
      amount: plan.priceCents,
      status,
      mpPaymentId: result.id,
      paidAt: status === "paid" ? new Date() : null,
    },
  });

  if (status === "paid") {
    const currentPeriodEnd = await activateCompanyPlan(payment.id);
    if (currentPeriodEnd) {
      void sendCompanySubscriptionConfirmationEmail(company.email, {
        currentPeriodEnd,
        planLabel: plan.label,
        screeningsIncluded: plan.screeningsIncluded,
      });
      void notifyAdminPurchase({ product: `${plan.label} (empresa)`, amountCents: plan.priceCents, email: company.email });
      void notifyAdminPurchaseWhatsapp({ product: `${plan.label} (empresa)`, amountCents: plan.priceCents, email: company.email });
    }
  }

  return NextResponse.json({ status: result.status });
}
