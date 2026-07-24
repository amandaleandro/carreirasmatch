import { NextRequest, NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";
import { createPayment } from "@/lib/mercadopago";
import { findScreeningPack, grantScreeningCredits } from "@/lib/company-billing";
import { notifyAdminPurchase } from "@/lib/resend";
import { notifyAdminPurchaseWhatsapp } from "@/lib/evolution";
import { checkRateLimit } from "@/lib/rate-limit";

const BUY_LIMIT = { limit: 10, windowMs: 10 * 60 * 1000 };

export async function POST(req: NextRequest) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  const rateLimit = checkRateLimit(`company-buy:${company.id}`, BUY_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um momento e tente novamente." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const { kind, formData } = await req.json();
  const pack = typeof kind === "string" ? findScreeningPack(kind) : undefined;
  if (!pack) {
    return NextResponse.json({ error: "Pacote inválido." }, { status: 400 });
  }
  if (!formData || typeof formData !== "object") {
    return NextResponse.json({ error: "Dados de pagamento ausentes." }, { status: 400 });
  }

  const payerIdentification =
    typeof formData.payer?.identification?.type === "string" &&
    formData.payer.identification.type.trim() !== "" &&
    typeof formData.payer?.identification?.number === "string" &&
    formData.payer.identification.number.trim() !== ""
      ? { type: formData.payer.identification.type.trim(), number: formData.payer.identification.number.trim() }
      : undefined;

  const rawIssuerId = formData.issuer_id ?? formData.issuerId;
  const parsedIssuerId =
    rawIssuerId !== undefined && rawIssuerId !== null && String(rawIssuerId).trim() !== ""
      ? Number(rawIssuerId)
      : undefined;
  const issuerId = parsedIssuerId && !isNaN(parsedIssuerId) && parsedIssuerId > 0 ? parsedIssuerId : undefined;

  const rawInstallments = formData.installments;
  const parsedInstallments =
    rawInstallments !== undefined && rawInstallments !== null && String(rawInstallments).trim() !== ""
      ? Number(rawInstallments)
      : undefined;
  const installments = parsedInstallments && !isNaN(parsedInstallments) && parsedInstallments > 0 ? parsedInstallments : undefined;

  const token = typeof formData.token === "string" && formData.token.trim() !== "" ? formData.token.trim() : undefined;
  const paymentMethodId =
    typeof formData.payment_method_id === "string" && formData.payment_method_id.trim() !== ""
      ? formData.payment_method_id.trim()
      : typeof formData.paymentMethodId === "string" && formData.paymentMethodId.trim() !== ""
      ? formData.paymentMethodId.trim()
      : undefined;

  let result;
  try {
    result = await createPayment({
      transactionAmount: pack.priceCents / 100,
      description: `CarreirasMatch Empresas - ${pack.label}`,
      token,
      paymentMethodId,
      issuerId,
      installments,
      payerEmail: company.email,
      payerIdentification,
      externalReference: `company:${company.id}:${pack.kind}`,
    });
  } catch (err) {
    console.error("[MercadoPago Company Payment Error]:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao processar pagamento." },
      { status: 400 }
    );
  }

  const status = result.status === "approved" ? "paid" : result.status === "rejected" ? "cancelled" : "pending";

  const payment = await prisma.companyPayment.create({
    data: {
      companyId: company.id,
      kind: pack.kind,
      credits: pack.credits,
      amount: pack.priceCents,
      // Nasce "pending"; grantScreeningCredits faz a transição idempotente para "paid".
      status: status === "cancelled" ? "cancelled" : "pending",
      mpPaymentId: String(result.id),
    },
  });

  let balance: number | null = null;
  if (status === "paid") {
    // Cartão aprovado no caminho síncrono: credita agora. No PIX (pending), o
    // webhook chama grantScreeningCredits quando confirmar.
    balance = await grantScreeningCredits(payment.id);
    if (balance !== null) {
      void notifyAdminPurchase({
        product: `${pack.credits} triagens (empresa)`,
        amountCents: pack.priceCents,
        email: company.email,
      });
      void notifyAdminPurchaseWhatsapp({
        product: `${pack.credits} triagens (empresa)`,
        amountCents: pack.priceCents,
        email: company.email,
      });
    }
  }

  return NextResponse.json({ status: result.status, pix: result.pix, credits: pack.credits, balance });
}
