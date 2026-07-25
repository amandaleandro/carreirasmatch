import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BrandLogo } from "@/components/brand-logo";
import { SiteFooter } from "@/components/site-footer";
import { PartnerContactForm } from "@/components/partner-contact-form";
import {
  GraduationCap,
  MousePointerClick,
  BarChart3,
  Wallet,
  Megaphone,
  Users,
  ArrowRight,
  CheckCircle2,
  Target,
  Search,
  ShieldCheck,
  MessageSquareText,
} from "lucide-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Seja um parceiro CarreirasMatch",
  description:
    "Divulgue seus cursos e treinamentos para milhares de profissionais buscando qualificação. Painel de leads, cliques e faturamento.",
  alternates: { canonical: "/parceiro" },
};

const FEATURES = [
  {
    icon: Megaphone,
    title: "Cursos em destaque",
    description: "Seus cursos aparecem para quem está ativamente buscando qualificação para a próxima vaga.",
  },
  {
    icon: Users,
    title: "Leads qualificados",
    description: "Receba os contatos de quem demonstrou interesse real no seu curso, prontos para abordagem.",
  },
  {
    icon: MousePointerClick,
    title: "Painel de cliques e interesse",
    description: "Acompanhe em tempo real quantas pessoas viram, clicaram e se interessaram por cada curso.",
  },
  {
    icon: Wallet,
    title: "Faturamento no painel",
    description: "Acompanhe suas vendas e destaques pagos direto pelo painel, sem planilha paralela.",
  },
];

const AUDIENCE_POINTS = [
  {
    icon: Target,
    title: "Intenção, não impressão",
    description:
      "Quem está aqui acabou de analisar o currículo, viu o que falta e procura um curso para fechar essa lacuna. Seu curso aparece exatamente nesse momento.",
  },
  {
    icon: Search,
    title: "Recomendação por área",
    description:
      "Nosso motor de recomendação cruza a área e as fraquezas do currículo de cada pessoa com o catálogo de cursos. Seu curso chega a quem realmente precisa dele.",
  },
  {
    icon: ShieldCheck,
    title: "Contexto de confiança",
    description:
      "Você não disputa atenção num feed de rede social: aparece dentro de uma jornada de carreira, ao lado de vagas e planos de ação, como próximo passo natural.",
  },
];

const FAQ = [
  {
    q: "Quanto custa para começar?",
    a: "Nada. O cadastro e a publicação de cursos são gratuitos. Você só paga se quiser destacar cursos no topo das listagens, comprando créditos de destaque direto no painel.",
  },
  {
    q: "Que tipo de curso posso divulgar?",
    a: "Cursos gratuitos e pagos, online ou presenciais: graduação, técnico, cursos livres, mentorias e treinamentos corporativos. Cursos gratuitos também são bem-vindos, eles geram audiência e leads para suas ofertas pagas.",
  },
  {
    q: "Como recebo os interessados?",
    a: "De duas formas: cliques direto para o seu site (com cupom, se você cadastrar um) e leads com nome, e-mail e telefone de quem pediu contato, tudo visível no seu painel em tempo real.",
  },
  {
    q: "Preciso de CNPJ?",
    a: "Não. Criadores de curso e mentores independentes também podem se cadastrar. O CNPJ é opcional no cadastro.",
  },
  {
    q: "Existe fidelidade ou contrato?",
    a: "Não. Você pode pausar ou remover seus cursos quando quiser, sem multa e sem burocracia.",
  },
];

const STEPS = [
  { title: "Cadastre-se grátis", description: "Crie sua conta de parceiro em menos de um minuto." },
  { title: "Publique seus cursos", description: "Cadastre cursos gratuitos ou pagos e escolha destacar os principais." },
  { title: "Receba leads", description: "Acompanhe cliques, interesse e leads direto no seu painel de parceiro." },
];

function formatStat(value: number) {
  if (value >= 1000) return `${Math.floor(value / 100) / 10} mil`.replace(".", ",");
  return String(value);
}

export default async function ParceiroLandingPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const [userCount, courseCount, areaCount, clickCount] = await Promise.all([
    prisma.user.count(),
    prisma.externalCourse.count({ where: { active: true } }),
    prisma.externalCourse
      .findMany({ where: { active: true }, distinct: ["area"], select: { area: true } })
      .then((rows) => rows.length),
    prisma.partnerCourseClick.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
  ]);

  // Só mostramos números que já contam uma história boa
  const stats = [
    userCount >= 500 && { value: formatStat(userCount), label: "profissionais cadastrados buscando qualificação" },
    courseCount >= 100 && { value: formatStat(courseCount), label: "cursos ativos no catálogo" },
    areaCount >= 10 && { value: formatStat(areaCount), label: "áreas profissionais atendidas" },
    clickCount >= 200 && { value: formatStat(clickCount), label: "cliques em cursos nos últimos 30 dias" },
  ].filter(Boolean) as { value: string; label: string }[];

  return (
    <div className="w-full">
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-24 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 opacity-25 blur-3xl" />
          <div className="absolute -bottom-40 right-[-6rem] h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 opacity-15 blur-3xl" />
        </div>

        <header className="public-header relative max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/">
            <BrandLogo heightClassName="h-12 sm:h-14" onDark />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-white/70 md:flex">
            <Link href="/empresas" className="hover:text-white">Empresas</Link>
            <Link href="/freelancers" className="hover:text-white">Freelancers</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/parceiro/login"
              className="rounded-lg border border-white/20 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/parceiro/cadastro"
              className="rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-slate-950 shadow-sm hover:bg-emerald-50 transition-colors"
            >
              Cadastrar como parceiro
            </Link>
          </div>
        </header>

        <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-14 md:py-20 text-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-5 bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
            Para parceiros
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Divulgue seus cursos para quem está buscando a próxima vaga
          </h1>
          <p className="text-white/70 mt-5 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            Escolas, instituições e criadores de curso alcançam milhares de profissionais em busca de qualificação, com painel próprio de leads, cliques e faturamento.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/parceiro/cadastro"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
            >
              Cadastrar como parceiro
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/parceiro/login"
              className="inline-flex items-center justify-center rounded-xl border border-emerald-400/40 px-6 py-3.5 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/10 transition-all"
            >
              Já tenho conta
            </Link>
          </div>
          <p className="mt-4 text-[11px] text-white/40">Cadastro grátis, sem cartão de crédito.</p>

          {stats.length > 0 && (
            <dl className="mt-10 flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="w-40 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="text-2xl font-bold text-emerald-300">{stat.value}</dd>
                  <dd className="mt-1 text-[11px] leading-snug text-white/60">{stat.label}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20 space-y-16">
        <section>
          <h2 className="text-center text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Tudo para gerenciar sua divulgação num painel só
          </h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 hover:border-emerald-400/60 transition-colors"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <Icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <h3 className="mt-4 font-bold text-neutral-900 dark:text-white">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-700 dark:text-emerald-400">Por que aqui</p>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Anúncio genérico interrompe. Aqui, seu curso é a resposta.
            </h2>
            <p className="mt-3 text-sm md:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Em redes sociais você paga para interromper quem não pediu. Na CarreirasMatch, a pessoa acabou de descobrir o que falta no currículo dela e está procurando exatamente o que você ensina.
            </p>
          </div>
          <div className="mt-10 grid sm:grid-cols-3 gap-5">
            {AUDIENCE_POINTS.map((point) => {
              const Icon = point.icon;
              return (
                <div
                  key={point.title}
                  className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <Icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <h3 className="mt-4 font-bold text-neutral-900 dark:text-white">{point.title}</h3>
                  <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{point.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-neutral-200 dark:border-neutral-800 bg-slate-950 text-white p-8 md:p-10 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.16),transparent_40%)]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/45">Como funciona</p>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight max-w-2xl">
              <GraduationCap className="inline h-7 w-7 mb-1 mr-2 text-emerald-400" />
              Do cadastro ao primeiro lead, em minutos
            </h2>
            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              {STEPS.map((step, idx) => (
                <div key={step.title} className="rounded-2xl border border-white/10 bg-white/6 p-5 backdrop-blur-sm">
                  <div className="h-7 w-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <p className="mt-3 font-semibold">{step.title}</p>
                  <p className="mt-1 text-sm text-white/70 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto">
          <h2 className="text-center text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Perguntas frequentes
          </h2>
          <div className="mt-8 divide-y divide-neutral-200 dark:divide-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            {FAQ.map((item) => (
              <details key={item.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-neutral-900 dark:text-white">
                  {item.q}
                  <ArrowRight className="h-4 w-4 shrink-0 text-emerald-600 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-neutral-800 bg-slate-950 text-white p-8 md:p-10 max-w-4xl mx-auto shadow-xl relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.15),transparent_50%)] pointer-events-none" />
          <div className="relative">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                Atendimento consultivo
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
                <MessageSquareText className="h-7 w-7 text-emerald-400" />
                Prefere conversar antes?
              </h2>
              <p className="mt-3 text-sm md:text-base text-white/70 leading-relaxed">
                Se você representa uma faculdade, edtech ou grande catálogo de cursos, preencha abaixo para receber nossa apresentação e suporte direto por WhatsApp ou e-mail.
              </p>
            </div>
            <PartnerContactForm />
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-100 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/25 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-bold text-lg text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Comece a divulgar hoje
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-emerald-900/80 dark:text-emerald-200/80">
              {["Cadastro grátis, sem cartão", "Publique seu primeiro curso em minutos", "Checkout fácil via Mercado Pago para cursos pagos"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/parceiro/cadastro"
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            Cadastrar como parceiro
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
