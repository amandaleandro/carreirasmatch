import Link from "next/link";
import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand-logo";
import { SiteFooter } from "@/components/site-footer";
import {
  Search,
  KanbanSquare,
  Users,
  Building2,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "CarreirasMatch para Empresas",
  description:
    "Publique vagas, ranqueie candidatos por aderência com IA e monte um banco de talentos. Comece grátis, sem cartão de crédito.",
  alternates: { canonical: "/empresas" },
};

const FEATURES = [
  {
    icon: Search,
    title: "Triagem automática por IA",
    description: "Cada currículo recebido é lido e comparado com a vaga em segundos, sem você abrir um por um.",
  },
  {
    icon: BarChart3,
    title: "Ranking por aderência real",
    description: "Candidatos ordenados por um score de compatibilidade, não pela ordem que chegaram.",
  },
  {
    icon: KanbanSquare,
    title: "Kanban de candidaturas",
    description: "Acompanhe cada candidato por etapa do processo, do primeiro contato até a contratação.",
  },
  {
    icon: Users,
    title: "Banco de talentos",
    description: "Busque no banco de currículos por palavra-chave e entre em contato mesmo sem vaga publicada.",
  },
  {
    icon: Building2,
    title: "Perfil público da empresa",
    description: "Uma página com sua marca e vagas abertas para compartilhar e atrair candidatos.",
  },
  {
    icon: ShieldCheck,
    title: "Equipe multiusuário",
    description: "Adicione o time de RH com papéis de dono e membro, todos com acesso ao mesmo painel.",
  },
];

const STEPS = [
  { title: "Publique a vaga", description: "Descreva a vaga ou gere a descrição com IA em segundos." },
  { title: "IA ranqueia os candidatos", description: "Cada candidatura chega já com score de aderência e pontos de atenção." },
  { title: "Fale com os melhores", description: "Avance no Kanban, agende entrevistas e feche a contratação sem ruído." },
];

export default function EmpresasLandingPage() {
  return (
    <div className="w-full">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-24 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-25 blur-3xl" />
          <div className="absolute -bottom-40 right-[-6rem] h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-15 blur-3xl" />
        </div>

        <header className="public-header relative max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/">
            <BrandLogo heightClassName="h-12 sm:h-14" onDark />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/empresa/login"
              className="rounded-lg border border-white/20 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/empresa/cadastro"
              className="rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-slate-950 shadow-sm hover:bg-blue-50 transition-colors"
            >
              Cadastrar empresa
            </Link>
          </div>
        </header>

        <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-14 md:py-20 text-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-5 bg-blue-500/15 text-blue-300 border border-blue-400/30">
            Para empresas
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Encontre os candidatos certos, ranqueados por IA
          </h1>
          <p className="text-white/70 mt-5 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            Publique a vaga, receba currículos já ranqueados por aderência e converse só com quem realmente encaixa. Sem planilha, sem abrir currículo por currículo.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/empresa/cadastro"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
            >
              Cadastrar empresa grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/empresa/login"
              className="inline-flex items-center justify-center rounded-xl border border-blue-400/40 px-6 py-3.5 text-sm font-semibold text-blue-100 hover:bg-blue-500/10 transition-all"
            >
              Já tenho conta
            </Link>
          </div>
          <p className="mt-4 text-[11px] text-white/40">Comece grátis, sem cartão de crédito.</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20 space-y-16">
        <section>
          <h2 className="text-center text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Tudo que o RH precisa num painel só
          </h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 hover:border-blue-400/60 transition-colors"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.16),transparent_40%)]" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/45">Como funciona</p>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight max-w-2xl">
              Da vaga publicada à contratação, em um só painel
            </h2>
            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              {STEPS.map((step, idx) => (
                <div key={step.title} className="rounded-2xl border border-white/10 bg-white/6 p-5 backdrop-blur-sm">
                  <div className="h-7 w-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <p className="mt-3 font-semibold">{step.title}</p>
                  <p className="mt-1 text-sm text-white/70 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-blue-100 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/25 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-bold text-lg text-blue-950 dark:text-blue-100">Comece a contratar melhor hoje</p>
            <ul className="mt-3 space-y-1.5 text-sm text-blue-900/80 dark:text-blue-200/80">
              {["Sem cartão de crédito", "Publique sua primeira vaga em minutos", "Cancele quando quiser"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/empresa/cadastro"
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Cadastrar empresa grátis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
