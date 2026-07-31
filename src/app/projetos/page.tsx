import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  FREELANCE_CATEGORIES,
  parseSkills,
  categoryLabel,
  formatBudget,
} from "@/lib/freelance";
import {
  Sparkles,
  Briefcase,
  PlusCircle,
  Users,
  CheckCircle2,
  Filter,
  Zap,
  ShieldCheck,
  Clock,
  Send,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projetos Freelancer | CarreirasMatch",
  description: "Explore projetos abertos para freelancers e envie suas propostas.",
};

type Props = { searchParams: Promise<{ cat?: string }> };

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 30) return `há ${days} dias`;
  return `há ${Math.floor(days / 30)} mês(es)`;
}

export default async function ProjectsPage({ searchParams }: Props) {
  const { cat } = await searchParams;
  const category = cat && FREELANCE_CATEGORIES.some((c) => c.value === cat) ? cat : "";

  const projects = await prisma.freelanceProject.findMany({
    where: { status: "open", ...(category ? { category } : {}) },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { client: { select: { name: true } } },
  });

  const selectedCategoryObj = FREELANCE_CATEGORIES.find((c) => c.value === category);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-[#080c14] text-slate-900 dark:text-slate-100">
      <PublicSiteHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8 space-y-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-slate-950 text-white p-6 sm:p-10 border border-blue-900/40">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide rounded-full px-3.5 py-1 bg-blue-500/15 text-blue-300 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Projetos em Destaque</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight text-white">
              Precisa de um projeto feito? Publique e receba propostas
            </h1>

            <p className="text-slate-300 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed font-normal">
              Descreva sua necessidade e receba orçamentos de freelancers qualificados com transparência e rapidez.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link
                href="/projetos/novo"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publicar meu projeto</span>
              </Link>
              <Link
                href="/freelancers"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all transform hover:-translate-y-0.5"
              >
                <Users className="w-4 h-4 text-blue-300" />
                <span>Buscar Freelancers</span>
              </Link>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Publicação gratuita</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Propostas auditadas</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Respostas em horas</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Projetos de todo o Brasil</span>
            </div>
          </div>
        </section>

        {/* Section Header & Main Navigation */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Projetos abertos
                </h2>
                <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 text-xs font-semibold">
                  {projects.length} {projects.length === 1 ? "projeto" : "projetos"}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                Envie suas propostas diretamente para os contratantes.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/freelancers"
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                <Users className="w-4 h-4 text-slate-400" />
                <span>Ver Freelancers</span>
              </Link>
              <Link
                href="/projetos/novo"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-sm font-semibold transition-colors inline-flex items-center gap-2 shadow-md shadow-blue-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publicar projeto</span>
              </Link>
            </div>
          </div>

          {/* Categories Pill Filter Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                Filtrar por Categoria:
              </span>
              {category && (
                <Link
                  href="/projetos"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Limpar filtro ({selectedCategoryObj?.label})
                </Link>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/projetos"
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  !category
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600/30"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                }`}
              >
                Todas as categorias
              </Link>
              {FREELANCE_CATEGORIES.map((c) => {
                const isActive = category === c.value;
                return (
                  <Link
                    key={c.value}
                    href={`/projetos?cat=${c.value}`}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600/30"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                    }`}
                  >
                    {c.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-8 sm:p-12 text-center shadow-sm relative overflow-hidden">
            <div className="relative z-10 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                <Briefcase className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Nenhum projeto aberto nesta categoria ainda
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {category
                    ? `Ainda não há projetos na categoria "${selectedCategoryObj?.label}". Publique o primeiro projeto!`
                    : "Ainda não há projetos abertos no momento."}
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <Link
                  href="/projetos/novo"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-semibold transition-colors shadow-md shadow-blue-500/20 inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publicar Projeto Agora</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((p) => {
              const skills = parseSkills(p.skills).slice(0, 6);
              return (
                <Link
                  key={p.id}
                  href={`/projetos/${p.id}`}
                  className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:border-blue-500/60 dark:hover:border-blue-500/60 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5">
                          {p.category ? categoryLabel(p.category) : "Geral"}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{timeAgo(p.createdAt)}</span>
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Por <span className="font-semibold text-slate-700 dark:text-slate-300">{p.client.name ?? "Contratante"}</span>
                      </p>
                    </div>

                    <div className="shrink-0 text-left sm:text-right bg-slate-50 dark:bg-slate-800/60 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                      <span className="block text-base font-extrabold text-slate-900 dark:text-white">
                        {formatBudget(p.budgetType, p.budgetMinCents, p.budgetMaxCents)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <Send className="w-3 h-3 text-blue-500" />
                        <span>{p.proposalCount} proposta(s)</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 text-xs font-medium border border-slate-200/60 dark:border-slate-700/60"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
