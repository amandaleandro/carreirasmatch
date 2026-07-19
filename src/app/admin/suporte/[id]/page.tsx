import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/admin";
import { AdminSupportReplyForm } from "@/components/support-forms";
import {
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_STATUSES,
  SUPPORT_STATUS_ADMIN_LABELS,
  normalizeSupportCategory,
  normalizeSupportStatus,
  supportStatusBadgeClass,
} from "@/lib/support";
import { adminSetSupportStatus } from "../actions";

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
      messages: { orderBy: { createdAt: "asc" }, include: { attachments: true } },
    },
  });

  if (!ticket) notFound();

  await prisma.supportMessage.updateMany({
    where: { ticketId: ticket.id, fromAdmin: false, readByAdmin: false },
    data: { readByAdmin: true },
  });

  const status = normalizeSupportStatus(ticket.status);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
      <Link href="/admin/suporte" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
        <ArrowLeft className="h-4 w-4" /> Voltar para a fila
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

      <div className="rounded-2xl border border-neutral-200/80 bg-white/50 p-3 dark:border-neutral-800 dark:bg-neutral-950/40 sm:p-5">
      <div className="space-y-4">
        {ticket.messages.map((message) => (
          <article
            key={message.id}
            className={`max-w-[92%] rounded-2xl border p-4 shadow-sm shadow-slate-900/5 ${
              message.fromAdmin
                ? "ml-auto border-blue-200 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/30"
                : "mr-auto border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900"
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
            {message.attachments.map((attachment) => (
              <a key={attachment.id} href={`/api/support/attachments/${attachment.id}`} className="mt-3 inline-flex items-center rounded-lg border border-current/15 px-3 py-2 text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300">
                Anexo: {attachment.fileName} ({Math.ceil(attachment.size / 1024)} KB)
              </a>
            ))}
          </article>
        ))}
      </div>

      <AdminSupportReplyForm ticketId={ticket.id} />
      </div>

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
