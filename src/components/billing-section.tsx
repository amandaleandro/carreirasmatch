"use client";

import { useState } from "react";
import { MercadoPagoSubscriptionBrick } from "@/components/mercadopago-subscription-brick";
import { CouponCodeInput } from "@/components/coupon-code-input";
import { parseBRLToCents } from "@/lib/pricing";

export function BillingSection({
  monthlyPrice,
  monthlyName,
  subscriptionStatus,
  currentPeriodEnd,
  payerEmail,
}: {
  monthlyPrice: string;
  monthlyName: string;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  payerEmail: string;
}) {
  const [showBrick, setShowBrick] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const isActive = subscriptionStatus === "active";
  const amount = parseBRLToCents(monthlyPrice) / 100;

  return (
    <div className="space-y-4">
      {isActive && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Assinatura ativa{currentPeriodEnd ? ` até ${new Date(currentPeriodEnd).toLocaleDateString("pt-BR")}` : ""}.
        </p>
      )}

      {!showBrick && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setShowBrick(true)}
            className="rounded-md bg-blue-600 text-white font-medium px-5 py-2.5 text-sm hover:bg-blue-700 transition-colors"
          >
            {isActive ? `Renovar ${monthlyName} (${monthlyPrice})` : `Assinar ${monthlyName} (${monthlyPrice})`}
          </button>
        </div>
      )}

      {showBrick && (
        <div className="space-y-3">
          <CouponCodeInput value={couponCode} onChange={setCouponCode} />
          <MercadoPagoSubscriptionBrick
            amount={amount}
            payerEmail={payerEmail}
            couponCode={couponCode}
            onSuccess={() => window.location.reload()}
          />
        </div>
      )}

      <p className="text-xs text-neutral-500 dark:text-neutral-400">Pagamento via cartão, processado pelo Mercado Pago.</p>
    </div>
  );
}
