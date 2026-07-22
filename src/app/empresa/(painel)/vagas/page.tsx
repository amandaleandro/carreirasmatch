import Link from "next/link";
import { Briefcase, Plus, MapPin, Clock, ArrowRight, Users, CheckCircle2, Lock } from "lucide-react";
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
    orderBy: [{ status: "desc" }, { createdAt: "desc" }],
  });

  const filters = [
    { key: "todas", label: "Todas as Vagas", href: "/empresa/vagas" },
    { key: "abertas", label: "Vagas Abertas", href: "/empresa/vagas?status=abertas" },
    { key: "fechadas", label: "Vagas Fechadas", href: "/empresa/vagas?status=fechadas" },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Briefcase className="w-3.5 h-3.5" />
            Gestão de Oportunidades
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Vagas da Empresa
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Cadastre a vaga e o algoritmo atrai e ranqueia candidatos por compatibilidade em tempo real.
          </p>
        </div>

        <Link
          href="/empresa/vagas/nova"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 shadow-md shadow-blue-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Vaga</span>
        </Link>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-0.5">
          {filters.map((f) => (
            <Link
              key={f.key}
              href={f.href}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                filter === f.key
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Vagas List */}
      {vagas.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-10 text-center shadow-2xs space-y-3">
          <Briefcase className="h-10 w-10 mx-auto text-slate-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {filter === "todas" ? "Nenhuma vaga cadastrada ainda" : "Nenhuma vaga encontrada para este filtro"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Cadastre vagas para que candidatos qualificados recebam recomendações automáticas.
          </p>
          <div className="pt-2">
            <Link
              href="/empresa/vagas/nova"
              className="inline-flex items-center gap-2 font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Cadastrar a primeira vaga</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {vagas.map((vaga) => {
            const count = parseStoredMatches(vaga.matchesJson).length;
            const isOpen = vaga.status === "open";
            return (
              <Link
                key={vaga.id}
                href={`/empresa/vagas/${vaga.id}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs hover:border-blue-500/60 transition-all duration-200"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {vaga.title}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isOpen
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {isOpen ? "Aberta" : "Fechada"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      {count} {count === 1 ? "candidato recomendado" : "candidatos recomendados"}
                    </span>
                    {[vaga.area, vaga.state].filter(Boolean).length > 0 && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {[vaga.area, vaga.state].filter(Boolean).join(" / ")}
                        </span>
                      </>
                    )}
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {vaga.createdAt.toLocaleDateString("pt-BR")}
                    </span>
                  </p>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
