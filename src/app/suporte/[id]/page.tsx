import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";
import { ConfirmResolveButton, SupportReplyForm } from "@/components/support-forms";
import { prisma } from "@/lib/prisma";
import {
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_STATUS_LABELS,
  normalizeSupportCategory,
  normalizeSupportStatus,
  supportStatusBadgeClass,
} from "@/lib/support";
import { closeSupportTicket } from "../actions";

export const dynamic = "force-dynamic";

export default async function SupportTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ticket = await prisma.supportTicket.findFirst({
    where: { id, userId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" }, include: { attachments: true } } },
  });

  if (!ticket) notFound();

  // Abrir a conversa é o que marca as respostas do suporte como lidas.
  await prisma.supportMessage.updateMany({
    where: { ticketId: ticket.id, fromAdmin: true, readByUser: false },
    data: { readByUser: true },
  });

  const status = normalizeSupportStatus(ticket.status);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
      <Link href="/suporte" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
        <ArrowLeft className="h-4 w-4" /> Todos os chamados
      </Link>

      <header className="mt-4 mb-8">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{ticket.subject}</h1>
          <span
            className={`shrink-0 text-xs font-semibold rounded-full px-2.5 py-1 ${supportStatusBadgeClass(status)}`}
          >
            {SUPPORT_STATUS_LABELS[status]}
          </span>
        </div>
        <p className="text-sm text-neutral-500 mt-2">
          {SUPPORT_CATEGORY_LABELS[normalizeSupportCategory(ticket.category)]}
          {" · aberto em "}
          {ticket.createdAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
        </p>
      </header>

      <div className="rounded-2xl border border-neutral-200/80 bg-white/50 p-3 dark:border-neutral-800 dark:bg-neutral-950/40 sm:p-5">
      <div className="space-y-4">
        {ticket.messages.map((message) => (
          <article
            key={message.id}
            className={`max-w-[92%] rounded-2xl border p-4 shadow-sm shadow-slate-900/5 ${
              message.fromAdmin
                ? "mr-auto border-blue-200 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/30"
                : "ml-auto border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold">
                {message.fromAdmin ? "Suporte CarreirasMatch" : "Você"}
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

      <SupportReplyForm ticketId={ticket.id} />
      {status !== "resolved" && (
        <form className="mt-3 flex justify-end">
          <ConfirmResolveButton formAction={closeSupportTicket.bind(null, ticket.id)} />
        </form>
      )}
      </div>

      {status === "resolved" && (
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-neutral-500">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Chamado resolvido. Ao responder, ele será reaberto.
        </p>
      )}
    </main>
  );
}
