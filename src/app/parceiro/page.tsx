import Link from "next/link";
import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand-logo";
import { SiteFooter } from "@/components/site-footer";
import {
  GraduationCap,
  MousePointerClick,
  BarChart3,
  Wallet,
  Megaphone,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

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

const STEPS = [
  { title: "Cadastre-se grátis", description: "Crie sua conta de parceiro em menos de um minuto." },
  { title: "Publique seus cursos", description: "Cadastre cursos gratuitos ou pagos e escolha destacar os principais." },
  { title: "Receba leads", description: "Acompanhe cliques, interesse e leads direto no seu painel de parceiro." },
];

export default function ParceiroLandingPage() {
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
