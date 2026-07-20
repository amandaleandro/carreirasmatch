import Link from "next/link";
import { requireAuthPage } from "@/lib/require-auth-page";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/freelance";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando",
  accepted: "✓ Aceita",
  rejected: "Recusada",
  withdrawn: "Retirada",
};

export default async function MyProposalsPage() {
  const session = await requireAuthPage();

  const proposals = await prisma.freelanceProposal.findMany({
    where: { freelancerUserId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { project: { select: { id: true, title: true, status: true } } },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-6">
      <Link href="/freelancer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Painel freelancer</Link>
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Minhas propostas</h1>
        <Link href="/projetos" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Buscar projetos</Link>
      </header>

      {proposals.length === 0 ? (
        <p className="text-neutral-500 py-12 text-center">Você ainda não enviou propostas.</p>
      ) : (
        <div className="space-y-3">
          {proposals.map((p) => (
            <Link key={p.id} href={`/projetos/${p.project.id}`} className="block rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-blue-400 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-semibold truncate">{p.project.title}</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    Sua proposta: {formatCents(p.bidCents)}{p.estimatedDays ? ` · ${p.estimatedDays} dia(s)` : ""}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-neutral-100 dark:bg-white/5 px-3 py-1 text-xs font-semibold">{STATUS_LABEL[p.status] ?? p.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
