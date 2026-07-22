"use client";

import { FormEvent, useMemo, useState } from "react";
import { CouponCodeInput } from "@/components/coupon-code-input";
import { MercadoPagoSubscriptionBrick } from "@/components/mercadopago-subscription-brick";
import { MercadoPagoPaymentBrick } from "@/components/mercadopago-payment-brick";
import { CAREER_OFFER_BY_SEGMENT } from "@/lib/career-offers";
import { CAREER_SEGMENT_OPTIONS, type CareerSegment } from "@/lib/career-segments";
import { parseBRLToCents, formatCentsToBRL } from "@/lib/pricing";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { Check, RefreshCw, Target, TrendingUp, Sparkles, ShieldCheck, Zap, HelpCircle } from "lucide-react";

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
      title: "Mensal no cartão (Mais Popular)",
      price: `${formatCentsToBRL(monthlyCents)}/mês`,
      note: "Renova automático todo mês. Cancele quando quiser com 1 clique.",
    },
    {
      id: "monthly_oneoff",
      title: "Mensal avulso no Pix ou Cartão",
      price: `${formatCentsToBRL(monthlyCents)} / 30 dias`,
      note: "Acesso por 30 dias. Sem renovação automática.",
    },
    {
      id: "annual",
      title: "Anual (2 meses grátis)",
      price: `${formatCentsToBRL(annualCents)} / ano`,
      note: `365 dias de acesso. Equivale a ${formatCentsToBRL(Math.round(annualCents / 12))}/mês.`,
    },
  ];

  const amountCents = plan === "annual" ? annualCents : monthlyCents;

  function handleStart(e: FormEvent) {
    e.preventDefault();
    track(ANALYTICS_EVENTS.CHECKOUT_STARTED, { kind: plan, segment });
    setShowBrick(true);
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 w-full font-sans space-y-10">
      {/* Top Banner Header */}
      <header className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider rounded-full px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          Aceleração Profissional CarreirasMatch
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Por que assinar por R$ 24,90/mês é a sua melhor decisão?
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          Disparar o mesmo currículo genérico garante apenas rejeições automáticas. Por menos de R$ 0,83 ao dia (o preço de um café), você destrava o poder da IA para adaptar seu perfil a cada vaga e conquistar sua contratação.
        </p>
      </header>

      {/* 3 Core Value Pillars */}
      <section aria-label="Vantagens da assinatura" className="grid gap-5 md:grid-cols-3">
        {[
          [
            RefreshCw,
            "Análises com IA Ilimitadas",
            "Ajuste seu currículo palavra por palavra para quantas vagas quiser sem custo adicional por análise.",
          ],
          [
            Target,
            "Passe pelos Filtros dos Robôs (ATS)",
            "Descubra as palavras-chave faltantes que o software de triagem do RH exige antes que um humano leia seu currículo.",
          ],
          [
            TrendingUp,
            "Simulador de Entrevistas com IA",
            "Treine perguntas reais da vaga e receba feedbacks imediatos antes de encarar o recrutador ao vivo.",
          ],
        ].map(([Icon, title, description]) => {
          const BenefitIcon = Icon as typeof RefreshCw;
          return (
            <article
              key={String(title)}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                <BenefitIcon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{String(title)}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{String(description)}</p>
            </article>
          );
        })}
      </section>

      {/* Main Grid: Offer summary + Payment form */}
      <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
        {/* Left Column: What's included */}
        <aside className="rounded-3xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/40 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2.5 py-1 rounded">
              {offer.title}
            </span>
            <h2 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">{offer.monthlyName}</h2>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                {formatCentsToBRL(monthlyCents)}
              </span>
              <span className="text-xs font-semibold text-slate-500">/mês (ou R$ 0,83/dia)</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Ideal para quem quer agir com constância na busca do novo emprego.
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-600" /> O que está incluído no seu acesso
            </p>
            <div className="space-y-2.5">
              {offer.monthlyFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" /> Ferramentas exclusivas
            </p>
            <div className="space-y-2.5">
              {offer.retentionFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-800/40 p-4 text-xs text-slate-500 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Garantia de Satisfação & Cancelamento Livre</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Cancele quando quiser com apenas 1 clique no seu painel. Sem carência nem taxas ocultas.
            </p>
          </div>
        </aside>

        {/* Right Column: Checkout Step */}
        <section className="rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          {!showBrick ? (
            <form onSubmit={handleStart} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  1. Selecione o seu momento profissional
                </label>
                <select
                  value={segment}
                  onChange={(e) => setSegment(e.target.value as CareerSegment)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                >
                  {CAREER_SEGMENT_OPTIONS.filter((option) => option.value !== "student").map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <fieldset className="space-y-3">
                <legend className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  2. Escolha o seu plano
                </legend>
                {plans.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition-all ${
                      plan === p.id
                        ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={p.id}
                      checked={plan === p.id}
                      onChange={() => setPlan(p.id)}
                      className="mt-1 accent-blue-600"
                    />
                    <span className="flex-1 space-y-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{p.title}</span>
                        <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm whitespace-nowrap">
                          {p.price}
                        </span>
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{p.note}</span>
                    </span>
                  </label>
                ))}
              </fieldset>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  3. E-mail de cadastro
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <CouponCodeInput
                  value={couponCode}
                  onChange={setCouponCode}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 px-6 text-sm sm:text-base shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01]"
              >
                Continuar para pagamento seguro →
              </button>
            </form>
          ) : plan === "card_recurring" ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowBrick(false)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                ← Voltar e alterar dados
              </button>
              <MercadoPagoSubscriptionBrick
                amount={monthlyCents}
                payerEmail={email}
                segment={segment}
                couponCode={couponCode}
                onSuccess={() => {}}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowBrick(false)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                ← Voltar e alterar dados
              </button>
              <MercadoPagoPaymentBrick
                amount={amountCents}
                payerEmail={email}
                kind={plan === "annual" ? "subscription_annual" : "subscription_monthly"}
                segment={segment}
                couponCode={couponCode}
                onSuccess={() => {}}
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
