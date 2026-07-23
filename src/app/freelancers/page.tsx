import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import {
  FREELANCE_CATEGORIES,
  parseSkills,
  categoryLabel,
  averageRating,
  formatCents,
} from "@/lib/freelance";
import {
  Sparkles,
  Briefcase,
  UserCheck,
  PlusCircle,
  Star,
  MapPin,
  Users,
  CheckCircle2,
  Filter,
  Search,
  Zap,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marketplace de Freelancers | CarreirasMatch",
  description:
    "Encontre profissionais qualificados para o seu projeto ou ofereça seus serviços como freelancer sem taxas abusivas.",
  alternates: { canonical: "/freelancers" },
};

type Props = { searchParams: Promise<{ cat?: string }> };

export default async function FreelancersPage({ searchParams }: Props) {
  const { cat } = await searchParams;
  const category = cat && FREELANCE_CATEGORIES.some((c) => c.value === cat) ? cat : "";

  const profiles = await prisma.freelancerProfile.findMany({
    where: { published: true, available: true, ...(category ? { category } : {}) },
    orderBy: [{ ratingCount: "desc" }, { updatedAt: "desc" }],
    take: 60,
    include: { user: { select: { name: true, image: true, city: true, state: true } } },
  });

  const selectedCategoryObj = FREELANCE_CATEGORIES.find((c) => c.value === category);

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Início", path: "/" },
    { name: "Freelancers", path: "/freelancers" },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-[#080c14] text-slate-900 dark:text-slate-100">
      <JsonLd data={breadcrumbs} />
      <PublicSiteHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8 space-y-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white p-6 sm:p-10 shadow-2xl border border-blue-900/40">
          {/* Subtle Glow & Background Accents */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider rounded-full px-3.5 py-1 bg-blue-500/15 text-blue-300 border border-blue-400/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Marketplace Freelancer</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-200">
              Contrate especialistas ou expanda seus trabalhos freelancer
            </h1>

            <p className="text-slate-300 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed font-normal">
              Conectamos talentos independentes a projetos incríveis. Sem burocracia, com total transparência e zero taxa para começar.
            </p>

            {/* CTAs */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link
                href="/freelancer/perfil"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-blue-600 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <UserCheck className="w-4 h-4" />
                <span>Quero oferecer meus serviços</span>
              </Link>
              <Link
                href="/projetos"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all transform hover:-translate-y-0.5"
              >
                <Briefcase className="w-4 h-4 text-blue-300" />
                <span>Ver projetos abertos</span>
              </Link>
            </div>
          </div>

          {/* Quick Value Props Banner */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero taxa para começar</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Perfis verificados</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Propostas diretas</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>Avaliações transparentes</span>
            </div>
          </div>
        </section>

        {/* Section Header & Main Navigation */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Freelancers disponíveis
                </h2>
                <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 text-xs font-semibold">
                  {profiles.length} {profiles.length === 1 ? "profissional" : "profissionais"}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                Encontre o talento ideal filtrando por área de atuação e competências.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/projetos"
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span>Buscar Projetos</span>
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
                  href="/freelancers"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Limpar filtro ({selectedCategoryObj?.label})
                </Link>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/freelancers"
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
                    href={`/freelancers?cat=${c.value}`}
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

        {/* Content Section: Profiles Grid or Redesigned Empty State */}
        {profiles.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-8 sm:p-12 text-center shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                <Users className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Nenhum freelancer nesta categoria ainda
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {category
                    ? `Ainda não temos profissionais cadastrados na categoria "${selectedCategoryObj?.label}". Seja o primeiro ou publique um projeto!`
                    : "Ainda não temos freelancers cadastrados nesta lista. Seja o primeiro a cadastrar seu perfil!"}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/freelancer/perfil"
                  className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-semibold transition-colors shadow-md shadow-blue-500/20 inline-flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Cadastrar meu Perfil</span>
                </Link>
                <Link
                  href="/projetos/novo"
                  className="w-full sm:w-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 px-5 py-2.5 text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4 text-slate-500" />
                  <span>Publicar Projeto</span>
                </Link>
              </div>

              {category && (
                <div className="pt-3">
                  <Link
                    href="/freelancers"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Ver todas as categorias
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {profiles.map((p) => {
              const skills = parseSkills(p.skills).slice(0, 4);
              const avg = averageRating(p.ratingSum, p.ratingCount);
              const name = p.user.name ?? "Freelancer";
              const location = [p.user.city, p.user.state].filter(Boolean).join(", ");
              return (
                <Link
                  key={p.id}
                  href={`/freelancers/${p.userId}`}
                  className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-blue-500/60 dark:hover:border-blue-500/60 hover:shadow-lg transition-all duration-200 relative overflow-hidden"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      {p.user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.user.image}
                          alt={name}
                          className="h-13 w-13 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-blue-500/30 transition-all"
                        />
                      ) : (
                        <div className="h-13 w-13 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md text-lg">
                          {name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <span
                        className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
                        title="Disponível para trabalho"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {name}
                        </p>
                        {p.ratingCount > 0 && (
                          <div className="inline-flex items-center gap-1 bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-semibold px-2 py-0.5 rounded-md shrink-0">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{avg.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate mt-0.5">
                        {p.headline || categoryLabel(p.category)}
                      </p>
                    </div>
                  </div>

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

                  <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 inline-flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>{location || categoryLabel(p.category)}</span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                      {formatCents(p.hourlyRateCents)}
                      {p.hourlyRateCents ? <span className="text-slate-500 text-[11px] font-normal">/h</span> : ""}
                    </span>
                  </div>
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
