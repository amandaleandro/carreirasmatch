import Link from "next/link";
import {
  Sparkles,
  ShoppingBag,
  Users,
  DollarSign,
  Percent,
  TrendingUp,
  Award,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { requireInfluencerPage } from "@/lib/influencer";
import { prisma } from "@/lib/prisma";
import { commissionCents } from "@/lib/coupon-report";
import { InfluencerReferralLink } from "@/components/influencer-referral-link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Painel do Influencer & Afiliado | CarreirasMatch",
  description: "Acompanhe suas vendas, comissões e cadastros realizados pelo seu cupom exclusivo.",
};

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

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "indigo" | "emerald" | "amber";
}) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{helper}</p>
    </div>
  );
}

export default async function InfluencerPage() {
  const { coupon } = await requireInfluencerPage();

  const [paidPayments, revenue, signups] = await Promise.all([
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
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao painel principal</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Painel do Influencer & Parceiro
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Acompanhe as vendas e cadastros gerados pelo seu cupom{" "}
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-900/50">
              {coupon.code}
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 shrink-0">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Acesso VIP ilimitado ativo para sua conta</span>
        </div>
      </div>

      {/* Referral Link Card */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="font-bold text-slate-900 dark:text-white text-base">Seu Link de Indicação Exclusivo</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Compartilhe este link nas suas redes. Quem se cadastrar já entra com seu cupom aplicado e aparece no seu painel.
        </p>
        <div className="pt-1">
          <InfluencerReferralLink code={coupon.code} />
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          label="Vendas Confirmadas"
          value={paidCount}
          helper="Pagamentos aprovados com seu cupom"
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard
          label="Total de Cadastros"
          value={signups.length}
          helper="Contas criadas através do seu link"
          icon={Users}
          color="indigo"
        />
        <StatCard
          label="Receita Gerada"
          value={formatCurrency(grossRevenueCents)}
          helper="Valor bruto movimentado"
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          label="Sua Comissão Total"
          value={formatCurrency(commission)}
          helper={`${coupon.commissionPercent}% sobre o valor gerado`}
          icon={DollarSign}
          color="emerald"
        />
      </section>

      {/* Confirmed Sales Table */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="font-bold text-slate-900 dark:text-white text-base">Vendas Realizadas</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pagamentos confirmados vinculados ao seu cupom.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 pr-4 font-bold">Cliente</th>
                <th className="py-3 pr-4 font-bold">Produto</th>
                <th className="py-3 pr-4 font-bold">Valor Pago</th>
                <th className="py-3 pr-4 font-bold">Desconto</th>
                <th className="py-3 font-bold">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paidPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 pr-4">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{payment.user.name ?? "Sem nome"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{payment.user.email ?? "-"}</p>
                  </td>
                  <td className="py-3.5 pr-4 font-medium text-slate-700 dark:text-slate-300">
                    {PAYMENT_KIND_LABELS[payment.kind] ?? payment.kind}
                  </td>
                  <td className="py-3.5 pr-4 font-bold text-slate-900 dark:text-white">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="py-3.5 pr-4 text-xs text-slate-500">{formatCurrency(payment.discountCents)}</td>
                  <td className="py-3.5 text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(payment.paidAt ?? payment.createdAt)}
                  </td>
                </tr>
              ))}
              {paidPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-500">
                    Nenhuma venda confirmada com seu cupom até o momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Signups Table */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="font-bold text-slate-900 dark:text-white text-base">Cadastros via Cupom</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pessoas que criaram a conta com o seu link ou código.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 pr-4 font-bold">Usuário</th>
                <th className="py-3 pr-4 font-bold">Momento de Carreira</th>
                <th className="py-3 pr-4 font-bold">Status</th>
                <th className="py-3 font-bold">Data do Cadastro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {signups.map((user) => {
                const isSubscriber = user.subscription?.status === "active";
                const hasPaid = user._count.payments > 0;
                const situation = isSubscriber ? "Assinante" : hasPaid ? "Comprou" : "Cadastrado";
                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pr-4">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{user.name ?? "Sem nome"}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user.email ?? "-"}</p>
                    </td>
                    <td className="py-3.5 pr-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                      {user.careerSegment ?? "-"}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-bold ${
                          isSubscriber || hasPaid
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {(isSubscriber || hasPaid) && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        {situation}
                      </span>
                    </td>
                    <td className="py-3.5 text-xs text-slate-500 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                  </tr>
                );
              })}
              {signups.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-slate-500">
                    Nenhum cadastro realizado via cupom ainda. Compartilhe seu link!
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
