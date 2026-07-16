import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/admin";
import {
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_STATUSES,
  SUPPORT_STATUS_ADMIN_LABELS,
  normalizeSupportCategory,
  normalizeSupportStatus,
  supportStatusBadgeClass,
} from "@/lib/support";
import { formatBrazilDateTime } from "@/lib/brazil";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  await requireAdminPage();

  const tickets = await prisma.supportTicket.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      user: { select: { email: true, name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const counts = Object.fromEntries(
    SUPPORT_STATUSES.map((status) => [
      status,
      tickets.filter((ticket) => normalizeSupportStatus(ticket.status) === status).length,
    ])
  ) as Record<(typeof SUPPORT_STATUSES)[number], number>;

  return (
    <main className="max-w-5xl mx-auto px-4 py-12 w-full">
      <Link href="/admin" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar para o admin
      </Link>

      <header className="mt-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Suporte</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Fila de chamados dos usuários. &quot;Aguardando resposta&quot; é o que
          precisa de você.
        </p>
      </header>

      <section className="grid grid-cols-3 gap-4 mb-8">
        {SUPPORT_STATUSES.map((status) => (
          <div
            key={status}
            className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 shadow-sm shadow-slate-900/5"
          >
            <p className="text-2xl font-bold text-blue-600">{counts[status]}</p>
            <p className="text-xs text-neutral-500 mt-1">{SUPPORT_STATUS_ADMIN_LABELS[status]}</p>
          </div>
        ))}
      </section>

      {tickets.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhum chamado aberto até agora.</p>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const status = normalizeSupportStatus(ticket.status);
            return (
              <Link
                key={ticket.id}
                href={`/admin/suporte/${ticket.id}`}
                className="block rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 shadow-sm shadow-slate-900/5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-sm font-semibold leading-snug">{ticket.subject}</h2>
                  <span
                    className={`shrink-0 text-[11px] font-semibold rounded-full px-2 py-0.5 ${supportStatusBadgeClass(status)}`}
                  >
                    {SUPPORT_STATUS_ADMIN_LABELS[status]}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {ticket.user.email ?? ticket.user.name ?? "usuário sem e-mail"}
                  {" · "}
                  {SUPPORT_CATEGORY_LABELS[normalizeSupportCategory(ticket.category)]}
                  {" · "}
                  {formatBrazilDateTime(ticket.updatedAt, {
                    year: undefined,
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {ticket.messages[0] && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2">
                    {ticket.messages[0].fromAdmin ? "Você: " : "Usuário: "}
                    {ticket.messages[0].body}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
