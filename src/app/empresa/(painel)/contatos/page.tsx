import { prisma } from "@/lib/prisma";
import { requireCompanyPage } from "@/lib/company-auth";

export const dynamic = "force-dynamic";

function firstNameOf(name: string | null): string {
  const trimmed = (name ?? "").trim();
  return trimmed ? trimmed.split(/\s+/)[0] : "Candidato";
}

export default async function CompanyContactsPage() {
  const { company } = await requireCompanyPage();

  const requests = await prisma.talentContactRequest.findMany({
    where: { companyId: company.id },
    orderBy: { updatedAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true, phone: true, professionalArea: true, city: true, state: true },
      },
    },
  });

  // Ao abrir a central, zera o aviso: marca os aceitos como vistos.
  await prisma.talentContactRequest.updateMany({
    where: { companyId: company.id, status: "accepted", viewedByCompany: false },
    data: { viewedByCompany: true },
  });

  const accepted = requests.filter((r) => r.status === "accepted");
  const pending = requests.filter((r) => r.status === "pending");
  const declined = requests.filter((r) => r.status === "declined");

  return (
    <div>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-8">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Contatos</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Aqui ficam todos os pedidos de contato que você fez no banco de talentos e nas vagas. O
            contato é liberado quando o candidato aceita.
          </p>
        </header>

        {requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-10 text-center text-neutral-600 dark:text-neutral-400">
            Você ainda não solicitou contato com nenhum candidato.
          </div>
        ) : (
          <div className="space-y-8">
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                Contatos liberados {accepted.length > 0 && `(${accepted.length})`}
              </h2>
              {accepted.length === 0 ? (
                <p className="text-sm text-neutral-500">Nenhum contato liberado ainda.</p>
              ) : (
                <ul className="space-y-3">
                  {accepted.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="font-semibold">{r.user.name || firstNameOf(r.user.name)}</h3>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {[r.user.professionalArea, [r.user.city, r.user.state].filter(Boolean).join("/")]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          {r.jobTitle && <p className="text-xs text-neutral-500 mt-0.5">Vaga: {r.jobTitle}</p>}
                          <div className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 space-y-0.5">
                            {r.user.email && <p>{r.user.email}</p>}
                            {r.user.phone && <p>{r.user.phone}</p>}
                          </div>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          Liberado ✓
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {pending.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                  Aguardando resposta ({pending.length})
                </h2>
                <ul className="space-y-3">
                  {pending.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <h3 className="font-semibold">{firstNameOf(r.user.name)}</h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {[r.user.professionalArea, [r.user.city, r.user.state].filter(Boolean).join("/")]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        {r.jobTitle && <p className="text-xs text-neutral-500 mt-0.5">Vaga: {r.jobTitle}</p>}
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        Aguardando
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {declined.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                  Não liberados ({declined.length})
                </h2>
                <ul className="space-y-3">
                  {declined.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 flex items-start justify-between gap-4 opacity-70"
                    >
                      <div className="min-w-0">
                        <h3 className="font-semibold">{firstNameOf(r.user.name)}</h3>
                        {r.jobTitle && <p className="text-xs text-neutral-500 mt-0.5">Vaga: {r.jobTitle}</p>}
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-neutral-500">Recusado</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
