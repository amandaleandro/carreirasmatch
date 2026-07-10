import { MercadoPagoConfig, Payment, PreApproval } from "mercadopago";

function getClient(): MercadoPagoConfig {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurada.");
  return new MercadoPagoConfig({ accessToken });
}

export type MercadoPagoPaymentStatus =
  | "pending"
  | "approved"
  | "authorized"
  | "in_process"
  | "in_mediation"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back";

export type MercadoPagoPaymentResult = {
  id: number;
  status: MercadoPagoPaymentStatus;
  statusDetail: string | null;
  pix: { qrCode: string; qrCodeBase64: string } | null;
};

function extractPixData(response: {
  point_of_interaction?: { transaction_data?: { qr_code?: string; qr_code_base64?: string } | null } | null;
}): MercadoPagoPaymentResult["pix"] {
  const data = response.point_of_interaction?.transaction_data;
  if (!data?.qr_code || !data?.qr_code_base64) return null;
  return { qrCode: data.qr_code, qrCodeBase64: data.qr_code_base64 };
}

export async function createPayment(input: {
  transactionAmount: number; // reais
  description: string;
  token?: string;
  paymentMethodId?: string;
  issuerId?: number;
  installments?: number;
  payerEmail: string;
  externalReference: string;
}): Promise<MercadoPagoPaymentResult> {
  const payment = new Payment(getClient());
  const response = await payment.create({
    body: {
      transaction_amount: input.transactionAmount,
      description: input.description,
      token: input.token,
      payment_method_id: input.paymentMethodId,
      issuer_id: input.issuerId,
      installments: input.installments,
      payer: { email: input.payerEmail },
      external_reference: input.externalReference,
    },
  });

  return {
    id: response.id!,
    status: response.status as MercadoPagoPaymentStatus,
    statusDetail: response.status_detail ?? null,
    pix: extractPixData(response),
  };
}

export async function getPayment(id: string | number): Promise<MercadoPagoPaymentResult> {
  const payment = new Payment(getClient());
  const response = await payment.get({ id });
  return {
    id: response.id!,
    status: response.status as MercadoPagoPaymentStatus,
    statusDetail: response.status_detail ?? null,
    pix: extractPixData(response),
  };
}

export type MercadoPagoPreapprovalStatus = "pending" | "authorized" | "paused" | "cancelled";

export type MercadoPagoPreapprovalResult = {
  id: string;
  status: MercadoPagoPreapprovalStatus;
};

export async function createPreapproval(input: {
  cardTokenId: string;
  transactionAmount: number; // reais
  reason: string;
  payerEmail: string;
  externalReference: string;
  backUrl: string;
}): Promise<MercadoPagoPreapprovalResult> {
  const preapproval = new PreApproval(getClient());
  const response = await preapproval.create({
    body: {
      card_token_id: input.cardTokenId,
      reason: input.reason,
      external_reference: input.externalReference,
      payer_email: input.payerEmail,
      back_url: input.backUrl,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: input.transactionAmount,
        currency_id: "BRL",
      },
      status: "authorized",
    },
  });

  return {
    id: response.id!,
    status: response.status as MercadoPagoPreapprovalStatus,
  };
}

export async function getPreapproval(id: string): Promise<MercadoPagoPreapprovalResult> {
  const preapproval = new PreApproval(getClient());
  const response = await preapproval.get({ id });
  return {
    id: response.id!,
    status: response.status as MercadoPagoPreapprovalStatus,
  };
}
