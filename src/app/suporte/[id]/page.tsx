import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShieldCheck, User } from "lucide-react";
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

  // Mark admin messages as read by user
  await prisma.supportMessage.updateMany({
    where: { ticketId: ticket.id, fromAdmin: true, readByUser: false },
    data: { readByUser: true },
  });

  const status = normalizeSupportStatus(ticket.status);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 md:px-8 py-8 space-y-6">
      <Link
        href="/suporte"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar para todos os chamados</span>
      </Link>

      <header className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-md px-2.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {SUPPORT_CATEGORY_LABELS[normalizeSupportCategory(ticket.category)]}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug">
              {ticket.subject}
            </h1>
          </div>

          <span
            className={`shrink-0 text-xs font-bold rounded-full px-3 py-1 ${supportStatusBadgeClass(status)}`}
          >
            {SUPPORT_STATUS_LABELS[status]}
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
          Chamado aberto em{" "}
          <strong className="text-slate-700 dark:text-slate-300">
            {ticket.createdAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
          </strong>
        </p>
      </header>

      {/* Messages Thread Container */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 sm:p-6 space-y-6 shadow-sm">
        <div className="space-y-4">
          {ticket.messages.map((message) => {
            const isAdmin = message.fromAdmin;
            return (
              <article
                key={message.id}
                className={`max-w-[92%] sm:max-w-[85%] rounded-2xl border p-4 sm:p-5 shadow-2xs space-y-2 ${
                  isAdmin
                    ? "mr-auto border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30"
                    : "ml-auto border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200/60 dark:border-slate-800/60 text-xs">
                  <span className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                    {isAdmin ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Suporte CarreirasMatch</span>
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Você</span>
                      </>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {message.createdAt.toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {message.body}
                </p>

                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className="pt-2">
                    <a
                      href={`/api/support/attachments/${attachment.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:underline"
                    >
                      <span>📎 Anexo: {attachment.fileName}</span>
                      <span className="text-[10px] text-blue-500">({Math.ceil(attachment.size / 1024)} KB)</span>
                    </a>
                  </div>
                ))}
              </article>
            );
          })}
        </div>

        {/* Reply Form */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <SupportReplyForm ticketId={ticket.id} />
          {status !== "resolved" && (
            <form className="mt-4 flex justify-end">
              <ConfirmResolveButton formAction={closeSupportTicket.bind(null, ticket.id)} />
            </form>
          )}
        </div>
      </div>

      {status === "resolved" && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>Chamado marcado como resolvido. Ao enviar uma nova mensagem, ele será automaticamente reaberto.</span>
        </div>
      )}
    </main>
  );
}
