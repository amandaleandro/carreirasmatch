"use client";

import { useEffect, useState } from "react";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";

let initialized = false;
function ensureInitialized() {
  if (initialized) return;
  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
  if (!publicKey) throw new Error("NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY não configurada.");
  initMercadoPago(publicKey, { locale: "pt-BR" });
  initialized = true;
}

export function MercadoPagoSubscriptionBrick({
  amount,
  payerEmail,
  couponCode,
  onSuccess,
}: {
  amount: number;
  payerEmail: string;
  couponCode?: string;
  onSuccess: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureInitialized();
  }, []);

  return (
    <div className="space-y-2">
      <CardPayment
        initialization={{ amount, payer: { email: payerEmail } }}
        onSubmit={async (formData) => {
          setError(null);
          try {
            const res = await fetch("/api/billing/subscription", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: formData.token, couponCode }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Erro ao processar assinatura.");

            if (data.status === "authorized") {
              onSuccess();
            } else {
              setError("Assinatura pendente de confirmação. Você será avisado quando for ativada.");
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
