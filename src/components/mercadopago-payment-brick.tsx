"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { ANALYTICS_EVENTS, getStoredAttribution, track } from "@/lib/analytics";

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
  segment,
  productCode,
  onSuccess,
  freelanceContractId,
}: {
  amount: number;
  kind: "first_analysis" | "diagnostic" | "subscription_monthly" | "subscription_annual" | "freelance";
  freelanceContractId?: string;
  analysisId?: string;
  payerEmail?: string;
  couponCode?: string;
  segment?: string;
  productCode?: string;
  onSuccess: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pix, setPix] = useState<PixResult>(null);
  const [registerUrl, setRegisterUrl] = useState<string | null>(null);

  // Valores que mudam com frequência (ex: cada tecla do cupom) não podem entrar
  // nas deps do onSubmit: o SDK do MP reinicializa o Brick inteiro quando essas
  // referências mudam, apagando os dados do cartão em digitação.
  const latest = useRef({ analysisId, couponCode, segment });

  useEffect(() => {
    latest.current = { analysisId, couponCode, segment };
  }, [analysisId, couponCode, segment]);

  useEffect(() => {
    ensureInitialized();
  }, []);

  const initialization = useMemo(
    () => ({
      amount,
      payer: {
        email: payerEmail || undefined,
        entityType: "individual" as const,
      },
    }),
    [amount, payerEmail],
  );

  const customization = useMemo(
    () => ({
      paymentMethods: { creditCard: "all" as const, bankTransfer: "all" as const },
    }),
    [],
  );

  const handleSubmit = useCallback(
    async (formData: unknown) => {
      const { analysisId, couponCode, segment } = latest.current;
      setError(null);
      track(ANALYTICS_EVENTS.CHECKOUT_STARTED, { kind });
      try {
        const res = await fetch(freelanceContractId ? `/api/freelance/contracts/${freelanceContractId}/checkout` : "/api/billing/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            freelanceContractId
              ? { formData }
              : { kind, productCode, analysisId, formData, couponCode, segment, attribution: getStoredAttribution() }
          ),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erro ao processar pagamento.");

        if (data.pix) {
          track(ANALYTICS_EVENTS.PIX_GENERATED, { kind });
          setRegisterUrl(data.registerUrl ?? null);
          setPix(data.pix);
        } else if (data.status === "approved") {
          // Anônimo: manda definir a senha (a conta já foi criada). Logado: callback normal.
          if (data.registerUrl) {
            window.location.href = data.registerUrl;
          } else {
            onSuccess();
          }
        } else if (data.status === "rejected") {
          setError("Pagamento recusado. Tente outro cartão.");
        } else {
          setError("Pagamento em análise. Você será avisado quando for confirmado.");
        }
      } catch (err) {
        track(ANALYTICS_EVENTS.CHECKOUT_FAILED, { kind });
        setError(err instanceof Error ? err.message : "Erro inesperado.");
        throw err;
      }
    },
    [kind, onSuccess, freelanceContractId, productCode],
  );

  const handleError = useCallback(
    (err: { message?: string }) => setError(err.message ?? "Erro ao carregar o formulário de pagamento."),
    [],
  );

  if (pix) {
    return (
      <div className="space-y-3 text-sm">
        <p>Escaneie o QR Code ou copie o código para pagar via PIX:</p>
        <Image
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
        {registerUrl && (
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Depois de pagar,{" "}
            <a href={registerUrl} className="font-semibold text-blue-600 dark:text-blue-400 underline">
              crie sua conta com o mesmo e-mail
            </a>{" "}
            para acessar o diagnóstico.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Payment
        initialization={initialization}
        customization={customization}
        onSubmit={handleSubmit}
        onError={handleError}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
