import { NextRequest, NextResponse } from "next/server";
import { requirePartnerApi } from "@/lib/partner-auth";
import { prisma } from "@/lib/prisma";
import { createPayment } from "@/lib/mercadopago";
import { findAdPack, grantPartnerCredits } from "@/lib/partner-billing";
import { notifyAdminPurchase } from "@/lib/resend";
import { notifyAdminPurchaseWhatsapp } from "@/lib/evolution";
import { checkRateLimit } from "@/lib/rate-limit";

const BUY_LIMIT = { limit: 10, windowMs: 10 * 60 * 1000 };

export async function POST(req: NextRequest) {
  const { partner, response } = await requirePartnerApi();
  if (!partner) return response;

  const rateLimit = checkRateLimit(`partner-buy:${partner.id}`, BUY_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um momento e tente novamente." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const { kind, formData } = await req.json();
  const pack = typeof kind === "string" ? findAdPack(kind) : undefined;
  if (!pack) {
    return NextResponse.json({ error: "Pacote inválido." }, { status: 400 });
  }
  if (!formData || typeof formData !== "object") {
    return NextResponse.json({ error: "Dados de pagamento ausentes." }, { status: 400 });
  }

  const payerIdentification =
    typeof formData.payer?.identification?.type === "string" &&
    typeof formData.payer?.identification?.number === "string"
      ? { type: formData.payer.identification.type, number: formData.payer.identification.number }
      : undefined;

  let result;
  try {
    result = await createPayment({
      transactionAmount: pack.priceCents / 100,
      description: `CarreirasMatch Parceiros - ${pack.label}`,
      token: typeof formData.token === "string" ? formData.token : undefined,
      paymentMethodId: typeof formData.payment_method_id === "string" ? formData.payment_method_id : undefined,
      issuerId:
        typeof formData.issuer_id === "string" || typeof formData.issuer_id === "number"
          ? Number(formData.issuer_id)
          : undefined,
      installments: typeof formData.installments === "number" ? formData.installments : undefined,
      payerEmail: partner.email,
      payerIdentification,
      externalReference: `partner:${partner.id}:${pack.kind}`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao processar pagamento." },
      { status: 400 }
    );
  }

  const status = result.status === "approved" ? "paid" : result.status === "rejected" ? "cancelled" : "pending";

  const payment = await prisma.partnerPayment.create({
    data: {
      partnerId: partner.id,
      kind: pack.kind,
      credits: pack.credits,
      amount: pack.priceCents,
      status: status === "cancelled" ? "cancelled" : "pending",
      mpPaymentId: String(result.id),
    },
  });

  let balance: number | null = null;
  if (status === "paid") {
    balance = await grantPartnerCredits(payment.id);
    if (balance !== null) {
      void notifyAdminPurchase({
        product: `${pack.credits} destaques de curso (parceiro)`,
        amountCents: pack.priceCents,
        email: partner.email,
      });
      void notifyAdminPurchaseWhatsapp({
        product: `${pack.credits} destaques de curso (parceiro)`,
        amountCents: pack.priceCents,
        email: partner.email,
      });
    }
  }

  return NextResponse.json({ status: result.status, pix: result.pix, credits: pack.credits, balance });
}
