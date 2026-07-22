"use client";

import { useState } from "react";
import { MercadoPagoPaymentBrick } from "@/components/mercadopago-payment-brick";
import { CouponCodeInput } from "@/components/coupon-code-input";
import { parseBRLToCents } from "@/lib/pricing";

export function UnlockFirstAnalysisButton({ price }: { price?: string }) {
  const [showBrick, setShowBrick] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const amount = parseBRLToCents(price ?? "R$9,90") / 100;

  if (showBrick) {
    return (
      <div className="space-y-3">
        <CouponCodeInput value={couponCode} onChange={setCouponCode} />
        <MercadoPagoPaymentBrick
          amount={amount}
          kind="first_analysis"
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
      className="rounded-md bg-blue-600 text-white font-medium px-5 py-2.5 text-sm hover:bg-blue-700 transition-colors"
    >
      Fazer minha primeira análise
    </button>
  );
}
