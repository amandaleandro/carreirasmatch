import { CreditCard, Sparkles, CheckCircle2, Infinity as InfinityIcon } from "lucide-react";
import { requireCompanyPage, FREE_SCREENING_LIMIT } from "@/lib/company-auth";
import { SCREENING_PACKS, COMPANY_PLAN, hasActiveCompanyPlan } from "@/lib/company-billing";
import { CompanyBillingCheckout } from "@/components/company-billing-checkout";
import { CompanySubscriptionCheckout } from "@/components/company-subscription-checkout";

export const dynamic = "force-dynamic";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function CompanyBillingPage() {
  const { company } = await requireCompanyPage();
  const freeRemaining = Math.max(0, FREE_SCREENING_LIMIT - company.screeningCount);
  const totalAvailable = freeRemaining + company.screeningCredits;
  const planActive = hasActiveCompanyPlan(company);

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <CreditCard className="w-3.5 h-3.5" />
          Faturamento & Pacotes
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Créditos de Triagem
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm max-w-2xl">
          Cada triagem com IA consome 1 crédito. Compre um pacote avulso para continuar ranqueando currículos recebidos sem mensalidade fixa.
        </p>
      </div>

      {/* Plano Ilimitado */}
      <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <InfinityIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{COMPANY_PLAN.label}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Vagas e triagens de currículo por IA sem limite, por {formatBRL(COMPANY_PLAN.priceCents)}/mês.
            </p>
          </div>
        </div>

        {planActive ? (
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Plano ativo — renova em {company.planCurrentPeriodEnd?.toLocaleDateString("pt-BR")}
          </p>
        ) : (
          <CompanySubscriptionCheckout priceCents={COMPANY_PLAN.priceCents} payerEmail={company.email} />
        )}
      </div>

      {/* Saldo Disponível Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Saldo Atual de Triagens
            </p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {planActive ? "Ilimitado" : totalAvailable}{" "}
              {!planActive && (
                <span className="text-lg font-semibold text-slate-500">{totalAvailable === 1 ? "triagem" : "triagens"}</span>
              )}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right text-xs text-slate-500 space-y-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          {freeRemaining > 0 && (
            <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {freeRemaining} gratuita(s) restante(s)
            </p>
          )}
          <p className="font-medium text-slate-600 dark:text-slate-300">{company.screeningCredits} créditos comprados</p>
        </div>
      </div>

      {/* Checkout Options */}
      {!planActive && <CompanyBillingCheckout packs={SCREENING_PACKS} payerEmail={company.email} />}
    </main>
  );
}
