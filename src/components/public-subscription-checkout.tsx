"use client";

import { FormEvent, useMemo, useState } from "react";
import { CouponCodeInput } from "@/components/coupon-code-input";
import { MercadoPagoSubscriptionBrick } from "@/components/mercadopago-subscription-brick";
import { MercadoPagoPaymentBrick } from "@/components/mercadopago-payment-brick";
import { CAREER_OFFER_BY_SEGMENT } from "@/lib/career-offers";
import { CAREER_SEGMENT_OPTIONS, type CareerSegment } from "@/lib/career-segments";
import { parseBRLToCents, formatCentsToBRL } from "@/lib/pricing";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

type PlanId = "card_recurring" | "monthly_oneoff" | "annual";

export function PublicSubscriptionCheckout({
  initialSegment,
  initialCouponCode = "",
}: {
  initialSegment: CareerSegment;
  initialCouponCode?: string;
}) {
  const [segment, setSegment] = useState<CareerSegment>(initialSegment);
  const [email, setEmail] = useState("");
  const [couponCode, setCouponCode] = useState(initialCouponCode.toUpperCase());
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
    track(ANALYTICS_EVENTS.CHECKOUT_STARTED, { kind: plan, segment });
    setShowBrick(true);
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-12 w-full">
      <header className="mb-10 text-center max-w-2xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Plano recomendado para o seu momento
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">
          Continue evoluindo a cada nova oportunidade
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2 text-sm">
          Escolha seu momento profissional para ver a oferta certa. Você pode assinar no
          cartão ou comprar um período com Pix, sem renovação automática.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
        <aside className="rounded-2xl border border-blue-100 bg-[linear-gradient(145deg,#eff6ff,#ffffff_58%,#fff7ed)] p-6 shadow-sm dark:border-blue-900/40 dark:bg-[linear-gradient(145deg,#0b1f3a,#0b1220_58%,#22170b)]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
            {offer.title}
          </p>
          <h2 className="mt-3 text-2xl font-bold">{offer.monthlyName}</h2>
          <p className="mt-2 text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            {formatCentsToBRL(monthlyCents)}
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">/mês</span>
          </p>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            Para quem quer melhorar várias candidaturas, acompanhar a evolução e chegar
            mais preparado às próximas etapas.
          </p>
          <div className="mt-6 space-y-3">
            {[...offer.monthlyFeatures, ...offer.retentionFeatures].map((feature) => (
              <div key={feature} className="flex items-start gap-3 text-sm text-neutral-700 dark:text-neutral-200">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  ✓
                </span>
                {feature}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-white/80 bg-white/70 p-4 text-xs leading-relaxed text-neutral-500 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
            O CarreirasMatch ajuda você a se preparar e se apresentar melhor. Não
            garante entrevista, contratação ou aprovação.
          </div>
        </aside>

      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 md:p-6 bg-white dark:bg-neutral-950 shadow-sm">
        {!showBrick ? (
          <form onSubmit={handleStart} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1">1. Qual é o seu momento?</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value as CareerSegment)}
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
              >
                {/* Faculdade/técnico ainda não tem assinatura mensal; vende só o diagnóstico avulso. */}
                {CAREER_SEGMENT_OPTIONS.filter((option) => option.value !== "student").map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold mb-1">2. Como você prefere acessar?</legend>
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
              <label className="block text-sm font-semibold mb-1">3. E-mail para liberar o acesso</label>
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
              className="w-full rounded-xl bg-blue-600 text-white font-semibold py-3 hover:bg-blue-700 transition-colors"
            >
              Continuar para pagamento seguro
            </button>
            <p className="text-center text-xs text-neutral-400">
              Pagamento processado pelo Mercado Pago. Consulte cancelamento e renovação na opção escolhida.
            </p>
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
      </div>
    </main>
  );
}
