"use client";

import { FormEvent, useMemo, useState } from "react";
import { CouponCodeInput } from "@/components/coupon-code-input";
import { MercadoPagoSubscriptionBrick } from "@/components/mercadopago-subscription-brick";
import { CAREER_OFFER_BY_SEGMENT } from "@/lib/career-offers";
import { CAREER_SEGMENT_OPTIONS, type CareerSegment } from "@/lib/career-segments";
import { parseBRLToCents } from "@/lib/pricing";

export function PublicSubscriptionCheckout({ initialSegment }: { initialSegment: CareerSegment }) {
  const [segment, setSegment] = useState<CareerSegment>(initialSegment);
  const [email, setEmail] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [showBrick, setShowBrick] = useState(false);

  const offer = CAREER_OFFER_BY_SEGMENT[segment];
  const amount = useMemo(() => parseBRLToCents(offer.monthlyPrice) / 100, [offer.monthlyPrice]);

  function handleStart(e: FormEvent) {
    e.preventDefault();
    setShowBrick(true);
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-12 w-full">
      <header className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Assinatura mensal
        </p>
        <h1 className="text-2xl font-bold tracking-tight mt-2">Assinar {offer.monthlyName}</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2 text-sm">
          Pague com cartão pelo Mercado Pago. Depois do pagamento, você cria sua conta para acessar tudo.
        </p>
      </header>

      <section className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold">{offer.monthlyName}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{offer.title}</p>
          </div>
          <p className="font-bold text-blue-600 dark:text-blue-400">{offer.monthlyPrice}</p>
        </div>

        {!showBrick ? (
          <form onSubmit={handleStart} className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Seu momento</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value as CareerSegment)}
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
              >
                {CAREER_SEGMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">E-mail para liberar seu acesso</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              />
            </div>

            <CouponCodeInput value={couponCode} onChange={setCouponCode} />

            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 text-white font-medium py-2.5 hover:bg-blue-700 transition-colors"
            >
              Ir para pagamento
            </button>
          </form>
        ) : (
          <div className="mt-5 space-y-4">
            <button
              type="button"
              onClick={() => setShowBrick(false)}
              className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              Alterar e-mail ou plano
            </button>
            <MercadoPagoSubscriptionBrick
              amount={amount}
              payerEmail={email}
              segment={segment}
              couponCode={couponCode}
              onSuccess={(registerUrl) => {
                window.location.href = registerUrl ?? `/register?email=${encodeURIComponent(email)}`;
              }}
            />
          </div>
        )}
      </section>
    </main>
  );
}
