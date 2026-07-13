"use client";

import { useState } from "react";
import { MercadoPagoPaymentBrick } from "@/components/mercadopago-payment-brick";
import { CouponCodeInput } from "@/components/coupon-code-input";
import { parseBRLToCents } from "@/lib/pricing";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";

export function UnlockDiagnosticButton({
  analysisId,
  price,
  payerEmail,
  segment,
}: {
  analysisId: string;
  price: string;
  /** Pré-preenche o e-mail do pagador (fluxo anônimo, vindo do lead capturado). */
  payerEmail?: string;
  /** Segmento do usuário anônimo — só rotula o pagamento; o preço do avulso é uniforme. */
  segment?: string;
}) {
  const [showBrick, setShowBrick] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const amount = parseBRLToCents(price) / 100;

  if (showBrick) {
    return (
      <div className="space-y-3">
        <CouponCodeInput value={couponCode} onChange={setCouponCode} />
        <MercadoPagoPaymentBrick
          amount={amount}
          kind="diagnostic"
          analysisId={analysisId}
          couponCode={couponCode}
          payerEmail={payerEmail}
          segment={segment}
          onSuccess={() => {
            track(ANALYTICS_EVENTS.PAYMENT_CONFIRMED, { kind: "diagnostic" });
            window.location.reload();
          }}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        track(ANALYTICS_EVENTS.UNLOCK_CLICKED, { kind: "diagnostic" });
        setShowBrick(true);
      }}
      className="w-full sm:w-auto rounded-md bg-blue-600 text-white font-medium px-5 py-2.5 text-sm hover:bg-blue-700 transition-colors"
    >
      {`Liberar diagnóstico completo (${price})`}
    </button>
  );
}
