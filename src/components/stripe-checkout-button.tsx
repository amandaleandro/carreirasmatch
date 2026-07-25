"use client";

import { useState } from "react";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";
import { CreditCard, Loader2 } from "lucide-react";

export function StripeCheckoutButton({
  analysisId,
  kind = "diagnostic",
  segment = "career_pro",
  couponCode = "",
  payerEmail = "",
  label = "Pagar com Cartão (Stripe)",
}: {
  analysisId?: string;
  kind?: string;
  segment?: string;
  couponCode?: string;
  payerEmail?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStripeCheckout() {
    setLoading(true);
    setError(null);
    track(ANALYTICS_EVENTS.CHECKOUT_STARTED, { provider: "stripe", kind, segment });

    try {
      const res = await fetch("/api/billing/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId,
          kind,
          segment,
          couponCode,
          email: payerEmail,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha ao iniciar checkout no Stripe.");
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de checkout inválida retornada pelo Stripe.");
      }
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o Stripe.");
      track(ANALYTICS_EVENTS.CHECKOUT_FAILED, { provider: "stripe", reason: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleStripeCheckout}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs px-5 py-3 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Redirecionando para o Stripe...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            <span>{label}</span>
          </>
        )}
      </button>
      {error && <p className="text-[10px] text-red-500 font-semibold text-center">{error}</p>}
    </div>
  );
}
