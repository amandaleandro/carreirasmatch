import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GraduationCap, BookOpen, Landmark, Scale, School } from "lucide-react";
import { PublicNav, PublicNavMobile } from "@/components/public-nav";
import { SiteFooter } from "@/components/site-footer";
import { BrandLogo } from "@/components/brand-logo";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { JOURNEYS } from "@/lib/journeys";
import { RotaMatchSteps } from "@/components/rota-match-steps";
import { JourneyCtaLink } from "@/components/journey-cta-link";

export const metadata: Metadata = {
  title: "Rota de Aprovação: ENEM, vestibular, concurso e OAB | CarreirasMatch",
  description:
    "Escolha seu objetivo de estudo e receba um diagnóstico, um plano e as ferramentas certas para chegar até a aprovação.",
  alternates: { canonical: "/estudos" },
};

const OBJECTIVES = [
  { icon: GraduationCap, title: "ENEM", description: "Calculadora de nota, cronograma, simulados e redação.", href: "/ensino-medio/calculadora-enem" },
  { icon: Landmark, title: "Vestibular", description: "Catálogo de cursos e universidades para decidir com clareza.", href: "/universidade" },
  { icon: BookOpen, title: "Concurso público", description: "Leitura de edital, simulado, nota de corte e plano de estudo.", href: "/tools/concurso" },
  { icon: Scale, title: "Exame da OAB", description: "Preparação focada para a segunda fase.", href: "/tools/oab" },
  { icon: School, title: "Ensino médio", description: "Exercícios, flashcards, tutor de estudos e redação por matéria.", href: "/ensino-medio" },
] as const;

export default function EstudosPage() {
  const journey = JOURNEYS.study;

  return (
    <div className="w-full">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Estudos", path: "/estudos" },
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
            {journey.subscription.label}
          </span>

          <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.15] tracking-tight text-white">
            {journey.tagline}
          </h1>

          <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-300 max-w-2xl mx-auto">
            {journey.promise}
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <JourneyCtaLink
              href={journey.free.href}
              journey={journey.key}
              tier="free"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-95"
            >
              {journey.free.label}
              <ArrowRight className="h-4 w-4" />
            </JourneyCtaLink>
          </div>

          <RotaMatchSteps className="mt-10" />
        </div>
      </section>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-20 md:px-8">
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Escolha seu objetivo
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OBJECTIVES.map(({ icon: Icon, title, description, href }) => (
              <Link
                key={title}
                href={href}
                className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all hover:-translate-y-1 hover:border-blue-500/40 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-bold leading-snug text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-transform group-hover:translate-x-1">Começar <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-blue-100 bg-blue-50/50 dark:border-blue-950/60 dark:bg-blue-950/15">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Não sabe por onde começar?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Faça o {journey.free.label.toLowerCase()}: escolha seu objetivo e receba uma leitura inicial da
              sua situação com o primeiro passo para começar hoje.
            </p>
            <Link
              href={journey.free.href}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700"
            >
              {journey.free.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
