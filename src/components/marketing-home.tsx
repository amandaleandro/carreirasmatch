import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import Link from "next/link";
import { HeroInstantScanner } from "@/components/hero-instant-scanner";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Bot,
  Radar,
  Briefcase,
  LayoutGrid,
  Target,
  ClipboardCheck,
  LineChart,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { PublicNav, PublicNavMobile } from "@/components/public-nav";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CommercialPlanCards } from "@/components/commercial-plan-cards";
import { COMMERCIAL_PLANS } from "@/lib/commercial-plan-catalog";
import { JOURNEYS } from "@/lib/journeys";


// Home mostra só 3 opções (grátis, principal, sprint) pra reduzir indecisão;
// o catálogo completo com 5 planos continua em /assinar.
const HOME_PLAN_KEYS = ["free", "pro", "sprint"];
const PUBLIC_PLAN_CARDS = Object.values(COMMERCIAL_PLANS)
  .filter((plan) => HOME_PLAN_KEYS.includes(plan.key))
  .sort((a, b) => HOME_PLAN_KEYS.indexOf(a.key) - HOME_PLAN_KEYS.indexOf(b.key))
  .map((plan) => ({
    key: plan.key,
    name: plan.name,
    priceCents: plan.priceCents,
    recurring: plan.recurring,
    durationDays: plan.durationDays ?? null,
    highlighted: Boolean(plan.highlighted),
    entitlements: Object.entries(plan.limits).map(([featureKey, limit]) => ({ limit, featureDefinition: { name: featureKey } })),
  }));
const steps = [
  ["01", "Envie seu currículo", "Cole o texto ou envie seu PDF atual. A análise respeita tudo o que você já construiu."],
  ["02", "Cole a vaga desejada", "Insira o texto ou o link da oportunidade para a qual você quer se candidatar."],
  ["03", "Descubra seu Match", "Entenda a aderência real, ajuste pontos-chave e aumente suas chances de entrevista."],
];

const journeySteps = [
  ...steps,
  ["04", "Prepare sua candidatura", "Use o diagnostico para revisar seu curriculo, organizar os proximos passos e treinar para a entrevista."],
] as const;

const deliverables = [
  "Diagnóstico claro de aderência técnica por requisito",
  "Prioridade para as oportunidades que mais combinam com você",
  "Requisitos preenchidos e lacunas para você comprovar",
  "Palavras-chave essenciais para passar nos filtros (ATS)",
  "Currículo formatado e pronto para download em PDF",
  "Guia de preparação para as perguntas da entrevista",
  "Histórico para entender o que está gerando respostas",
  "Plano de ação simples com os próximos passos",
];

const decisionCards = [
  [Target, "Escolha onde investir", "Compare suas oportunidades e comece pelas vagas em que seu perfil tem mais força."],
  [ClipboardCheck, "Candidate-se com evidências", "Ajuste seu currículo e organize cada próximo passo sem inventar nada sobre sua trajetória."],
  [LineChart, "Aprenda com o caminho", "Registre resultados, identifique padrões e transforme cada candidatura em uma decisão melhor."],
] as const;

export const marketingFaqs = [
  ["A análise gratuita já mostra o resultado?", "Sim. Você recebe o resultado inicial de aderência. O Kit Candidatura reúne a versão otimizada em PDF, a análise de palavras-chave e a preparação para entrevista."],
  ["A plataforma inventa qualificações no meu currículo?", "Não. As sugestões reorganizam e tornam mais claras apenas as informações fornecidas por você. Nada deve ser incluído sem corresponder à sua trajetória real."],
  ["O mesmo currículo serve para todas as vagas?", "Não. Cada empresa valoriza palavras-chave e prioridades diferentes. Adaptar o currículo para a vaga aumenta significativamente sua taxa de resposta."],
  ["O que acontece se a análise falhar tecnicamente?", "Caso ocorra qualquer oscilação de sistema, você pode tentar novamente instantaneamente ou acionar o suporte humano para liberação sem custos."],
  ["O CarreirasMatch garante contratação?", "Auxiliamos você a apresentar seu perfil de forma impecável e se preparar melhor, porém a decisão final de contratação cabe à empresa."],
];

const founderWeek = [
  ["SEG", "Papo com recrutadora", "10:00"],
  ["SEG", "Entrevista: Analista", "14:00"],
  ["TER", "Entrevista: DevOps", "15:00"],
  ["QUA", "Entrevista: Analista de Sistemas", "10:00"],
  ["QUI", "Entrevista: Analista", "14:00"],
  ["QUI", "1ª impressão com o time", "16:00"],
] as const;

const ecosystemCards = [
  [Bot, "Candidatura automática", "Depois do Match, deixe o CarreirasMatch aplicar sozinho nas vagas mais compatíveis com o seu perfil.", "/applications"],
  [Radar, "Radar de concurso e vestibular", "Editais e provas monitorados por você, com alertas assim que saem.", "/concursos"],
  [Briefcase, "Marketplace freelancer", "Contrate ou seja contratado para projetos, com um perfil já validado pela plataforma.", "/freelancers"],
  [LayoutGrid, "Central de candidaturas", "Histórico de Match, currículos e kits organizados por vaga, sem planilha.", "/applications"],
] as const;

// Reduzida a 4 entradas na home (o diagnóstico apontou 8 cards competindo
// cedo demais); a lista completa de momentos continua acessível no menu.
const audienceCards = [
  ["Começando agora", "Primeiro emprego ou estágio", "Transforme cursos, projetos e atividades em experiência que conta na candidatura.", "/analise"],
  ["Aprendendo", "Descubra seu próximo caminho", "Explore cursos, profissões e possibilidades para tomar decisões com mais clareza.", "/descobrir"],
  ["Voltando ao mercado", "Recolocação", "Ajuste seu currículo para as exigências atuais das empresas e conquiste respostas.", "/analise"],
  ["Mudando de área", "Transição de carreira", "Identifique as habilidades que você já tem e que aproximam você da nova área.", "/tools/matriz-de-skills"],
  ["Construindo seu caminho", "Projetos, freelas e renda", "Encontre formas de colocar suas habilidades em prática, criar portfólio e gerar novas oportunidades.", "/freelancers"],
] as const;

function SocialProof({ analysisCount }: { analysisCount: number }) {
  const calendarShot = existsSync(join(process.cwd(), "public", "prova-social", "agenda-entrevistas.png"));

  return (
    <section className="border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 py-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Uma história real de quem viveu essa busca
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug">
            5 entrevistas em uma única semana. A agenda foi a nossa resposta.
          </h2>
          <blockquote className="border-l-3 border-blue-600 pl-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            &ldquo;Criei o CarreirasMatch porque conheço de perto a frustração de ter um bom histórico e não receber respostas. Quando ajustei meu currículo especificamente para cada vaga, conquistei 5 entrevistas em sete dias.&rdquo;
          </blockquote>
          <p className="text-xs font-semibold text-slate-900 dark:text-white">
            Amanda, criadora do CarreirasMatch
          </p>
          {analysisCount >= 50 && (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-4 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4 shrink-0" />
              Mais de {analysisCount.toLocaleString("pt-BR")} currículos analisados e preparados
            </div>
          )}
        </div>

        {calendarShot ? (
          <Image
            src="/prova-social/agenda-entrevistas.png"
            alt="Agenda semanal com 5 entrevistas marcadas"
            width={1425}
            height={1205}
            loading="lazy"
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="w-full rounded-2xl border border-slate-200/90 shadow-md dark:border-slate-800"
          />
        ) : (
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <p className="mb-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Agenda de entrevistas da Amanda
            </p>
            <ul className="space-y-2.5">
              {founderWeek.map(([day, title, time]) => (
                <li key={day + title} className="flex items-center gap-3 rounded-xl bg-white p-3 text-xs shadow-xs dark:bg-slate-800">
                  <span className="w-10 shrink-0 text-center text-[10px] font-extrabold text-blue-600 dark:text-blue-400">{day}</span>
                  <span className="flex-1 font-semibold text-slate-800 dark:text-slate-200">{title}</span>
                  <span className="text-[10px] font-bold text-slate-400">{time}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function PrimaryCta({ label = "Analisar meu currículo gratuitamente" }: { label?: string }) {
  return (
    <Link
      href="/analise"
      className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-95"
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

export function MarketingHome({ analysisCount = 0 }: { analysisCount?: number }) {
  return (
    <div className="w-full overflow-hidden font-sans">
      {/* HERO SECTION - HUMAN, EMPOWERING & CLEAN */}
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

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-8 md:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pb-28 lg:pt-14">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-300">
              Seu copiloto para decisões de carreira
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight text-white">
              Escolha melhor a vaga. Prepare melhor a candidatura.
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-slate-300 max-w-2xl">
              Compare seu perfil com oportunidades reais, descubra onde vale investir seu tempo e avance com um plano claro: do primeiro Match à próxima entrevista.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row pt-2">
              <PrimaryCta label="Analisar uma vaga grátis" />
              <a href="#exemplo" className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-white/10 transition-all">
                Ver como funciona
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-300 pt-2">
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Sem cartão</span>
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Resultado inicial gratuito</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" /> Seus dados protegidos</span>
            </div>
          </div>

          <div>
            <HeroInstantScanner />
          </div>
        </div>
      </section>

      <main>
        {/* EXEMPLO PRÁTICO */}
        <section id="exemplo" className="mx-auto max-w-7xl scroll-mt-8 px-4 py-20 md:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Você pode ter experiência e ainda ser descartado se o currículo não mostrar o que a vaga procura
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Mostramos o que a empresa procura, o que já se destaca no seu perfil e onde vale a pena dedicar atenção antes do envio.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <Card variant="interactive">
              <CardHeader>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Pontos Fortes Identificados</span>
                <CardTitle className="mt-2">Veja onde seu currículo combina</CardTitle>
                <CardDescription>Competências, experiências e palavras-chave já alinhadas à oportunidade.</CardDescription>
              </CardHeader>
            </Card>

            <Card variant="interactive">
              <CardHeader>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Oportunidade de Ajuste</span>
                <CardTitle className="mt-2">Descubra o que pode eliminar você</CardTitle>
                <CardDescription>Requisitos ausentes, trechos genéricos e problemas de leitura pelo ATS.</CardDescription>
              </CardHeader>
            </Card>

            <Card variant="interactive" className="border-blue-200 dark:border-blue-900">
              <CardHeader>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Sugestão Prática</span>
                <CardTitle className="mt-2">Saiba exatamente o que ajustar</CardTitle>
                <CardDescription>Receba ações priorizadas antes de enviar a candidatura.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* DECISÃO E CONTINUIDADE */}
        <section className="border-y border-blue-100 bg-blue-50/50 dark:border-blue-950/60 dark:bg-blue-950/15">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
            <div className="mx-auto max-w-3xl text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Mais clareza em cada candidatura</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Não é só sobre melhorar o currículo. É sobre melhorar suas decisões.
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                O CarreirasMatch transforma cada oportunidade em um próximo passo concreto, e cada resultado em aprendizado para a sua estratégia.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {decisionCards.map(([Icon, title, description]) => (
                <Card key={title} variant="default" className="p-6">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-base font-bold text-slate-900 dark:text-white">{title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="border-y border-slate-200/80 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 space-y-12">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Do próximo passo ao próximo nível em 4 movimentos
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {journeySteps.map(([number, title, description]) => (
                <Card key={number} variant="default" className="p-6 space-y-4">
                  <span className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                    {number}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* PROVA SOCIAL */}
        <SocialProof analysisCount={analysisCount} />

        {/* MOMENTO PROFISSIONAL */}
        <section id="momento" className="mx-auto max-w-7xl scroll-mt-8 px-4 py-16 md:px-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Em que momento da sua carreira você está?
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Escolha o que mais combina com você agora e veja o próximo passo recomendado.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {audienceCards.map(([label, title, description, href]) => (
              <Link key={href} href={href} className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <span className="inline-block text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{label}</span>
                <h3 className="mt-3 text-base font-bold leading-snug text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-transform group-hover:translate-x-1">Saiba mais <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
            ))}
          </div>
        </section>

        {/* ECOSSISTEMA */}
        <section className="border-y border-slate-200/80 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                E o CarreirasMatch continua com você depois da primeira análise
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Aprenda, planeje sua evolução, prepare candidaturas, acompanhe seus processos e encontre novas oportunidades.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ecosystemCards.map(([Icon, title, description, href]) => (
                <Link key={href + title} href={href} className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all hover:-translate-y-1 hover:border-blue-500/40 dark:border-slate-800 dark:bg-slate-900">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-bold leading-snug text-slate-900 dark:text-white">{title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-transform group-hover:translate-x-1">Conhecer <ArrowRight className="h-3.5 w-3.5" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* O QUE VEM NO KIT */}
        <section id="kit" className="mx-auto max-w-7xl px-4 py-20 md:px-8 grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Tudo o que você precisa para se candidatar com segurança
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Do autoconhecimento ao desenvolvimento, dos projetos às candidaturas: você encontra orientação prática para tomar decisões e agir.
            </p>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            {deliverables.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 shadow-xs">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <CommercialPlanCards
          plans={PUBLIC_PLAN_CARDS}
          title="Gratuito ou Carreira Pro: qual combina com você agora?"
          subtitle="Escolha o suporte que combina com o seu momento: para começar, se desenvolver ou acelerar sua próxima fase."
        />

        {/* OUTRAS JORNADAS - aparece só depois da jornada principal (candidato) */}
        <section className="border-y border-slate-200/80 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              O CarreirasMatch também acompanha outros objetivos
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Link
                href={JOURNEYS.study.free.href}
                className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all hover:-translate-y-1 hover:border-blue-500/40 dark:border-slate-800 dark:bg-slate-900"
              >
                <h3 className="text-base font-bold leading-snug text-slate-900 dark:text-white">Quero estudar para uma aprovação</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{JOURNEYS.study.promise}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-transform group-hover:translate-x-1">Começar <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
              <Link
                href={JOURNEYS.company.free.href}
                className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all hover:-translate-y-1 hover:border-blue-500/40 dark:border-slate-800 dark:bg-slate-900"
              >
                <h3 className="text-base font-bold leading-snug text-slate-900 dark:text-white">Quero contratar melhor</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{JOURNEYS.company.promise}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-transform group-hover:translate-x-1">Conhecer <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-4xl px-4 py-20 md:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Perguntas frequentes</h2>
          </div>

          <div className="space-y-4">
            {marketingFaqs.map(([q, a]) => (
              <Card key={q} className="p-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{q}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{a}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pb-20 md:px-8">
          <div className="rounded-3xl bg-blue-600 px-6 py-10 text-center shadow-xl shadow-blue-600/15 sm:px-10">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">O próximo capítulo da sua carreira começa com clareza</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-blue-100">
              Entenda onde você está, descubra possibilidades e escolha o próximo passo que faz sentido para você.
            </p>
            <Link href="/analise" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50">
              Explorar minha jornada <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
