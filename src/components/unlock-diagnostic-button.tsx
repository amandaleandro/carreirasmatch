"use client";

import { useState } from "react";
import { MercadoPagoPaymentBrick } from "@/components/mercadopago-payment-brick";
import { CouponCodeInput } from "@/components/coupon-code-input";
import { parseBRLToCents } from "@/lib/pricing";

export function UnlockDiagnosticButton({
  analysisId,
  price,
}: {
  analysisId: string;
  price: string;
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
          onSuccess={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowBrick(true)}
      className="w-full sm:w-auto rounded-md bg-blue-600 text-white font-medium px-5 py-2.5 text-sm hover:bg-blue-700 transition-colors"
    >
      {`Liberar diagnóstico completo (${price})`}
    </button>
  );
}
