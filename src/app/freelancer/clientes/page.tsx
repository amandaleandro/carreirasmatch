import Link from "next/link";
import { requireAuthPage } from "@/lib/require-auth-page";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/freelance";

export const dynamic = "force-dynamic";

export default async function MyClientsPage() {
  const session = await requireAuthPage();

  const contracts = await prisma.freelanceContract.findMany({
    where: { freelancerUserId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { client: { select: { id: true, name: true } }, project: { select: { title: true } } },
  });

  const clientsMap = new Map<
    string,
    { name: string; totalCents: number; contractCount: number; completedCount: number; lastContractAt: Date; lastProjectTitle: string }
  >();

  for (const c of contracts) {
    const existing = clientsMap.get(c.clientUserId);
    if (existing) {
      existing.totalCents += c.freelancerPayoutCents;
      existing.contractCount += 1;
      if (c.status === "completed") existing.completedCount += 1;
      if (c.createdAt > existing.lastContractAt) {
        existing.lastContractAt = c.createdAt;
        existing.lastProjectTitle = c.project.title;
      }
    } else {
      clientsMap.set(c.clientUserId, {
        name: c.client.name ?? "Cliente não identificado",
        totalCents: c.freelancerPayoutCents,
        contractCount: 1,
        completedCount: c.status === "completed" ? 1 : 0,
        lastContractAt: c.createdAt,
        lastProjectTitle: c.project.title,
      });
    }
  }

  const clients = Array.from(clientsMap.values()).sort((a, b) => b.totalCents - a.totalCents);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-6">
      <Link href="/freelancer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Painel freelancer</Link>
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Meus clientes</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Histórico de relacionamento com quem já te contratou, consolidado a partir dos seus contratos.
        </p>
      </header>

      {clients.length === 0 ? (
        <p className="text-neutral-500 py-12 text-center">Você ainda não tem contratos com clientes.</p>
      ) : (
        <div className="space-y-3">
          {clients.map((client, i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-semibold truncate">{client.name}</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {client.contractCount} contrato{client.contractCount > 1 ? "s" : ""}
                    {client.completedCount > 0 && ` · ${client.completedCount} concluído${client.completedCount > 1 ? "s" : ""}`}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">Último projeto: {client.lastProjectTitle}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="block font-bold text-slate-900 dark:text-white">{formatCents(client.totalCents)}</span>
                  <span className="block text-xs text-neutral-500 mt-1">faturado no total</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
