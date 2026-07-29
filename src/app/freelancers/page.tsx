import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import {
  FREELANCE_CATEGORIES,
  parseSkills,
  categoryLabel,
  averageRating,
  formatCents,
} from "@/lib/freelance";
import {
  Sparkles,
  PlusCircle,
  Star,
  MapPin,
  CheckCircle2,
  Filter,
  Search,
  Zap,
  ShieldCheck,
  ArrowRight,
  DollarSign,
  TrendingUp,
  HelpCircle,
  Award,
  UserCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marketplace de Freelancers | CarreirasMatch",
  description:
    "Cadastre seu perfil de freelancer grátis ou contrate profissionais qualificados para o seu projeto com comissão transparente de 5% por serviço concluído.",
  alternates: { canonical: "/freelancers" },
};

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Crie seu Perfil Grátis",
    description: "Defina suas habilidades, valor por hora e links de portfólio em menos de 2 minutos.",
    icon: UserCheck,
  },
  {
    step: "02",
    title: "Seja Encontrado ou Envie Propostas",
    description: "Apareça na vitrine pública ou candidate-se diretamente aos projetos abertos na comunidade.",
    icon: Search,
  },
  {
    step: "03",
    title: "Feche Negócios com Taxa Transparente",
    description: "Conecte-se com contratantes reais pagando apenas 5% sobre cada serviço concluído.",
    icon: DollarSign,
  },
];

const DIFFERENTIALS = [
  {
    icon: Zap,
    title: "Comissão Transparente de 5%",
    description:
      "Seu cadastro e sua vitrine são gratuitos. A plataforma retém apenas 5% do valor bruto quando o serviço é concluído.",
  },
  {
    icon: TrendingUp,
    title: "Público em Busca Ativa de Soluções",
    description:
      "Milhares de profissionais e empresas passam por aqui diariamente ajustando currículos, lançando vagas e buscando talentos executores.",
  },
  {
    icon: ShieldCheck,
    title: "Vitrine Pública & Reputação Verificada",
    description:
      "Receba avaliações reais por trabalhos concluídos e construa autoridade com uma URL pública do seu perfil profissional.",
  },
];

const FAQ = [
  {
    question: "Quanto custa cadastrar meu perfil como freelancer?",
    answer:
      "É 100% gratuito. Você pode criar seu perfil, definir seu valor por hora, cadastrar competências e publicar na vitrine sem pagar nenhuma taxa inicial ou mensalidade.",
  },
  {
    question: "Como os clientes entram em contato comigo?",
    answer:
      "Seu perfil fica visível na vitrine pública de freelancers com botão de contato direto. Clientes interessados no seu trabalho enviam propostas e mensagens direto pelo seu painel.",
  },
  {
    question: "Posso também contratar freelancers para meus projetos?",
    answer:
      "Sim! Qualquer usuário cadastrado pode publicar um projeto gratuito na aba 'Projetos' para receber propostas de especialistas de toda a comunidade.",
  },
  {
    question: "O CarreirasMatch cobra comissão sobre os projetos fechados?",
    answer:
      "Sim. O cadastro é gratuito e a plataforma retém 5% do valor bruto de cada serviço concluído; os 95% restantes ficam com o freelancer.",
  },
];

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

  const faqData = faqJsonLd(FAQ);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-[#080c14] text-slate-900 dark:text-slate-100">
      <JsonLd data={breadcrumbs} />
      <JsonLd data={faqData} />
      <PublicSiteHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8 space-y-16">
        {/* High-Converting Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-slate-950 text-white p-6 sm:p-12 border border-blue-900/40">
          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide rounded-full px-3.5 py-1.5 bg-blue-500/15 text-blue-300 border border-blue-400/30">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Plataforma Freelancer 100% Gratuita</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.15] text-white">
              Divulgue seus serviços ou contrate especialistas sem comissões abusivas
            </h1>

            <p className="text-slate-300 max-w-2xl text-base sm:text-lg leading-relaxed font-normal">
              Conectamos freelancers qualificados a projetos reais. Monte seu perfil profissional em 2 minutos e exiba seu portfólio na vitrine pública. Em cada serviço concluído, você fica com 95% do valor.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/freelancer/perfil"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3.5 text-sm sm:text-base font-bold text-white transition-colors"
              >
                <UserCheck className="w-5 h-5" />
                <span>Quero Oferecer meus Serviços</span>
                <ArrowRight className="w-4 h-4 text-blue-200" />
              </Link>
              <Link
                href="/projetos/novo"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/25 px-6 py-3.5 text-sm sm:text-base font-semibold text-white backdrop-blur-md transition-all transform hover:-translate-y-0.5"
              >
                <PlusCircle className="w-5 h-5 text-blue-300" />
                <span>Publicar um Projeto</span>
              </Link>
            </div>
          </div>

          {/* Value Props Ribbon */}
          <div className="relative z-10 mt-10 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>5% de comissão</strong> por serviço concluído</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span><strong>Vitrine Pública</strong> indexada</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Propostas Diretas</strong> no painel</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4 text-yellow-400 shrink-0" />
              <span><strong>Avaliações</strong> verificadas</span>
            </div>
          </div>
        </section>

        {/* Persuasion Block: How It Works */}
        <section className="space-y-8 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Simples & Direto
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Como funciona o CarreirasMatch Freelancer
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Sem burocracia nem taxas escondidas. Você no controle da sua carreira independente.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((h) => {
              const Icon = h.icon;
              return (
                <div
                  key={h.step}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 relative shadow-2xs hover:border-blue-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-bold text-slate-300 dark:text-slate-800">
                      {h.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {h.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {h.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Directory Showcase & Category Filter */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Profissionais em Destaque
                </h2>
                <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 text-xs font-semibold">
                  {profiles.length} {profiles.length === 1 ? "disponível" : "disponíveis"}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                Encontre o especialista ideal ou navegue pelas áreas de atuação.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/projetos"
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span>Ver Projetos Abertos</span>
              </Link>
              <Link
                href="/freelancer/perfil"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-sm font-semibold transition-colors inline-flex items-center gap-2 shadow-md shadow-blue-500/20"
              >
                <UserCheck className="w-4 h-4" />
                <span>Criar meu Perfil</span>
              </Link>
            </div>
          </div>

          {/* Categories Filter Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                Filtrar por Especialidade:
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

          {/* Grid or High-Converting Empty State */}
          {profiles.length === 0 ? (
            <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-500/5 via-white to-white dark:via-slate-900 dark:to-slate-900 p-8 sm:p-12 text-center shadow-sm relative overflow-hidden space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner border border-blue-500/20">
                <Award className="w-8 h-8" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {category
                    ? `Seja o primeiro especialista em "${selectedCategoryObj?.label}"!`
                    : "Seja o primeiro freelancer a destacar seu perfil!"}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Cadastre seu perfil gratuitamente para aparecer no topo da busca de clientes que visitam esta categoria diariamente.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
                <Link
                  href="/freelancer/perfil"
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 inline-flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Cadastrar Meu Perfil Grátis</span>
                </Link>
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
                        {p.hourlyRateCents ? (
                          <span className="text-slate-500 text-[11px] font-normal">/h</span>
                        ) : (
                          ""
                        )}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Why Join Section (Differentials) */}
        <section className="rounded-3xl bg-slate-900 text-white p-8 sm:p-10 space-y-8 shadow-xl border border-slate-800">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Vantagem CarreirasMatch
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Por que oferecer seus serviços aqui?
            </h2>
            <p className="text-slate-400 text-sm">
              Criamos uma plataforma pensa no profissional autônomo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {DIFFERENTIALS.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.title} className="space-y-3 p-5 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-white">{d.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{d.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-6 max-w-3xl mx-auto pt-4">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              Tire suas Dúvidas
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {FAQ.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="cursor-pointer font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center justify-between list-none">
                  <span>{item.question}</span>
                  <span className="transition group-open:rotate-180 text-blue-600 dark:text-blue-400 font-bold ml-4">
                    ↓
                  </span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Final Conversion Banner */}
        <section className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-8 sm:p-12 text-white shadow-2xl space-y-6 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Pronto para colocar seu perfil no ar?
            </h2>
            <p className="text-sm text-blue-100 leading-relaxed">
              Leva menos de 2 minutos. Sem cartão de crédito, sem taxas abusivas e com total liberdade para negociar com clientes.
            </p>
          </div>
          <Link
            href="/freelancer/perfil"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-extrabold px-6 py-4 text-sm sm:text-base transition-all shadow-lg shrink-0 transform hover:-translate-y-0.5"
          >
            <UserCheck className="w-5 h-5" />
            <span>Criar Meu Perfil Grátis</span>
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
