import Link from "next/link";
import { ArrowLeft, ArrowRight, Search, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/admin";
import { formatBrazilDateTime } from "@/lib/brazil";

export const dynamic = "force-dynamic";

const SUBSCRIPTION_LABELS: Record<string, string> = {
  active: "Ativa",
  inactive: "Inativa",
  expired: "Expirada",
  cancelled: "Cancelada",
};

function subscriptionBadgeClass(status?: string) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "expired":
    case "cancelled":
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
    default:
      return "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300";
  }
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; plan?: string; page?: string }>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const query = params.q?.trim().slice(0, 100) ?? "";
  const planFilter = params.plan === "active" || params.plan === "free" ? params.plan : "all";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const pageSize = 30;

  const where = {
    ...(query
      ? {
          OR: [
            { name: { contains: query } },
            { email: { contains: query } },
            { phone: { contains: query } },
          ],
        }
      : {}),
    ...(planFilter === "active" ? { subscription: { is: { status: "active" } } } : {}),
    ...(planFilter === "free" ? { OR: [{ subscription: null }, { subscription: { is: { status: { not: "active" } } } }] } : {}),
  };

  const [users, total, totalUsers, activeSubscriptions] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        careerSegment: true,
        city: true,
        state: true,
        createdAt: true,
        subscription: { select: { status: true, currentPeriodEnd: true } },
        _count: { select: { resumes: true, applications: true, payments: true } },
      },
    }),
    prisma.user.count({ where }),
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "active" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const makeHref = (changes: Record<string, string | number>) => {
    const next = new URLSearchParams({ q: query, plan: planFilter });
    Object.entries(changes).forEach(([key, value]) => next.set(key, String(value)));
    return `/admin/usuarios?${next.toString()}`;
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
        <ArrowLeft className="h-4 w-4" /> Voltar para o admin
      </Link>

      <header className="mt-4 mb-8 flex items-center gap-3">
        <span className="rounded-2xl bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
          <Users className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Usuários cadastrados</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-sm">
            {totalUsers} usuário{totalUsers === 1 ? "" : "s"} no total · {activeSubscriptions} com assinatura ativa
          </p>
        </div>
      </header>

      <form className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <label className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
          <span className="sr-only">Buscar usuários</span>
          <input
            name="q"
            defaultValue={query}
            placeholder="Buscar por nome, e-mail ou telefone"
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-3 text-sm dark:border-neutral-800 dark:bg-neutral-950"
          />
        </label>
        <select
          name="plan"
          defaultValue={planFilter}
          aria-label="Filtrar por plano"
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-950"
        >
          <option value="all">Todos os planos</option>
          <option value="active">Assinatura ativa</option>
          <option value="free">Sem assinatura ativa</option>
        </select>
        <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Aplicar</button>
      </form>

      {users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center dark:border-neutral-700">
          <Users className="mx-auto h-9 w-9 text-neutral-400" />
          <p className="mt-3 font-semibold">Nenhum usuário encontrado</p>
          <p className="mt-1 text-sm text-neutral-500">Ajuste a busca ou o filtro de plano.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Usuário</th>
                <th className="px-4 py-3 font-semibold">Localização</th>
                <th className="px-4 py-3 font-semibold">Plano</th>
                <th className="px-4 py-3 font-semibold">Atividade</th>
                <th className="px-4 py-3 font-semibold">Cadastro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {users.map((user) => (
                <tr key={user.id} className="bg-white dark:bg-neutral-950">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-neutral-900 dark:text-white">{user.name ?? "Sem nome"}</p>
                    <p className="text-xs text-neutral-500">{user.email ?? "sem e-mail"}</p>
                    {user.phone && <p className="text-xs text-neutral-500">{user.phone}</p>}
                    {user.careerSegment && (
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                        {user.careerSegment}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                    {[user.city, user.state].filter(Boolean).join(" / ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${subscriptionBadgeClass(user.subscription?.status)}`}
                    >
                      {SUBSCRIPTION_LABELS[user.subscription?.status ?? "inactive"] ?? "Sem plano"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                    {user._count.resumes} currículo{user._count.resumes === 1 ? "" : "s"} ·{" "}
                    {user._count.applications} candidatura{user._count.applications === 1 ? "" : "s"} ·{" "}
                    {user._count.payments} pagamento{user._count.payments === 1 ? "" : "s"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                    {formatBrazilDateTime(user.createdAt, {
                      year: undefined,
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Paginação" className="mt-6 flex items-center justify-between text-sm">
          <span className="text-neutral-500">
            Página {page} de {totalPages} · {total} usuário{total === 1 ? "" : "s"}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={makeHref({ page: page - 1 })} className="rounded-lg border px-3 py-2">
                Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link href={makeHref({ page: page + 1 })} className="rounded-lg border px-3 py-2 inline-flex items-center gap-1">
                Próxima <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </nav>
      )}
    </main>
  );
}
