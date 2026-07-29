import Link from "next/link";
import { Briefcase, Plus, MapPin, Clock, ArrowRight, Users, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireCompanyPage } from "@/lib/company-auth";
import { parseStoredMatches } from "@/lib/company-vaga";
import { getBrazilGreeting } from "@/lib/brazil";

export const dynamic = "force-dynamic";

export default async function CompanyVagasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { session, company } = await requireCompanyPage();
  const { status, q } = await searchParams;
  const filter = status === "abertas" || status === "fechadas" ? status : "todas";
  const greeting = getBrazilGreeting(session.user?.name ?? company.name);

  // Buscar todas as vagas da empresa para estatísticas agregadas
  const allVagas = await prisma.companyVaga.findMany({
    where: { companyId: company.id },
    select: { status: true, matchesJson: true },
  });

  const totalVagas = allVagas.length;
  const vagasAbertasCount = allVagas.filter((v) => v.status === "open").length;
  const vagasFechadasCount = allVagas.filter((v) => v.status === "closed").length;
  const totalCandidatosRanqueados = allVagas.reduce(
    (acc, v) => acc + parseStoredMatches(v.matchesJson).length,
    0
  );

  const vagas = await prisma.companyVaga.findMany({
    where: {
      companyId: company.id,
      ...(filter === "abertas" ? { status: "open" } : filter === "fechadas" ? { status: "closed" } : {}),
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: [{ status: "desc" }, { createdAt: "desc" }],
  });

  const filters = [
    { key: "todas", label: "Todas as Vagas", count: totalVagas, href: "/empresa/vagas" },
    { key: "abertas", label: "Vagas Abertas", count: vagasAbertasCount, href: "/empresa/vagas?status=abertas" },
    { key: "fechadas", label: "Vagas Fechadas", count: vagasFechadasCount, href: "/empresa/vagas?status=fechadas" },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Briefcase className="w-3.5 h-3.5" />
            Gestão de Oportunidades
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {greeting}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Gerencie as vagas da {company.name} e acompanhe o ranqueamento de candidatos por IA em tempo real.
          </p>
        </div>

        <Link
          href="/empresa/vagas/nova"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 shadow-md shadow-blue-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Vaga</span>
        </Link>
      </div>

      {/* Grid de KPIs de Gestão */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-4 shadow-2xs backdrop-blur-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total de Vagas</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalVagas}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-2xs">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Vagas Abertas</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{vagasAbertasCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Vagas Encerradas</p>
          <p className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-1">{vagasFechadasCount}</p>
        </div>
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 shadow-2xs">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Candidatos Ranqueados</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{totalCandidatosRanqueados}</p>
        </div>
      </div>

      {/* Filter Pills e Busca */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 p-1">
          {filters.map((f) => (
            <Link
              key={f.key}
              href={f.href}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all inline-flex items-center gap-2 ${
                filter === f.key
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>{f.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  filter === f.key
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {f.count}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Vagas List */}
      {vagas.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-12 text-center shadow-2xs space-y-3">
          <Briefcase className="h-12 w-12 mx-auto text-slate-400 opacity-60" />
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">
            {filter === "todas" ? "Nenhuma vaga cadastrada ainda" : "Nenhuma vaga encontrada para este filtro"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Cadastre suas vagas para que a inteligência artificial ranqueie automaticamente os candidatos compatíveis.
          </p>
          <div className="pt-2">
            <Link
              href="/empresa/vagas/nova"
              className="inline-flex items-center gap-2 font-bold text-xs bg-blue-600 text-white rounded-xl px-4 py-2 hover:bg-blue-700 transition-all shadow-xs"
            >
              <span>Cadastrar a primeira vaga</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1">
          {vagas.map((vaga) => {
            const matches = parseStoredMatches(vaga.matchesJson);
            const count = matches.length;
            const isOpen = vaga.status === "open";
            const topMatches = matches.slice(0, 3);
            const topFitScore = topMatches[0]?.fitScore ?? 0;
            const isHighMatch = topFitScore >= 80;
            
            return (
              <Link
                key={vaga.id}
                href={`/empresa/vagas/${vaga.id}`}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs hover:border-blue-500/60 hover:shadow-md transition-all duration-200"
              >
                <div className="min-w-0 space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
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
                    {vaga.area && (
                      <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {vaga.area}
                      </span>
                    )}
                    {isHighMatch && (
                      <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Alta Compatibilidade ({topFitScore}%)
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      {count} {count === 1 ? "candidato qualificado" : "candidatos qualificados"}
                    </span>
                    {vaga.state && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {vaga.state}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {vaga.createdAt.toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  {/* Top 3 Talent Preview */}
                  {topMatches.length > 0 && (
                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Top Talentos:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {topMatches.map((m, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                          >
                            <span className="font-bold text-blue-600 dark:text-blue-400">{m.fitScore}%</span>
                            <span className="truncate max-w-[80px]">{m.firstName}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    Ver Candidatos
                    <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
