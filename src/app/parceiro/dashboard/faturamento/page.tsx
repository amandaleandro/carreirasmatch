import { requirePartnerPage } from "@/lib/partner-auth";
import { prisma } from "@/lib/prisma";
import { PartnerShell } from "@/components/partner-shell";
import { CreditCard, Calendar, ShieldCheck, HelpCircle } from "lucide-react";

export const dynamic = "force-dynamic";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PartnerBillingHistoryPage() {
  const { partner } = await requirePartnerPage();

  const payments = await prisma.partnerPayment.findMany({
    where: { partnerId: partner.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PartnerShell partnerName={partner.name} logoUrl={partner.logoUrl} credits={partner.credits}>
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        <header>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Histórico Financeiro
          </h1>
          <p className="text-neutral-500 mt-1">
            Acompanhe suas transações de compra de pacotes de anúncio e créditos na plataforma.
          </p>
        </header>

        {payments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 p-12 text-center text-neutral-500">
            Nenhuma transação financeira registrada até o momento.
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    <th className="p-4 pl-6">ID Mercado Pago</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Créditos</th>
                    <th className="p-4">Valor</th>
                    <th className="p-4">Data</th>
                    <th className="p-4 pr-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-sm">
                  {payments.map((p) => {
                    const statusColors: Record<string, string> = {
                      paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-900/30",
                      pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/50 dark:border-amber-900/30",
                      cancelled: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200/50 dark:border-red-900/30",
                    };

                    const statusLabels: Record<string, string> = {
                      paid: "Aprovado",
                      pending: "Pendente",
                      cancelled: "Cancelado / Recusado",
                    };

                    return (
                      <tr key={p.id} className="hover:bg-neutral-50/50 dark:hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 pl-6 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                          {p.mpPaymentId}
                        </td>
                        <td className="p-4 font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-neutral-400" />
                          Compra de Créditos
                        </td>
                        <td className="p-4 text-neutral-700 dark:text-neutral-300">
                          {p.credits} destaques
                        </td>
                        <td className="p-4 font-semibold text-neutral-900 dark:text-white">
                          {formatBRL(p.amount)}
                        </td>
                        <td className="p-4 text-neutral-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(p.createdAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </div>
                        </td>
                        <td className="p-4 pr-6 text-center">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold border ${
                              statusColors[p.status] ?? "bg-neutral-100 text-neutral-600 border-neutral-200"
                            }`}
                          >
                            {statusLabels[p.status] ?? p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PartnerShell>
  );
}
