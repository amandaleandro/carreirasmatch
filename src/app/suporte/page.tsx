import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CircleHelp,
  MessageSquare,
  Plus,
  LifeBuoy,
} from "lucide-react";
import { auth } from "@/auth";
import { NewSupportTicketForm } from "@/components/support-forms";
import { prisma } from "@/lib/prisma";
import {
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_STATUS_LABELS,
  normalizeSupportCategory,
  normalizeSupportStatus,
  supportStatusBadgeClass,
} from "@/lib/support";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Central de Suporte | CarreirasMatch",
  description: "Abra um novo chamado ou acompanhe o andamento do seu atendimento.",
};

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; subject?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const defaults = await searchParams;

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: { select: { messages: { where: { fromAdmin: true, readByUser: false } } } },
    },
  });

  const unreadTotal = tickets.reduce((total, ticket) => total + ticket._count.messages, 0);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 md:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <LifeBuoy className="w-3.5 h-3.5" />
            Central de Atendimento
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Como podemos ajudar você hoje?
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Abra um novo chamado ou acompanhe as respostas da nossa equipe de suporte.
          </p>
        </div>

        <Link
          href="/ajuda"
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-2 shadow-2xs shrink-0 self-start sm:self-center"
        >
          <CircleHelp className="w-4 h-4 text-blue-500" />
          <span>Central de Ajuda (FAQ)</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,.85fr)]">
        {/* Left Column: Tickets List */}
        <section className="order-2 lg:order-1 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Seus chamados ({tickets.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Histórico de solicitações e interações.
              </p>
            </div>

            {unreadTotal > 0 && (
              <span className="rounded-full bg-blue-600 text-white px-3 py-1 text-xs font-bold shadow-md shadow-blue-500/20">
                {unreadTotal} nova{unreadTotal > 1 ? "s" : ""} resposta{unreadTotal > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {tickets.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-8 sm:p-12 text-center shadow-2xs space-y-3">
              <MessageSquare className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Nenhum chamado aberto</h3>
              <p className="mx-auto max-w-xs text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Quando você tiver dúvidas ou precisar de ajuda, suas conversas aparecerão organizadas aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const status = normalizeSupportStatus(ticket.status);
                const unread = ticket._count.messages;
                return (
                  <Link
                    key={ticket.id}
                    href={`/suporte/${ticket.id}`}
                    className={`group block rounded-2xl border p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md bg-white dark:bg-slate-900 ${
                      unread
                        ? "border-blue-500 ring-2 ring-blue-500/10 dark:border-blue-500"
                        : "border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          {unread > 0 && (
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600 animate-ping" title="Nova resposta não lida" />
                          )}
                          <h3 className="truncate font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {ticket.subject}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {SUPPORT_CATEGORY_LABELS[normalizeSupportCategory(ticket.category)]} · Atualizado em{" "}
                          {ticket.updatedAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${supportStatusBadgeClass(
                          status
                        )}`}
                      >
                        {SUPPORT_STATUS_LABELS[status]}
                      </span>
                    </div>

                    {ticket.messages[0] && (
                      <p className="mt-3 line-clamp-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                        <strong className="text-slate-700 dark:text-slate-200">
                          {ticket.messages[0].fromAdmin ? "Suporte: " : "Você: "}
                        </strong>
                        {ticket.messages[0].body}
                      </p>
                    )}

                    <div className="mt-3.5 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                      <span>Abrir conversa</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: New Ticket Form (Sticky) */}
        <section className="order-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm lg:order-2 lg:sticky lg:top-24 sm:p-6 space-y-4">
          <div className="flex items-start gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <span className="rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 p-2.5 shrink-0">
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">Abrir novo chamado</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Respondemos por aqui e por e-mail, normalmente em até 1 dia útil.
              </p>
            </div>
          </div>

          <NewSupportTicketForm defaultCategory={defaults.category} defaultSubject={defaults.subject?.slice(0, 120)} />
        </section>
      </div>
    </main>
  );
}
