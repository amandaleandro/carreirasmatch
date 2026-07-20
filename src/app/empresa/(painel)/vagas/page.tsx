import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCompanyPage } from "@/lib/company-auth";
import { parseStoredMatches } from "@/lib/company-vaga";

export const dynamic = "force-dynamic";

export default async function CompanyVagasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { company } = await requireCompanyPage();
  const { status } = await searchParams;
  const filter = status === "abertas" || status === "fechadas" ? status : "todas";

  const vagas = await prisma.companyVaga.findMany({
    where: {
      companyId: company.id,
      ...(filter === "abertas" ? { status: "open" } : filter === "fechadas" ? { status: "closed" } : {}),
    },
    // status desc coloca "open" antes de "closed" (o > c); depois, mais recentes primeiro.
    orderBy: [{ status: "desc" }, { createdAt: "desc" }],
  });

  const filters: { key: string; label: string; href: string }[] = [
    { key: "todas", label: "Todas", href: "/empresa/vagas" },
    { key: "abertas", label: "Abertas", href: "/empresa/vagas?status=abertas" },
    { key: "fechadas", label: "Fechadas", href: "/empresa/vagas?status=fechadas" },
  ];

  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Vagas</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Cadastre a vaga uma vez e o sistema traz os candidatos do banco de talentos que mais têm
              o perfil, ordenados por aderência.
            </p>
          </div>
          <Link
            href="/empresa/vagas/nova"
            className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 text-center"
          >
            + Nova vaga
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          {filters.map((f) => (
            <Link
              key={f.key}
              href={f.href}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === f.key
                  ? "bg-blue-600 text-white"
                  : "border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {vagas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-10 text-center">
            <p className="text-neutral-600 dark:text-neutral-400">
              {filter === "todas" ? "Você ainda não cadastrou nenhuma vaga." : "Nenhuma vaga nesse filtro."}
            </p>
            <Link href="/empresa/vagas/nova" className="mt-3 inline-block font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Cadastrar a primeira vaga →
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {vagas.map((vaga) => {
              const count = parseStoredMatches(vaga.matchesJson).length;
              return (
                <li key={vaga.id}>
                  <Link
                    href={`/empresa/vagas/${vaga.id}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 hover:border-blue-400 dark:hover:border-blue-700 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold truncate">{vaga.title}</h2>
                        {vaga.status === "closed" && (
                          <span className="shrink-0 rounded-full bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                            Fechada
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500 mt-0.5">
                        {count} {count === 1 ? "candidato" : "candidatos"}
                        {[vaga.area, vaga.state].filter(Boolean).length > 0
                          ? ` · ${[vaga.area, vaga.state].filter(Boolean).join(" / ")}`
                          : ""}
                        {" · "}
                        {vaga.createdAt.toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 shrink-0">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
