import { requireCompanyPage, FREE_SCREENING_LIMIT } from "@/lib/company-auth";
import { SCREENING_PACKS } from "@/lib/company-billing";
import { CompanyBillingCheckout } from "@/components/company-billing-checkout";

export const dynamic = "force-dynamic";

export default async function CompanyBillingPage() {
  const { company } = await requireCompanyPage();
  const freeRemaining = Math.max(0, FREE_SCREENING_LIMIT - company.screeningCount);
  const totalAvailable = freeRemaining + company.screeningCredits;

  return (
    <div>
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Créditos de triagem</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Cada triagem consome 1 crédito. Compre um pacote para continuar ranqueando currículos.
          </p>
        </header>

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500">Saldo disponível</p>
            <p className="text-2xl font-bold">{totalAvailable} {totalAvailable === 1 ? "triagem" : "triagens"}</p>
          </div>
          <div className="text-right text-xs text-neutral-500">
            {freeRemaining > 0 && <p>{freeRemaining} gratuita(s)</p>}
            <p>{company.screeningCredits} compradas</p>
          </div>
        </div>

        <CompanyBillingCheckout packs={SCREENING_PACKS} payerEmail={company.email} />
      </div>
    </div>
  );
}
