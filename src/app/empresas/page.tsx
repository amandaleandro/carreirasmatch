import Link from "next/link";
import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand-logo";
import { SiteFooter } from "@/components/site-footer";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { COMPANY_PLANS } from "@/lib/company-billing";
import {
  Search,
  KanbanSquare,
  Users,
  Building2,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Handshake,
  Upload,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Postar vaga grátis com recrutamento por IA | CarreirasMatch Empresas",
  description:
    "Publique vagas grátis, ranqueie candidatos por aderência com IA e monte um banco de talentos para recrutamento e seleção. Comece sem cartão de crédito.",
  alternates: { canonical: "/empresas" },
};

const FAQ = [
  {
    question: "Postar vaga é grátis?",
    answer:
      "Sim. Cadastrar a empresa e publicar vagas no feed público é gratuito, sem cartão de crédito. Você paga apenas se quiser triagens extras de currículo por IA além da cota gratuita, ou um plano recorrente (Starter ou Pro) com cota mensal de triagens inclusa.",
  },
  {
    question: "Como funciona o recrutamento com IA?",
    answer:
      "A cada currículo recebido (seja por candidatura no feed ou upload manual em PDF), a IA compara o conteúdo com a descrição da vaga e devolve um score de aderência com justificativa, ranqueando os candidatos automaticamente.",
  },
  {
    question: "Preciso de CNPJ para me cadastrar?",
    answer:
      "Não é obrigatório informar CNPJ no cadastro inicial. Você pode completar os dados da empresa (CNPJ, cidade, logo) a qualquer momento no perfil.",
  },
  {
    question: "Consigo buscar candidatos sem ter uma vaga publicada?",
    answer:
      "Sim, o banco de talentos permite buscar por palavra-chave e pedir contato diretamente a candidatos que optaram por ser encontrados, mesmo sem uma vaga aberta.",
  },
  {
    question: "O que são os planos Starter e Pro?",
    answer:
      "São assinaturas mensais com cota de triagens por IA inclusa (30/mês no Starter, 150/mês no Pro), além de vagas publicadas ilimitadas no feed. Pode ser cancelado quando quiser.",
  },
];

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
  { title: "Publique a vaga (ou suba currículos que já tem)", description: "Descreva a vaga e receba candidaturas, ou faça upload direto dos PDFs parados no seu e-mail." },
  { title: "IA ranqueia os candidatos", description: "Cada currículo chega já com score de aderência e pontos de atenção." },
  { title: "Fale com os melhores", description: "Avance no Kanban, agende entrevistas e feche a contratação sem ruído." },
];

const ECOSYSTEM_CARDS = [
  {
    icon: Upload,
    title: "Triagem dos currículos que você já tem",
    description: "Sem vaga publicada ainda? Suba os PDFs recebidos por e-mail e a IA rankeia por aderência na hora.",
    href: "/empresa/cadastro",
  },
  {
    icon: Briefcase,
    title: "Marketplace freelancer",
    description: "Para demanda pontual, contrate um freelancer para o projeto sem abrir um processo de CLT.",
    href: "/freelancers",
  },
  {
    icon: Handshake,
    title: "Seja parceiro",
    description: "Divulgue cursos e conteúdo para candidatos ativos na plataforma buscando se qualificar.",
    href: "/parceiro",
  },
] as const;

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function EmpresasLandingPage() {
  const analysisCount = await prisma.analysis.count().catch(() => 0);
  return (
    <div className="w-full">
      <JsonLd data={faqJsonLd(FAQ)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Empresas", path: "/empresas" }])} />

      <div className="relative overflow-hidden bg-blue-950">
        <header className="public-header relative max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/">
            <BrandLogo heightClassName="h-12 sm:h-14" onDark />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-white/70 md:flex">
            <Link href="/parceiro" className="hover:text-white">Parceiros</Link>
            <Link href="/freelancers" className="hover:text-white">Freelancers</Link>
          </nav>
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
            Publique uma vaga nova ou suba os currículos que você já recebeu, receba tudo ranqueado por aderência e converse só com quem realmente encaixa. Sem planilha, sem abrir currículo por currículo.
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
          {analysisCount >= 50 && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-200">
              {analysisCount.toLocaleString("pt-BR")} candidatos já usam o CarreirasMatch para buscar vaga, do outro lado do seu processo seletivo.
            </p>
          )}
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

        <section>
          <h2 className="text-center text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Isso é só o começo</h2>
          <p className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
            Recrutamento resolve o cargo de hoje. O CarreirasMatch continua útil para o RH depois dele.
          </p>
          <div className="mt-8 grid sm:grid-cols-3 gap-5">
            {ECOSYSTEM_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 hover:border-blue-400/60 transition-colors"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                    <Icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <h3 className="mt-4 font-bold text-neutral-900 dark:text-white">{card.title}</h3>
                  <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{card.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 transition-transform group-hover:translate-x-1">
                    Conhecer <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
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

        <section>
          <h2 className="text-center text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Comece grátis, cresça quando precisar
          </h2>
          <div className="mt-10 grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Grátis</p>
              <p className="mt-2 text-3xl font-extrabold text-neutral-900 dark:text-white">R$ 0</p>
              <ul className="mt-4 space-y-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                {["Vagas ilimitadas no feed público", "Triagens gratuitas iniciais por IA", "Banco de talentos e perfil público"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {(["starter", "pro"] as const).map((key) => {
              const plan = COMPANY_PLANS[key];
              return (
                <div key={key} className="rounded-2xl border-2 border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{plan.label}</p>
                  <p className="mt-2 text-3xl font-extrabold text-neutral-900 dark:text-white">
                    {formatBRL(plan.priceCents)}
                    <span className="text-base font-semibold text-neutral-500">/mês</span>
                  </p>
                  <ul className="mt-4 space-y-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                    {[`${plan.screeningsIncluded} triagens de currículo por IA/mês`, "Vagas ilimitadas incluso", "Cancele quando quiser"].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-center text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Perguntas frequentes
          </h2>
          <div className="mt-8 max-w-2xl mx-auto space-y-4">
            {FAQ.map((item) => (
              <div key={item.question} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5">
                <h3 className="font-bold text-neutral-900 dark:text-white">{item.question}</h3>
                <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{item.answer}</p>
              </div>
            ))}
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
