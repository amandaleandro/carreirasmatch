import Link from "next/link";
import { requireAuthPage } from "@/lib/require-auth-page";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/freelance";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  active: "Em andamento",
  delivered: "Entregue, aguardando confirmação",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const PAYOUT_LABEL: Record<string, string> = {
  waiting: "Pagamento pendente",
  ready: "Pronto para repasse",
  released: "Repassado",
};

export default async function MyContractsPage() {
  const session = await requireAuthPage();

  const contracts = await prisma.freelanceContract.findMany({
    where: { freelancerUserId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { project: { select: { title: true } }, client: { select: { name: true } } },
  });

  const received = contracts
    .filter((c) => c.payoutStatus === "released")
    .reduce((sum, c) => sum + c.freelancerPayoutCents, 0);
  const toReceive = contracts
    .filter((c) => c.paymentStatus === "paid" && c.payoutStatus !== "released")
    .reduce((sum, c) => sum + c.freelancerPayoutCents, 0);
  const inProgress = contracts
    .filter((c) => c.status === "active" || c.status === "delivered")
    .reduce((sum, c) => sum + c.freelancerPayoutCents, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-6">
      <Link href="/freelancer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Painel freelancer</Link>
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Meus contratos</h1>
        <p className="text-sm text-neutral-500 mt-1">Contratos em que você é o freelancer contratado.</p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Recebido</p>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{formatCents(received)}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">A receber</p>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{formatCents(toReceive)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Em andamento</p>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{formatCents(inProgress)}</p>
        </div>
      </div>

      {contracts.length === 0 ? (
        <p className="text-neutral-500 py-12 text-center">Você ainda não fechou nenhum contrato como freelancer.</p>
      ) : (
        <div className="space-y-3">
          {contracts.map((c) => (
            <Link key={c.id} href={`/projetos/${c.projectId}`} className="block rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-blue-400 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-semibold truncate">{c.project.title}</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    Cliente: {c.client.name ?? "Não informado"} · {formatCents(c.freelancerPayoutCents)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="block rounded-full bg-neutral-100 dark:bg-white/5 px-3 py-1 text-xs font-semibold">{STATUS_LABEL[c.status] ?? c.status}</span>
                  <span className="block text-xs text-neutral-500 mt-1">{PAYOUT_LABEL[c.payoutStatus] ?? c.payoutStatus}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
