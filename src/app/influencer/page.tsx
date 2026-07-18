import Link from "next/link";
import { requireInfluencerPage } from "@/lib/influencer";
import { prisma } from "@/lib/prisma";
import { commissionCents } from "@/lib/coupon-report";
import { InfluencerReferralLink } from "@/components/influencer-referral-link";

export const dynamic = "force-dynamic";

const PAYMENT_KIND_LABELS: Record<string, string> = {
  first_analysis: "Primeira Análise",
  diagnostic: "Diagnóstico",
  subscription: "Assinatura",
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function formatDate(date: Date | null | undefined) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function StatCard({ label, value, helper }: { label: string; value: string | number; helper: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-950">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{helper}</p>
    </div>
  );
}

export default async function InfluencerPage() {
  const { coupon } = await requireInfluencerPage();

  const [paidPayments, revenue, signups] = await Promise.all([
    // Vendas confirmadas atribuídas ao cupom, com quem comprou.
    prisma.payment.findMany({
      where: { couponId: coupon.id, status: "paid" },
      orderBy: { paidAt: "desc" },
      select: {
        id: true,
        kind: true,
        amount: true,
        discountCents: true,
        paidAt: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.payment.aggregate({
      where: { couponId: coupon.id, status: "paid" },
      _sum: { amount: true, discountCents: true },
      _count: { _all: true },
    }),
    // Cadastros feitos com o cupom (link ou campo manual), pagos ou não.
    prisma.user.findMany({
      where: { signupCouponId: coupon.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        careerSegment: true,
        subscription: { select: { status: true } },
        _count: { select: { payments: { where: { status: "paid" } } } },
      },
    }),
  ]);

  const netRevenueCents = revenue._sum.amount ?? 0;
  const discountGivenCents = revenue._sum.discountCents ?? 0;
  const grossRevenueCents = netRevenueCents + discountGivenCents;
  const commission = commissionCents(grossRevenueCents, coupon.commissionPercent);
  const paidCount = revenue._count._all;

  return (
    <main className="px-4 md:px-8 py-8 max-w-6xl mx-auto w-full space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Voltar para o dashboard
          </Link>
          <h1 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">Painel do influencer</h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
            Acompanhe as vendas e os cadastros gerados pelo seu cupom{" "}
            <span className="font-mono font-semibold">{coupon.code}</span>.
          </p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          Você tem acesso total ao sistema, sem pagamento.
        </div>
      </header>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="font-semibold">Seu link de indicação</h2>
        <p className="mt-1 mb-4 text-sm text-neutral-500">
          Quem se cadastrar por este link já entra com o seu cupom aplicado e aparece na sua lista de cadastros.
        </p>
        <InfluencerReferralLink code={coupon.code} />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Vendas confirmadas" value={paidCount} helper="Pagamentos aprovados com seu cupom" />
        <StatCard label="Cadastros" value={signups.length} helper="Pessoas que usaram seu cupom ao criar conta" />
        <StatCard label="Receita gerada" value={formatCurrency(grossRevenueCents)} helper="Valor cheio, antes do desconto" />
        <StatCard
          label="Sua comissão"
          value={formatCurrency(commission)}
          helper={`${coupon.commissionPercent}% sobre a receita gerada`}
        />
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="font-semibold">Vendas com o seu cupom</h2>
        <p className="mt-1 text-sm text-neutral-500">Apenas pagamentos confirmados.</p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="py-2 pr-4 font-medium">Cliente</th>
                <th className="py-2 pr-4 font-medium">Produto</th>
                <th className="py-2 pr-4 font-medium">Valor pago</th>
                <th className="py-2 pr-4 font-medium">Desconto</th>
                <th className="py-2 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
              {paidPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="py-3 pr-4">
                    <p className="font-medium">{payment.user.name ?? "Sem nome"}</p>
                    <p className="text-xs text-neutral-500">{payment.user.email ?? "-"}</p>
                  </td>
                  <td className="py-3 pr-4">{PAYMENT_KIND_LABELS[payment.kind] ?? payment.kind}</td>
                  <td className="py-3 pr-4 font-semibold">{formatCurrency(payment.amount)}</td>
                  <td className="py-3 pr-4 text-neutral-500">{formatCurrency(payment.discountCents)}</td>
                  <td className="py-3 text-neutral-500 whitespace-nowrap">
                    {formatDate(payment.paidAt ?? payment.createdAt)}
                  </td>
                </tr>
              ))}
              {paidPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-neutral-500">
                    Nenhuma venda confirmada com seu cupom ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="font-semibold">Cadastros pelo seu cupom</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Pessoas que criaram a conta com o seu código, mesmo que ainda não tenham comprado.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="py-2 pr-4 font-medium">Pessoa</th>
                <th className="py-2 pr-4 font-medium">Momento de carreira</th>
                <th className="py-2 pr-4 font-medium">Situação</th>
                <th className="py-2 font-medium">Cadastro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
              {signups.map((user) => {
                const isSubscriber = user.subscription?.status === "active";
                const hasPaid = user._count.payments > 0;
                const situation = isSubscriber ? "Assinante" : hasPaid ? "Comprou" : "Só cadastro";
                return (
                  <tr key={user.id}>
                    <td className="py-3 pr-4">
                      <p className="font-medium">{user.name ?? "Sem nome"}</p>
                      <p className="text-xs text-neutral-500">{user.email ?? "-"}</p>
                    </td>
                    <td className="py-3 pr-4 text-neutral-600 dark:text-neutral-400">
                      {user.careerSegment ?? "-"}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${
                          isSubscriber || hasPaid
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                            : "bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800"
                        }`}
                      >
                        {situation}
                      </span>
                    </td>
                    <td className="py-3 text-neutral-500 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                  </tr>
                );
              })}
              {signups.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-neutral-500">
                    Ninguém se cadastrou com o seu cupom ainda. Compartilhe seu link!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
