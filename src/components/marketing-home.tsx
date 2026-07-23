import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import Link from "next/link";
import { HeroInstantScanner } from "@/components/hero-instant-scanner";
import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  Check,
  FileCheck2,
  FileSearch,
  GraduationCap,
  LockKeyhole,
  Landmark,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  UserRoundSearch,
  X,
  CheckCircle2,
  Zap,
  TrendingUp,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { SiteFooter } from "@/components/site-footer";
import { CAREER_OFFERS } from "@/lib/career-offers";

const steps = [
  ["01", "Envie seu currículo", "Use seu PDF atual. A análise parte apenas das informações que você já tem."],
  ["02", "Adicione a vaga", "Cole a descrição ou o link da oportunidade que você realmente quer disputar."],
  ["03", "Ajuste antes de enviar", "Veja lacunas, palavras-chave e gere uma versão otimizada para essa candidatura."],
];

const deliverables = [
  "Score explicado por critério técnico de contratação",
  "Requisitos encontrados e lacunas a comprovar",
  "Palavras-chave indispensáveis para triagem automatizada (ATS)",
  "Currículo otimizado e pronto para baixar em PDF",
  "Roteiro de perguntas e preparação para entrevista",
  "Plano de ação estratégico com ajustes prioritários",
];

const journeys = [
  ["/estagio", "Estágio", "Mostre projetos, cursos e atividades como evidências relevantes.", GraduationCap],
  ["/primeiro-emprego", "Primeiro Emprego", "Apresente potencial real sem precisar inventar experiência profissional.", UserRoundSearch],
  ["/recolocacao", "Recolocação", "Traduza sua bagagem para a linguagem e exigências da vaga atual.", BriefcaseBusiness],
  ["/transicao", "Transição de Carreira", "Destaque habilidades transferíveis e construa uma narrativa coerente.", RefreshCw],
] as const;

const studyJourneys = [
  {
    href: "/faculdade-ou-tecnico",
    title: "Vestibular e escolha de curso",
    description: "Compare áreas, cursos e caminhos de formação antes de decidir seu próximo passo.",
    linkLabel: "Explorar orientação",
    Icon: BookOpenCheck,
  },
  {
    href: "/concurso",
    title: "Concursos públicos",
    description: "Transforme o edital em prioridades, plano de estudo e preparação para a prova.",
    linkLabel: "Preparar para concurso",
    Icon: Landmark,
  },
  {
    href: "/oab",
    title: "Exame da OAB",
    description: "Organize a preparação para a 1ª e a 2ª fase com foco no padrão da FGV.",
    linkLabel: "Preparar para a OAB",
    Icon: Scale,
  },
] as const;

const faqs = [
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

function SocialProof({ analysisCount }: { analysisCount: number }) {
  const calendarShot = existsSync(join(process.cwd(), "public", "prova-social", "agenda-entrevistas.png"));

  return (
    <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Testado na vida real</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            5 entrevistas em uma semana. A agenda é a prova.
          </h2>
          <blockquote className="border-l-4 border-blue-600 pl-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            &ldquo;Eu criei o CarreirasMatch para resolver o meu próprio problema: currículo bom, zero resposta.
            Na primeira semana usando a versão otimizada, marquei <strong className="text-slate-900 dark:text-white">5 entrevistas</strong>,
            fora as vagas em inglês que nem cheguei a agendar.&rdquo;
          </blockquote>
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            Amanda, criadora do CarreirasMatch
          </p>
          {analysisCount >= 50 && (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
              {analysisCount.toLocaleString("pt-BR")} análises de currículo já realizadas
            </div>
          )}
        </div>

        {calendarShot ? (
          <Image
            src="/prova-social/agenda-entrevistas.png"
            alt="Agenda semanal com 5 entrevistas marcadas"
            width={1425}
            height={1205}
            className="w-full rounded-3xl border border-slate-200 shadow-lg dark:border-slate-800"
          />
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Uma semana da agenda da Amanda</p>
            <ul className="space-y-2.5">
              {founderWeek.map(([day, title, time]) => (
                <li key={day + title} className="flex items-center gap-3 rounded-xl bg-white p-3 text-xs shadow-2xs dark:bg-slate-800">
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

function PrimaryCta({ label = "Analisar meu currículo grátis" }: { label?: string }) {
  return (
    <Link
      href="/analise"
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 hover:scale-[1.02]"
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

export function MarketingHome({ analysisCount = 0 }: { analysisCount?: number }) {
  return (
    <div className="w-full overflow-hidden font-sans">
      {/* HERO SECTION */}
      <section className="relative bg-[linear-gradient(135deg,#071827_0%,#0e2a4a_60%,#071827_100%)] text-white">
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-28 -top-36 h-[30rem] w-[30rem] rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-40 right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <header className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 md:px-8">
          <Link href="/" aria-label="CarreirasMatch">
            <BrandLogo heightClassName="h-12 sm:h-14" onDark />
          </Link>
          <nav aria-label="Navegação principal" className="hidden items-center gap-6 text-sm font-medium text-white/80 md:flex">
            <a href="#exemplo" className="hover:text-white transition-colors">Ver Exemplo</a>
            <a href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</a>
            <a href="#kit" className="hover:text-white transition-colors">O Que Você Recebe</a>
            <a href="#preco" className="hover:text-white transition-colors">Planos & Preços</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition-all">Entrar</Link>
            <Link href="/register" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-blue-500 transition-all shadow-md">Criar Conta</Link>
          </div>
        </header>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-10 md:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pb-28 lg:pt-16">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 border border-blue-400/30 px-3.5 py-1.5 rounded-full">
              <Target className="h-4 w-4 text-blue-400" /> Comparativo de Perfil x Vaga Real
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-white">
              Se candidata e ninguém responde? O problema pode ser o filtro, não você.
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-white/80 max-w-2xl">
              A maioria dos currículos é descartada pelo filtro automático (ATS) antes de um recrutador ler. Compare o seu com a vaga real, descubra o que está te eliminando e envie a versão otimizada em PDF.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row pt-2">
              <PrimaryCta />
              <a href="#exemplo" className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3.5 text-sm font-bold hover:bg-white/10 transition-all">
                Ver exemplo do diagnóstico
              </a>
            </div>

            <div className="grid gap-2.5 text-xs font-semibold text-white/80 sm:grid-cols-2 pt-2">
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Resultado inicial gratuito</span>
              <span className="inline-flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-emerald-400" /> Currículo em formato PDF</span>
              <span className="inline-flex items-center gap-2"><FileSearch className="h-4 w-4 text-emerald-400" /> Palavras-chave do filtro ATS</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Dados 100% seguros</span>
            </div>
          </div>

          <div>
            <HeroInstantScanner />
          </div>
        </div>
      </section>

      <main>
        {/* PROVA SOCIAL */}
        <SocialProof analysisCount={analysisCount} />

        {/* EXEMPLO PRÁTICO */}
        <section id="exemplo" className="mx-auto max-w-7xl scroll-mt-8 px-4 py-20 md:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Demonstração Prática</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">A nota é apenas o início do diagnóstico.</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">O CarreirasMatch aponta a justificativa exata das lacunas e sugere alterações reais para você revisar antes de aplicar.</p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Encontrado no Currículo</p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Planejamento de Conteúdo</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Seu perfil apresenta evidências comprovadas de planejamento e elaboração de textos.</p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Ponto de Atenção</p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Métricas de Resultado</h3>
              <p className="text-xs text-slate-500 leading-relaxed">A vaga exige demonstração de indicadores de desempenho, mas seu resumo atual não cita números.</p>
            </article>

            <article className="rounded-3xl border border-blue-200 bg-blue-50/70 p-6 shadow-2xs dark:border-blue-900 dark:bg-blue-950/30 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Ação Recomendada</p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ajuste de Impacto</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Adicione o percentual ou volume alcançado. Caso seja uma nova atribuição, prepare-se para detalhar sua curva de aprendizado.</p>
            </article>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="border-y border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 space-y-12">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Fluxo Simples</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">Da análise à candidatura em 3 passos</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {steps.map(([number, title, description]) => (
                <article key={number} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                  <span className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-blue-600/20">
                    {number}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* O QUE VEM NO KIT */}
        <section id="kit" className="mx-auto max-w-7xl px-4 py-20 md:px-8 grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div className="space-y-4">
            <span className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 flex items-center justify-center border border-blue-200 dark:border-blue-900">
              <FileCheck2 className="h-6 w-6" />
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Conteúdo do Kit Candidatura</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Tudo o que você precisa para se apresentar com máxima relevância para uma vaga específica e se preparar para as etapas presenciais.
            </p>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            {deliverables.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 shadow-2xs">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* PLANOS E PREÇOS - DESIGN REDESENHADO */}
        <section id="preco" className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900">
                Planos Transparentes
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
                Escolha o formato ideal para a sua busca
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sem contratos longos ou pegadinhas. Cancele ou mude de plano a qualquer momento.
              </p>
            </div>

            {/* 4 CARDS INDEPENDENTES E BEM ESPAÇADOS */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {/* Card 1: Grátis */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-sm space-y-6">
                <div className="space-y-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Degustação
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Grátis</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    1ª leitura inicial para testar seu perfil.
                  </p>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Score inicial de aderência</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Leitura preliminar de requisitos</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Resumo dos principais pontos</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/analise"
                  className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 text-center text-xs transition-all shadow-md shadow-blue-600/20"
                >
                  Testar Grátis Agora →
                </Link>
              </div>

              {/* Card 2: Análise Avulsa */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-sm space-y-6">
                <div className="space-y-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Avulso · 1 Vaga
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Análise Completa</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">R$ 9,90</span>
                    <span className="text-[11px] text-slate-500 font-semibold">/ único</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Diagnóstico detalhado para 1 vaga pontual.
                  </p>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Score de aderência de 0 a 100%</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Palavras-chave do filtro ATS</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Justificativa técnica detalhada</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/analise"
                  className="w-full rounded-2xl border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold py-3.5 text-center text-xs transition-all"
                >
                  Fazer Análise (R$ 9,90) →
                </Link>
              </div>

              {/* Card 3: Kit Candidatura */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-sm space-y-6">
                <div className="space-y-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Entrega Completa · 1 Vaga
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Kit Candidatura</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">R$ 12,90</span>
                    <span className="text-[11px] text-slate-500 font-semibold">/ único</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Currículo PDF + carta + preparação entrevista.
                  </p>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Tudo da Análise Completa</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Currículo Otimizado em PDF</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Carta de Apresentação pronta</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/analise"
                  className="w-full rounded-2xl border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold py-3.5 text-center text-xs transition-all"
                >
                  Gerar Kit (R$ 12,90) →
                </Link>
              </div>

              {/* Card 4: Assinatura Mensal Profissional (O MAIS ESCOLHIDO) */}
              <div className="rounded-3xl border-2 border-blue-500 bg-[#071827] text-white p-6 flex flex-col justify-between shadow-2xl relative space-y-6 mt-4 sm:mt-0">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 text-white px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-md whitespace-nowrap z-10">
                  ⭐ O Mais Escolhido
                </span>

                <div className="space-y-4 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">
                    Acesso Ilimitado
                  </span>
                  <h3 className="text-xl font-extrabold text-white leading-tight">Plano Profissional</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">R$ 24,90</span>
                    <span className="text-[11px] text-slate-300 font-semibold">/mês</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    2 kits avulsos já custam R$ 25,80. Quem busca ativamente aplica em 10+ vagas. Aqui é ilimitado.
                  </p>

                  <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs font-semibold text-slate-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Análises de Vaga Ilimitadas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Kits de Candidatura Ilimitados</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Simulador de Entrevistas</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/assinar?segment=career_pro"
                  className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3.5 text-center text-xs shadow-lg shadow-blue-600/40 transition-all hover:scale-[1.02] inline-flex items-center justify-center gap-1.5"
                >
                  <span>Assinar R$ 24,90/mês</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <p className="text-center text-[10px] font-semibold text-slate-400">
                  Sem fidelidade · cancele em 2 cliques
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQS */}
        <section className="mx-auto max-w-3xl px-4 py-20 md:px-8 space-y-10">
          <div className="text-center space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Dúvidas Frequentes</p>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Tudo o que você precisa saber</h2>
          </div>

          <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group py-5">
                <summary className="cursor-pointer font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between list-none">
                  <span>{question}</span>
                  <span className="transition group-open:rotate-180 text-blue-600">↓</span>
                </summary>
                <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* FOOTER CTA */}
        <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
          <div className="grid gap-8 rounded-3xl bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-12 text-white md:px-12 lg:grid-cols-[1fr_auto] lg:items-center shadow-xl">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold">Encontrou uma vaga? Não envie o mesmo currículo genérico.</h2>
              <p className="text-sm text-white/80 max-w-2xl">Compare seu perfil com os requisitos da vaga e envie uma versão preparada em PDF.</p>
            </div>
            <PrimaryCta label="Começar Análise Agora" />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
