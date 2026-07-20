import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CircleHelp, MessageCircle, Plus } from "lucide-react";
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
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
      <header className="mb-8">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
          Suporte
        </span>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Como podemos ajudar?</h1>
        <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-400">
          Envie sua dúvida e acompanhe a resposta por aqui. Antes de abrir um chamado,
          você também pode consultar as respostas mais comuns.
        </p>
        <Link href="/ajuda" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
          <CircleHelp className="h-4 w-4" /> Consultar a Central de Ajuda
        </Link>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
      <section className="order-2 lg:order-1">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Seus chamados</h2>
            <p className="mt-1 text-sm text-neutral-500">Acompanhe conversas abertas e anteriores.</p>
          </div>
          {unreadTotal > 0 && <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">{unreadTotal} nova{unreadTotal > 1 ? "s" : ""}</span>}
        </div>
        {tickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-6 py-12 text-center dark:border-neutral-700 dark:bg-neutral-950/60">
            <MessageCircle className="mx-auto h-9 w-9 text-neutral-400" />
            <h3 className="mt-3 font-semibold">Nenhum chamado por aqui</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">Quando você enviar uma dúvida, a conversa e as respostas aparecerão nesta área.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const status = normalizeSupportStatus(ticket.status);
              const unread = ticket._count.messages;
              return (
                <Link key={ticket.id} href={`/suporte/${ticket.id}`} className={`group block rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-neutral-950 ${unread ? "border-blue-300 ring-2 ring-blue-500/10 dark:border-blue-800" : "border-neutral-200/80 dark:border-neutral-800"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {unread > 0 && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" aria-label="Nova resposta" />}
                        <h3 className="truncate text-sm font-semibold">{ticket.subject}</h3>
                      </div>
                      <p className="mt-1 text-xs text-neutral-500">{SUPPORT_CATEGORY_LABELS[normalizeSupportCategory(ticket.category)]} · Atualizado em {ticket.updatedAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${supportStatusBadgeClass(status)}`}>{SUPPORT_STATUS_LABELS[status]}</span>
                  </div>
                  {ticket.messages[0] && <p className="mt-3 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{ticket.messages[0].fromAdmin ? "Suporte: " : "Você: "}{ticket.messages[0].body}</p>}
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">Abrir conversa <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="order-1 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 lg:order-2 lg:sticky lg:top-24 md:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"><Plus className="h-5 w-5" /></span>
          <div><h2 className="font-bold">Abrir novo chamado</h2><p className="mt-0.5 text-sm text-neutral-500">Respondemos por aqui e por e-mail, normalmente em até 1 dia útil.</p></div>
        </div>
        <NewSupportTicketForm defaultCategory={defaults.category} defaultSubject={defaults.subject?.slice(0, 120)} />
      </section>
      </div>
    </main>
  );
}
