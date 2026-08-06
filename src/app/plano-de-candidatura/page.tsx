import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PublicNav, PublicNavMobile } from "@/components/public-nav";
import { SiteFooter } from "@/components/site-footer";
import { BrandLogo } from "@/components/brand-logo";
import { Card } from "@/components/ui/card";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { JOURNEYS } from "@/lib/journeys";
import { RotaMatchSteps } from "@/components/rota-match-steps";
import { JourneyCtaLink } from "@/components/journey-cta-link";

export const metadata: Metadata = {
  title: "Plano de Candidatura: prepare-se para uma vaga específica | CarreirasMatch",
  description:
    "Receba um diagnóstico completo para a vaga que você quer: Match detalhado, requisitos, ajustes de currículo, mensagem para o recrutador e perguntas prováveis de entrevista.",
  alternates: { canonical: "/plano-de-candidatura" },
};

const deliverables = [
  "Match detalhado por requisito técnico e de experiência",
  "Requisitos atendidos, ausentes e parcialmente atendidos",
  "Palavras-chave que faltam para passar no ATS",
  "Ajustes recomendados no currículo para esta vaga",
  "Mensagem sugerida para o recrutador",
  "Perguntas prováveis da entrevista",
  "Assuntos para estudar antes de se candidatar",
  "Recomendação clara: candidatar-se, ajustar ou estudar antes",
];

const faq = [
  {
    question: "O Plano de Candidatura é diferente da análise gratuita?",
    answer:
      "Sim. A análise gratuita mostra seu Match inicial e uma lacuna principal. O Plano de Candidatura entrega o diagnóstico completo: todos os requisitos, ajustes de currículo, mensagem para o recrutador e preparação para a entrevista dessa vaga específica.",
  },
  {
    question: "Preciso de uma assinatura para comprar o Plano de Candidatura?",
    answer:
      "Não. É uma compra avulsa, para uma vaga específica. Quem se candidata com frequência costuma migrar para a Rota Profissional, que inclui análises recorrentes e acompanhamento contínuo.",
  },
  {
    question: "Quanto tempo leva?",
    answer:
      "Poucos minutos. Você envia o currículo e a vaga (texto ou link) e recebe o diagnóstico completo na mesma sessão.",
  },
];

export default function PlanoDeCandidaturaPage() {
  const journey = JOURNEYS.career;

  return (
    <div className="w-full">
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Plano de Candidatura", path: "/plano-de-candidatura" },
        ])}
      />

      <section className="relative bg-[#071827] text-white">
        <header className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 md:px-8">
          <Link href="/" aria-label="CarreirasMatch">
            <BrandLogo heightClassName="h-10 sm:h-12" onDark />
          </Link>
          <PublicNav />
          <div className="flex items-center gap-2.5">
            <Link href="/login" className="rounded-full border border-white/20 px-4.5 py-2 text-xs font-semibold hover:bg-white/10 transition-all">Entrar</Link>
            <Link href="/register" className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-all shadow-xs">Criar Conta</Link>
            <PublicNavMobile />
          </div>
        </header>

        <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-8 text-center md:px-8 lg:pb-28 lg:pt-14">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-300">
            {journey.oneOff.label}
          </span>

          <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.15] tracking-tight text-white">
            {journey.tagline}
          </h1>

          <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-300 max-w-2xl mx-auto">
            Receba um plano completo para se preparar para esta vaga: Match, lacunas, ajustes de currículo e
            preparação para a entrevista, tudo em um único diagnóstico.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <JourneyCtaLink
              href={journey.oneOff.href}
              journey={journey.key}
              tier="oneOff"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-95"
            >
              Analisar minha vaga
              <ArrowRight className="h-4 w-4" />
            </JourneyCtaLink>
            <JourneyCtaLink
              href={journey.subscription!.href}
              journey={journey.key}
              tier="subscription"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-white/10 transition-all"
            >
              Buscando várias vagas? Conheça a {journey.subscription!.label}
            </JourneyCtaLink>
          </div>

          <RotaMatchSteps className="mt-10" />
        </div>
      </section>

      <main>
        <section className="mx-auto max-w-4xl px-4 py-20 md:px-8">
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            O que vem no seu Plano de Candidatura
          </h2>

          <div className="mt-10 grid gap-3.5 sm:grid-cols-2">
            {deliverables.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 shadow-xs"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-blue-100 bg-blue-50/50 dark:border-blue-950/60 dark:bg-blue-950/15">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Comece pelo seu Match gratuito
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Envie o currículo e a vaga primeiro. Se houver lacunas que valem a pena resolver antes de se
              candidatar, o Plano de Candidatura fica disponível ali mesmo.
            </p>
            <JourneyCtaLink
              href={journey.free.href}
              journey={journey.key}
              tier="free"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700"
            >
              {journey.free.label}
              <ArrowRight className="h-4 w-4" />
            </JourneyCtaLink>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-20 md:px-8 space-y-8">
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Perguntas frequentes
          </h2>
          <div className="space-y-4">
            {faq.map(({ question, answer }) => (
              <Card key={question} className="p-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{question}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{answer}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
