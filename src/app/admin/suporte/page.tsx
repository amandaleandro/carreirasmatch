import Link from "next/link";
import { ArrowLeft, ArrowRight, Inbox, Search } from "lucide-react";
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

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; order?: string; page?: string }>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const requestedStatus = params.status;
  const activeFilter = requestedStatus === "all" ? "all" : normalizeSupportStatus(requestedStatus);
  const query = params.q?.trim().slice(0, 100) ?? "";
  const order = params.order === "oldest" ? "oldest" : params.order === "priority" ? "priority" : "newest";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const pageSize = 20;
  const where = {
    ...(activeFilter === "all" ? {} : { status: activeFilter }),
    ...(query ? { OR: [{ subject: { contains: query } }, { user: { is: { email: { contains: query } } } }] } : {}),
  };

  const [tickets, total, groupedCounts, metricTickets] = await Promise.all([
  prisma.supportTicket.findMany({
    where,
    orderBy: order === "oldest" ? { updatedAt: "asc" } : order === "priority" ? [{ status: "asc" }, { updatedAt: "asc" }] : { updatedAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      user: { select: { email: true, name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: { where: { fromAdmin: false, readByAdmin: false } } } },
    },
  }),
  prisma.supportTicket.count({ where }),
  prisma.supportTicket.groupBy({ by: ["status"], _count: { _all: true } }),
  prisma.supportTicket.findMany({ select: { createdAt: true, firstResponseAt: true, resolvedAt: true, reopenCount: true } }),
  ]);
  const counts = Object.fromEntries(SUPPORT_STATUSES.map((status) => [status, groupedCounts.find((item) => item.status === status)?._count._all ?? 0])) as Record<(typeof SUPPORT_STATUSES)[number], number>;
  const responded = metricTickets.filter((ticket) => ticket.firstResponseAt);
  const resolved = metricTickets.filter((ticket) => ticket.resolvedAt);
  const averageHours = (items: typeof metricTickets, end: "firstResponseAt" | "resolvedAt") => items.length ? (items.reduce((sum, item) => sum + ((item[end]?.getTime() ?? item.createdAt.getTime()) - item.createdAt.getTime()), 0) / items.length / 3_600_000).toFixed(1) : "—";
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const makeHref = (changes: Record<string, string | number>) => {
    const next = new URLSearchParams({ status: activeFilter, q: query, order });
    Object.entries(changes).forEach(([key, value]) => next.set(key, String(value)));
    return `/admin/suporte?${next.toString()}`;
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
        <ArrowLeft className="h-4 w-4" /> Voltar para o admin
      </Link>

      <header className="mt-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Suporte</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Fila de chamados dos usuários. &quot;Aguardando resposta&quot; é o que
          precisa de você.
        </p>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[["1ª resposta", `${averageHours(responded, "firstResponseAt")}h`], ["Resolução", `${averageHours(resolved, "resolvedAt")}h`], ["Reaberturas", metricTickets.reduce((sum, ticket) => sum + ticket.reopenCount, 0)], ["Total", metricTickets.length]].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"><p className="text-xl font-bold text-blue-600">{value}</p><p className="mt-1 text-xs text-neutral-500">{label}</p></div>
        ))}
      </section>

      <form className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <input type="hidden" name="status" value={activeFilter} />
        <label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" /><span className="sr-only">Buscar chamados</span><input name="q" defaultValue={query} placeholder="Buscar por assunto ou e-mail" className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-3 text-sm dark:border-neutral-800 dark:bg-neutral-950" /></label>
        <select name="order" defaultValue={order} aria-label="Ordenar chamados" className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-950"><option value="newest">Mais recentes</option><option value="oldest">Mais antigos</option><option value="priority">Prioridade</option></select>
        <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Aplicar</button>
      </form>

      <nav aria-label="Filtrar chamados" className="mb-8 flex gap-2 overflow-x-auto pb-1">
        {[
          { value: "open", label: "Precisa de resposta", count: counts.open },
          { value: "pending", label: "Aguardando usuário", count: counts.pending },
          { value: "resolved", label: "Resolvidos", count: counts.resolved },
          { value: "all", label: "Todos", count: metricTickets.length },
        ].map((filter) => (
          <Link key={filter.value} href={`/admin/suporte?status=${filter.value}`} aria-current={activeFilter === filter.value ? "page" : undefined} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${activeFilter === filter.value ? "border-blue-600 bg-blue-600 text-white" : "border-neutral-200 bg-white text-neutral-600 hover:border-blue-300 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"}`}>
            {filter.label} <span className={`ml-1 rounded-full px-1.5 py-0.5 text-xs ${activeFilter === filter.value ? "bg-white/20" : "bg-neutral-100 dark:bg-neutral-800"}`}>{filter.count}</span>
          </Link>
        ))}
      </nav>

      {tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center dark:border-neutral-700">
          <Inbox className="mx-auto h-9 w-9 text-neutral-400" />
          <p className="mt-3 font-semibold">Nenhum chamado neste filtro</p>
          <p className="mt-1 text-sm text-neutral-500">A fila está em dia por aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const status = normalizeSupportStatus(ticket.status);
            const unread = ticket._count.messages;
            return (
              <Link
                key={ticket.id}
                href={`/admin/suporte/${ticket.id}`}
                className={`group block rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-neutral-950 ${unread ? "border-amber-300 dark:border-amber-800" : "border-neutral-200/80 dark:border-neutral-800"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    {unread > 0 && <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />}
                    <h2 className="truncate text-sm font-semibold">{ticket.subject}</h2>
                    {unread > 0 && <span className="shrink-0 text-xs font-bold text-amber-700 dark:text-amber-300">{unread} nova{unread > 1 ? "s" : ""}</span>}
                  </div>
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
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Abrir atendimento <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
      {totalPages > 1 && <nav aria-label="Paginação" className="mt-6 flex items-center justify-between text-sm"><span className="text-neutral-500">Página {page} de {totalPages} · {total} chamado{total === 1 ? "" : "s"}</span><div className="flex gap-2">{page > 1 && <Link href={makeHref({ page: page - 1 })} className="rounded-lg border px-3 py-2">Anterior</Link>}{page < totalPages && <Link href={makeHref({ page: page + 1 })} className="rounded-lg border px-3 py-2">Próxima</Link>}</div></nav>}
    </main>
  );
}
