import { prisma } from "@/lib/prisma";
import { requireCompanyPage } from "@/lib/company-auth";

export const dynamic = "force-dynamic";

function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

export default async function CompanyReportsPage() {
  const { company } = await requireCompanyPage();
  const candidateWhere = { job: { companyId: company.id } };

  const [
    jobCount,
    candidateCount,
    fitAgg,
    high,
    mid,
    low,
    favorite,
    approved,
    rejected,
    openVagas,
    closedVagas,
    contactPending,
    contactAccepted,
    contactDeclined,
  ] = await Promise.all([
    prisma.companyJob.count({ where: { companyId: company.id } }),
    prisma.companyCandidate.count({ where: candidateWhere }),
    prisma.companyCandidate.aggregate({ _avg: { fitScore: true }, where: candidateWhere }),
    prisma.companyCandidate.count({ where: { ...candidateWhere, fitScore: { gte: 70 } } }),
    prisma.companyCandidate.count({ where: { ...candidateWhere, fitScore: { gte: 40, lt: 70 } } }),
    prisma.companyCandidate.count({ where: { ...candidateWhere, fitScore: { lt: 40 } } }),
    prisma.companyCandidate.count({ where: { ...candidateWhere, status: "favorite" } }),
    prisma.companyCandidate.count({ where: { ...candidateWhere, status: "approved" } }),
    prisma.companyCandidate.count({ where: { ...candidateWhere, status: "rejected" } }),
    prisma.companyVaga.count({ where: { companyId: company.id, status: "open" } }),
    prisma.companyVaga.count({ where: { companyId: company.id, status: "closed" } }),
    prisma.talentContactRequest.count({ where: { companyId: company.id, status: "pending" } }),
    prisma.talentContactRequest.count({ where: { companyId: company.id, status: "accepted" } }),
    prisma.talentContactRequest.count({ where: { companyId: company.id, status: "declined" } }),
  ]);

  const avgFit = Math.round(fitAgg._avg.fitScore ?? 0);
  const contactTotal = contactPending + contactAccepted + contactDeclined;
  const acceptRate = pct(contactAccepted, contactAccepted + contactDeclined);

  const cards = [
    { label: "Triagens realizadas", value: jobCount },
    { label: "Currículos analisados", value: candidateCount },
    { label: "Aderência média", value: candidateCount > 0 ? `${avgFit}` : "—" },
    { label: "Vagas abertas", value: openVagas },
    { label: "Vagas fechadas", value: closedVagas },
    { label: "Pedidos de contato", value: contactTotal },
  ];

  const bands = [
    { label: "Alta (70+)", value: high, color: "bg-emerald-500" },
    { label: "Média (40–69)", value: mid, color: "bg-amber-500" },
    { label: "Baixa (<40)", value: low, color: "bg-red-500" },
  ];

  const actions = [
    { label: "Favoritos", value: favorite, color: "text-amber-600 dark:text-amber-400" },
    { label: "Aprovados", value: approved, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Reprovados", value: rejected, color: "text-red-600 dark:text-red-400" },
  ];

  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 space-y-8">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Uma visão geral do que aconteceu nas suas triagens, vagas e contatos.
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 space-y-4">
          <h2 className="font-semibold">Distribuição de aderência</h2>
          {candidateCount === 0 ? (
            <p className="text-sm text-neutral-500">Nenhum currículo analisado ainda.</p>
          ) : (
            <div className="space-y-3">
              {bands.map((b) => (
                <div key={b.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-neutral-600 dark:text-neutral-300">{b.label}</span>
                    <span className="text-neutral-500">
                      {b.value} ({pct(b.value, candidateCount)}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                    <div className={`h-full ${b.color}`} style={{ width: `${pct(b.value, candidateCount)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6">
            <h2 className="font-semibold mb-4">Decisões nas triagens</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              {actions.map((a) => (
                <div key={a.label}>
                  <p className={`text-2xl font-bold ${a.color}`}>{a.value}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{a.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6">
            <h2 className="font-semibold mb-4">Contatos do banco de talentos</h2>
            {contactTotal === 0 ? (
              <p className="text-sm text-neutral-500">Nenhum pedido de contato ainda.</p>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-300">Liberados</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{contactAccepted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-300">Aguardando</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{contactPending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-300">Recusados</span>
                  <span className="font-semibold text-neutral-500">{contactDeclined}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-100 dark:border-neutral-900 pt-2 mt-2">
                  <span className="text-neutral-600 dark:text-neutral-300">Taxa de aceite</span>
                  <span className="font-semibold">{acceptRate}%</span>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
