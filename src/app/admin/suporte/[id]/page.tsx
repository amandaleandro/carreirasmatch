import Link from "next/link";
import { notFound } from "next/navigation";
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
import { adminReplySupportTicket, adminSetSupportStatus } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminSupportTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true, createdAt: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!ticket) notFound();

  await prisma.supportMessage.updateMany({
    where: { ticketId: ticket.id, fromAdmin: false, readByAdmin: false },
    data: { readByAdmin: true },
  });

  const status = normalizeSupportStatus(ticket.status);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link href="/admin/suporte" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar para a fila
      </Link>

      <header className="mt-4 mb-8">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{ticket.subject}</h1>
          <span
            className={`shrink-0 text-xs font-semibold rounded-full px-2.5 py-1 ${supportStatusBadgeClass(status)}`}
          >
            {SUPPORT_STATUS_ADMIN_LABELS[status]}
          </span>
        </div>
        <p className="text-sm text-neutral-500 mt-2">
          {ticket.user.email ?? ticket.user.name ?? "usuário sem e-mail"}
          {" · "}
          {SUPPORT_CATEGORY_LABELS[normalizeSupportCategory(ticket.category)]}
          {" · cliente desde "}
          {ticket.user.createdAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
        </p>
      </header>

      <div className="space-y-4">
        {ticket.messages.map((message) => (
          <article
            key={message.id}
            className={`rounded-2xl border p-4 shadow-sm shadow-slate-900/5 ${
              message.fromAdmin
                ? "border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/20"
                : "border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold">
                {message.fromAdmin ? "Você (suporte)" : "Usuário"}
              </span>
              <span className="text-xs text-neutral-500">
                {message.createdAt.toLocaleString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
              {message.body}
            </p>
          </article>
        ))}
      </div>

      <form action={adminReplySupportTicket.bind(null, ticket.id)} className="mt-6 space-y-3">
        <label htmlFor="body" className="block text-sm font-medium">
          Responder ao usuário
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={5}
          maxLength={4000}
          placeholder="Sua resposta aparece na página de suporte do usuário."
          className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
        />
        <button
          type="submit"
          className="w-full rounded-xl bg-blue-600 text-white font-semibold px-5 py-2.5 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all"
        >
          Enviar resposta
        </button>
      </form>

      <form
        action={adminSetSupportStatus.bind(null, ticket.id)}
        className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center"
      >
        <label htmlFor="status" className="text-sm font-medium">
          Mudar status sem responder
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status}
          className="flex-1 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm"
        >
          {SUPPORT_STATUSES.map((option) => (
            <option key={option} value={option}>
              {SUPPORT_STATUS_ADMIN_LABELS[option]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl border border-neutral-200 dark:border-neutral-800 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
        >
          Salvar
        </button>
      </form>
    </main>
  );
}
