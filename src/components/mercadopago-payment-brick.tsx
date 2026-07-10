"use client";

import { useEffect, useState } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";

let initialized = false;
function ensureInitialized() {
  if (initialized) return;
  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
  if (!publicKey) throw new Error("NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY não configurada.");
  initMercadoPago(publicKey, { locale: "pt-BR" });
  initialized = true;
}

type PixResult = { qrCode: string; qrCodeBase64: string } | null;

export function MercadoPagoPaymentBrick({
  amount,
  kind,
  analysisId,
  payerEmail,
  couponCode,
  onSuccess,
}: {
  amount: number;
  kind: "first_analysis" | "diagnostic";
  analysisId?: string;
  payerEmail?: string;
  couponCode?: string;
  onSuccess: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pix, setPix] = useState<PixResult>(null);

  useEffect(() => {
    ensureInitialized();
  }, []);

  if (pix) {
    return (
      <div className="space-y-3 text-sm">
        <p>Escaneie o QR Code ou copie o código para pagar via PIX:</p>
        <img
          src={`data:image/png;base64,${pix.qrCodeBase64}`}
          alt="QR Code PIX"
          className="w-48 h-48 border border-neutral-200 dark:border-neutral-800 rounded-md"
        />
        <textarea
          readOnly
          value={pix.qrCode}
          className="w-full text-xs p-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
          rows={3}
          onFocus={(e) => e.currentTarget.select()}
        />
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Após o pagamento, a liberação acontece automaticamente em alguns instantes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Payment
        initialization={{ amount, payer: payerEmail ? { email: payerEmail } : undefined }}
        customization={{
          paymentMethods: { creditCard: "all", bankTransfer: "all" },
        }}
        onSubmit={async (formData) => {
          setError(null);
          try {
            const res = await fetch("/api/billing/payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ kind, analysisId, formData, couponCode }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Erro ao processar pagamento.");

            if (data.pix) {
              setPix(data.pix);
            } else if (data.status === "approved") {
              onSuccess();
            } else if (data.status === "rejected") {
              setError("Pagamento recusado. Tente outro cartão.");
            } else {
              setError("Pagamento em análise. Você será avisado quando for confirmado.");
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : "Erro inesperado.");
            throw err;
          }
        }}
        onError={(err) => setError(err.message ?? "Erro ao carregar o formulário de pagamento.")}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
