"use client";

import { useState } from "react";
import { MercadoPagoSubscriptionBrick } from "@/components/mercadopago-subscription-brick";
import { MercadoPagoPaymentBrick } from "@/components/mercadopago-payment-brick";
import { CouponCodeInput } from "@/components/coupon-code-input";
import { parseBRLToCents, formatCentsToBRL } from "@/lib/pricing";

type PlanId = "card_recurring" | "monthly_oneoff" | "annual";

export function BillingSection({
  monthlyPrice,
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
  const [plan, setPlan] = useState<PlanId>("card_recurring");
  const [showManage, setShowManage] = useState(false);
  const [manageBusy, setManageBusy] = useState(false);
  const [manageMessage, setManageMessage] = useState<string | null>(null);

  async function manageSubscription(action: "pause" | "cancel") {
    setManageBusy(true);
    setManageMessage(null);
    try {
      const res = await fetch("/api/billing/subscription/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setManageMessage(data.error ?? "Não foi possível concluir. Tente novamente.");
      } else {
        setManageMessage(
          action === "pause"
            ? "Renovação pausada. Seu acesso continua até o fim do período já pago, e você reativa quando quiser."
            : "Renovação cancelada. Seu acesso continua até o fim do período já pago."
        );
      }
    } catch {
      setManageMessage("Falha de conexão. Tente novamente.");
    } finally {
      setManageBusy(false);
    }
  }

  const isActive = subscriptionStatus === "active";
  const monthlyCents = parseBRLToCents(monthlyPrice);
  const annualCents = monthlyCents * 10;
  const amountCents = plan === "annual" ? annualCents : monthlyCents;

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

  return (
    <div className="space-y-4">
      {isActive && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Assinatura ativa{currentPeriodEnd ? ` até ${new Date(currentPeriodEnd).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}` : ""}.
        </p>
      )}

      {!showBrick && (
        <div className="space-y-3">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium mb-1">{isActive ? "Renovar / mudar plano" : "Escolha como pagar"}</legend>
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
                  name="billing-plan"
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

          <button
            type="button"
            onClick={() => setShowBrick(true)}
            className="rounded-xl bg-blue-600 text-white font-semibold px-6 py-3 text-sm shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all"
          >
            {isActive ? "Continuar" : "Ir para pagamento"}
          </button>
        </div>
      )}

      {showBrick && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowBrick(false)}
            className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            ← Alterar plano
          </button>

          <div className="rounded-md bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-sm flex items-center justify-between">
            <span className="font-medium">{plans.find((p) => p.id === plan)?.title}</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{plans.find((p) => p.id === plan)?.price}</span>
          </div>

          <CouponCodeInput value={couponCode} onChange={setCouponCode} />

          {plan === "card_recurring" ? (
            <MercadoPagoSubscriptionBrick
              amount={amountCents / 100}
              payerEmail={payerEmail}
              couponCode={couponCode}
              onSuccess={() => window.location.reload()}
            />
          ) : (
            <MercadoPagoPaymentBrick
              amount={amountCents / 100}
              kind={plan === "annual" ? "subscription_annual" : "subscription_monthly"}
              payerEmail={payerEmail}
              couponCode={couponCode}
              onSuccess={() => window.location.reload()}
            />
          )}
        </div>
      )}

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Cartão recorrente renova sozinho. Pix e anual são pagamento único e você renova quando quiser. Processado pelo Mercado Pago.
      </p>

      {isActive && !showManage && (
        <button
          type="button"
          onClick={() => setShowManage(true)}
          className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline"
        >
          Precisa pausar ou cancelar a renovação?
        </button>
      )}

      {isActive && showManage && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
          <p className="text-sm font-semibold">Conseguiu a vaga ou precisa de um tempo? 🎉</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Você pode <strong>pausar a renovação</strong> em vez de cancelar: as cobranças param, seu acesso vale até o
            fim do período já pago, e seu histórico de análises e candidaturas fica guardado para quando precisar de novo.
          </p>
          {manageMessage ? (
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{manageMessage}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={manageBusy}
                onClick={() => manageSubscription("pause")}
                className="rounded-lg bg-blue-600 text-white text-xs font-bold px-4 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Pausar renovação
              </button>
              <button
                type="button"
                disabled={manageBusy}
                onClick={() => manageSubscription("cancel")}
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-semibold px-4 py-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                Cancelar de vez
              </button>
              <button
                type="button"
                disabled={manageBusy}
                onClick={() => setShowManage(false)}
                className="text-xs text-neutral-500 hover:underline px-2 py-2"
              >
                Voltar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
