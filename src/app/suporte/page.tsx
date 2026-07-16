import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  SUPPORT_CATEGORIES,
  SUPPORT_CATEGORY_DESCRIPTIONS,
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_STATUS_LABELS,
  normalizeSupportCategory,
  normalizeSupportStatus,
  supportStatusBadgeClass,
} from "@/lib/support";
import { createSupportTicket } from "./actions";

export const dynamic = "force-dynamic";

const INPUT_CLASS =
  "w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors";

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <header className="mb-10">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
          Suporte
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Fale com a gente</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Abra um chamado e converse direto com nosso time aqui dentro do
          sistema. Você recebe a resposta nesta mesma página.
        </p>
      </header>

      <section className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <h2 className="font-semibold mb-4">Abrir um chamado</h2>
        <form action={createSupportTicket} className="space-y-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Área
            </label>
            <select id="category" name="category" defaultValue="other" className={INPUT_CLASS}>
              {SUPPORT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {SUPPORT_CATEGORY_LABELS[category]} — {SUPPORT_CATEGORY_DESCRIPTIONS[category]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-1">
              Assunto
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              maxLength={120}
              placeholder="Ex: Paguei no Pix e a assinatura não liberou"
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium mb-1">
              O que aconteceu?
            </label>
            <textarea
              id="body"
              name="body"
              required
              rows={5}
              maxLength={4000}
              placeholder="Conte com detalhes. Se for sobre pagamento, o horário e o valor ajudam a achar a transação."
              className={INPUT_CLASS}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 text-white font-semibold px-5 py-2.5 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all"
          >
            Enviar chamado
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold mb-4">Seus chamados</h2>

        {tickets.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Você ainda não abriu nenhum chamado.
          </p>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const status = normalizeSupportStatus(ticket.status);
              const unread = ticket._count.messages;
              return (
                <Link
                  key={ticket.id}
                  href={`/suporte/${ticket.id}`}
                  className="block rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 shadow-sm shadow-slate-900/5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold leading-snug">{ticket.subject}</h3>
                    <span
                      className={`shrink-0 text-[11px] font-semibold rounded-full px-2 py-0.5 ${supportStatusBadgeClass(status)}`}
                    >
                      {SUPPORT_STATUS_LABELS[status]}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {SUPPORT_CATEGORY_LABELS[normalizeSupportCategory(ticket.category)]}
                    {" · "}
                    {ticket.updatedAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                    {unread > 0 && (
                      <span className="ml-2 font-semibold text-blue-600 dark:text-blue-400">
                        {unread} nova{unread > 1 ? "s" : ""} resposta{unread > 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                  {ticket.messages[0] && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2">
                      {ticket.messages[0].fromAdmin ? "Suporte: " : "Você: "}
                      {ticket.messages[0].body}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
