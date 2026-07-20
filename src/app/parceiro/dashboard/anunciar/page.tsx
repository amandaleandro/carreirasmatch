import { requirePartnerPage } from "@/lib/partner-auth";
import { AD_PACKS } from "@/lib/partner-billing";
import { PartnerBillingCheckout } from "@/components/partner-billing-checkout";
import { PartnerShell } from "@/components/partner-shell";

export const dynamic = "force-dynamic";

export default async function PartnerBillingPage() {
  const { partner } = await requirePartnerPage();

  return (
    <PartnerShell partnerName={partner.name} logoUrl={partner.logoUrl} credits={partner.credits}>
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Destaques & Planos
          </h1>
          <p className="text-neutral-500 mt-2">
            Adquira créditos de destaque para exibir seus cursos no topo da nossa busca, garantindo mais visibilidade e acessos.
          </p>
        </header>

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Créditos de Destaque</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
              {partner.credits} {partner.credits === 1 ? "crédito disponível" : "créditos disponíveis"}
            </p>
          </div>
        </div>

        <PartnerBillingCheckout packs={AD_PACKS} payerEmail={partner.email} />
      </div>
    </PartnerShell>
  );
}
