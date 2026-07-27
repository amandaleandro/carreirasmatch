import Link from "next/link";
import { requireAdminPage } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/freelance";
import { markPayoutReleased } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPayoutsPage() {
  await requireAdminPage();

  const [pending, released] = await Promise.all([
    prisma.freelanceContract.findMany({
      where: { payoutStatus: "ready" },
      orderBy: { completedAt: "asc" },
      include: {
        project: { select: { title: true } },
        freelancer: { select: { name: true, email: true, freelancerProfile: { select: { pixKey: true } } } },
      },
    }),
    prisma.freelanceContract.findMany({
      where: { payoutStatus: "released" },
      orderBy: { payoutReleasedAt: "desc" },
      take: 20,
      include: {
        project: { select: { title: true } },
        freelancer: { select: { name: true, email: true } },
      },
    }),
  ]);

  return (
    <main className="px-4 md:px-8 py-8 max-w-5xl mx-auto w-full space-y-8 font-sans">
      <div>
        <Link
          href="/admin"
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 mb-2"
        >
          ← Voltar ao painel geral
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight">Repasses de freelancers</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
          O Mercado Pago não transfere para chave Pix de terceiros automaticamente. Transfira manualmente e confirme aqui.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Aguardando transferência ({pending.length})</h2>
        {pending.length === 0 && <p className="text-sm text-slate-500">Nenhum repasse pendente.</p>}
        <div className="space-y-3">
          {pending.map((c) => (
            <div key={c.id} className="rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm">
                <p className="font-semibold">{c.project.title}</p>
                <p className="text-slate-600 dark:text-slate-400">
                  {c.freelancer.name ?? c.freelancer.email} · Repassar {formatCents(c.freelancerPayoutCents)} (bruto {formatCents(c.agreedCents)}, comissão {formatCents(c.platformFeeCents)})
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Chave Pix: {c.freelancer.freelancerProfile?.pixKey || "não informada"}
                </p>
              </div>
              <form action={markPayoutReleased.bind(null, c.id)}>
                <button type="submit" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 shrink-0">
                  Marcar como transferido
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Transferidos recentemente</h2>
        {released.length === 0 && <p className="text-sm text-slate-500">Nenhum repasse ainda.</p>}
        <div className="space-y-2">
          {released.map((c) => (
            <div key={c.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 text-sm flex items-center justify-between">
              <span>{c.project.title} · {c.freelancer.name ?? c.freelancer.email}</span>
              <span className="text-slate-500">{formatCents(c.freelancerPayoutCents)} · {c.payoutReleasedAt?.toLocaleDateString("pt-BR")}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
