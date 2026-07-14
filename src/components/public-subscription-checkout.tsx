"use client";

import { FormEvent, useMemo, useState } from "react";
import { CouponCodeInput } from "@/components/coupon-code-input";
import { MercadoPagoSubscriptionBrick } from "@/components/mercadopago-subscription-brick";
import { MercadoPagoPaymentBrick } from "@/components/mercadopago-payment-brick";
import { CAREER_OFFER_BY_SEGMENT } from "@/lib/career-offers";
import { CAREER_SEGMENT_OPTIONS, type CareerSegment } from "@/lib/career-segments";
import { parseBRLToCents, formatCentsToBRL } from "@/lib/pricing";

type PlanId = "card_recurring" | "monthly_oneoff" | "annual";

export function PublicSubscriptionCheckout({ initialSegment }: { initialSegment: CareerSegment }) {
  const [segment, setSegment] = useState<CareerSegment>(initialSegment);
  const [email, setEmail] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [plan, setPlan] = useState<PlanId>("card_recurring");
  const [showBrick, setShowBrick] = useState(false);

  const offer = CAREER_OFFER_BY_SEGMENT[segment];
  const monthlyCents = useMemo(() => parseBRLToCents(offer.monthlyPrice), [offer.monthlyPrice]);
  const annualCents = monthlyCents * 10; // 12 meses pagando 10 (2 grátis)

  const plans: { id: PlanId; title: string; price: string; note: string }[] = [
    {
      id: "card_recurring",
      title: "Mensal no cartão",
      price: `${formatCentsToBRL(monthlyCents)}/mês`,
      note: "Renova automático todo mês. Cancele quando quiser.",
    },
    {
      id: "monthly_oneoff",
      title: "Mensal no Pix",
      price: `${formatCentsToBRL(monthlyCents)} / 30 dias`,
      note: "Cartão ou Pix. Sem renovação automática, você renova quando quiser.",
    },
    {
      id: "annual",
      title: "Anual (2 meses grátis)",
      price: `${formatCentsToBRL(annualCents)} / ano`,
      note: `Cartão ou Pix. 365 dias de acesso. Equivale a ${formatCentsToBRL(Math.round(annualCents / 12))}/mês.`,
    },
  ];

  const amountCents = plan === "annual" ? annualCents : monthlyCents;

  function handleStart(e: FormEvent) {
    e.preventDefault();
    setShowBrick(true);
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-12 w-full">
      <header className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Assinatura
        </p>
        <h1 className="text-2xl font-bold tracking-tight mt-2">Assinar {offer.monthlyName}</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2 text-sm">
          Cartão recorrente, ou Pix/cartão sem renovação automática. Depois do pagamento, você cria sua conta para acessar tudo.
        </p>
      </header>

      <section className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-950">
        {!showBrick ? (
          <form onSubmit={handleStart} className="space-y-5">
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

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium mb-1">Como você quer pagar</legend>
              {plans.map((p) => (
                <label
                  key={p.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    plan === p.id
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={p.id}
                    checked={plan === p.id}
                    onChange={() => setPlan(p.id)}
                    className="mt-1"
                  />
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm">{p.title}</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 text-sm whitespace-nowrap">{p.price}</span>
                    </span>
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{p.note}</span>
                  </span>
                </label>
              ))}
            </fieldset>

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
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowBrick(false)}
              className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              ← Alterar plano ou e-mail
            </button>

            <div className="rounded-md bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-sm flex items-center justify-between">
              <span className="font-medium">{plans.find((p) => p.id === plan)?.title}</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{plans.find((p) => p.id === plan)?.price}</span>
            </div>

            {plan === "card_recurring" ? (
              <MercadoPagoSubscriptionBrick
                amount={amountCents / 100}
                payerEmail={email}
                segment={segment}
                couponCode={couponCode}
                onSuccess={(registerUrl) => {
                  window.location.href = registerUrl ?? `/register?email=${encodeURIComponent(email)}`;
                }}
              />
            ) : (
              <MercadoPagoPaymentBrick
                amount={amountCents / 100}
                kind={plan === "annual" ? "subscription_annual" : "subscription_monthly"}
                payerEmail={email}
                couponCode={couponCode}
                segment={segment}
                onSuccess={() => {
                  // Anônimo é redirecionado para /register pelo próprio brick (registerUrl).
                  // Este onSuccess só dispara para usuário logado.
                  window.location.href = "/dashboard";
                }}
              />
            )}
          </div>
        )}
      </section>
    </main>
  );
}
