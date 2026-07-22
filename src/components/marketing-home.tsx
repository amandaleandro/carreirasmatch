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
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { SiteFooter } from "@/components/site-footer";
import { CAREER_OFFERS } from "@/lib/career-offers";

const kitPrice = CAREER_OFFERS[0].diagnosticPrice;
const careerSubscription = CAREER_OFFERS.find((offer) => offer.segment === "career_pro") ?? CAREER_OFFERS[0];

const steps = [
  ["01", "Envie seu currículo", "Use seu PDF atual. A análise parte apenas das informações que você já tem."],
  ["02", "Adicione a vaga", "Cole a descrição ou o link da oportunidade que você realmente quer disputar."],
  ["03", "Ajuste antes de enviar", "Veja lacunas, palavras-chave e gere uma versão otimizada para essa candidatura."],
];

const deliverables = [
  "Score explicado por critério, não apenas uma nota",
  "Requisitos encontrados e o que ainda falta comprovar",
  "Palavras-chave relevantes para sistemas ATS",
  "Currículo otimizado e pronto para baixar em PDF",
  "Perguntas prováveis e preparação para entrevista",
  "Plano de ação com os ajustes prioritários",
];

const journeys = [
  ["/estagio", "Estágio", "Mostre projetos, cursos e atividades como evidências relevantes.", GraduationCap],
  ["/primeiro-emprego", "Primeiro emprego", "Apresente potencial sem precisar inventar experiência profissional.", UserRoundSearch],
  ["/recolocacao", "Recolocação", "Traduza sua experiência para a linguagem da vaga atual.", BriefcaseBusiness],
  ["/transicao", "Transição de carreira", "Destaque habilidades transferíveis e construa uma narrativa coerente.", RefreshCw],
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
  ["A análise gratuita já mostra alguma coisa?", "Sim. Você recebe o resultado inicial de aderência. O Kit Candidatura reúne a versão otimizada, os ajustes detalhados e a preparação para entrevista."],
  ["A ferramenta inventa experiências para melhorar meu currículo?", "Não. As sugestões reorganizam e tornam mais claras apenas as informações fornecidas por você. Nada deve ser incluído sem ser verdadeiro."],
  ["O mesmo currículo serve para todas as vagas?", "Não é o ideal. Cada vaga prioriza requisitos e palavras diferentes. Por isso, a análise compara seu currículo com uma oportunidade específica."],
  ["O que acontece se a análise falhar tecnicamente?", "Uma falha não deve ser tratada como entrega concluída. Você pode tentar novamente ou falar com o suporte para que o caso seja verificado."],
  ["O CarreirasMatch garante contratação?", "Não. A ferramenta ajuda você a apresentar melhor evidências reais e se preparar, mas a decisão final é sempre da empresa contratante."],
];

function PrimaryCta({ label = "Analisar meu currículo grátis" }: { label?: string }) {
  return (
    <Link
      href="/analise"
      className="btn-shine group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
    >
      {label}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function MarketingHome() {
  return (
    <div className="w-full overflow-hidden">
      <section className="relative bg-[linear-gradient(135deg,#061522_0%,#0d2f61_55%,#111827_100%)] text-white">
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-28 -top-36 h-[30rem] w-[30rem] rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-40 right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-amber-400/10 blur-3xl" />
        </div>

        <header className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 md:px-8">
          <Link href="/" aria-label="CarreirasMatch">
            <BrandLogo heightClassName="h-12 sm:h-14" onDark />
          </Link>
          <nav aria-label="Navegação principal" className="hidden items-center gap-6 text-sm font-medium text-white/70 md:flex">
            <a href="#exemplo" className="hover:text-white">Ver exemplo</a>
            <a href="#como-funciona" className="hover:text-white">Como funciona</a>
            <a href="#kit" className="hover:text-white">O que você recebe</a>
            <a href="#estudos" className="hover:text-white">Estudos</a>
            <a href="#preco" className="hover:text-white">Preço</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10">Entrar</Link>
            <Link href="/register" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-blue-50">Criar conta</Link>
          </div>
        </header>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-12 md:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pb-28 lg:pt-20">
          <div>
            <span className="animate-rise inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300/90">
              <Target className="h-4 w-4" /> Currículo comparado com uma vaga real
            </span>
            <h1 className="animate-rise mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl" style={{ animationDelay: "80ms" }}>
              Encontrou uma vaga? Descubra o que ajustar antes de se candidatar.
            </h1>
            <p className="animate-rise mt-6 max-w-2xl text-base leading-relaxed text-white/75 md:text-xl" style={{ animationDelay: "160ms" }}>
              Compare seu currículo com a vaga e receba palavras-chave, ajustes reais,
              currículo otimizado e preparação para entrevista.
            </p>
            <div className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "240ms" }}>
              <PrimaryCta />
              <a href="#exemplo" className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3.5 text-sm font-bold hover:bg-white/10">
                Ver exemplo do resultado
              </a>
            </div>
            <div className="animate-rise mt-6 grid gap-2 text-sm text-white/65 sm:grid-cols-2" style={{ animationDelay: "320ms" }}>
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Resultado inicial gratuito</span>
              <span className="inline-flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-emerald-400" /> Currículo pronto em PDF</span>
              <span className="inline-flex items-center gap-2"><FileSearch className="h-4 w-4 text-emerald-400" /> Análise baseada na vaga</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Sem inventar experiências</span>
            </div>
          </div>

          <div className="animate-rise" style={{ animationDelay: "300ms" }}>
            <HeroInstantScanner />
          </div>
        </div>
      </section>

      <main>
        <section id="exemplo" className="mx-auto max-w-7xl scroll-mt-8 px-4 py-20 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Veja o produto funcionando</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">A nota é só o começo da análise.</h2>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">O CarreirasMatch mostra por que existe uma lacuna e transforma o diagnóstico em uma alteração concreta, sempre para você revisar antes de usar.</p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"><p className="text-xs font-bold uppercase text-emerald-600">Encontrado na vaga</p><h3 className="mt-3 text-lg font-bold">Planejamento de conteúdo</h3><p className="mt-2 text-sm text-neutral-500">Seu currículo já apresenta uma evidência relacionada. O relatório explica onde ela aparece.</p></article>
            <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"><p className="text-xs font-bold uppercase text-amber-600">Ponto de atenção</p><h3 className="mt-3 text-lg font-bold">Análise de desempenho</h3><p className="mt-2 text-sm text-neutral-500">A vaga pede métricas, mas o currículo não demonstra essa prática. O sistema não presume que você a possui.</p></article>
            <article className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm dark:border-blue-900 dark:bg-blue-950/30"><p className="text-xs font-bold uppercase text-blue-600">Ação recomendada</p><h3 className="mt-3 text-lg font-bold">Comprove, se for verdadeiro</h3><p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Inclua ferramenta, indicador e resultado real. Se você não tiver essa experiência, prepare-se para explicar como aprenderia.</p></article>
          </div>
          <div className="mt-8 text-center"><PrimaryCta label="Comparar meu currículo com uma vaga" /></div>
        </section>

        <section id="como-funciona" className="border-y border-neutral-200 bg-white/70 dark:border-neutral-800 dark:bg-neutral-950/50">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Como funciona</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Da vaga à candidatura em três passos.</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {steps.map(([number, title, description]) => <article key={number} className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"><span className="text-sm font-extrabold text-blue-600">{number}</span><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-neutral-500">{description}</p></article>)}
            </div>
          </div>
        </section>

        <section id="kit" className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:px-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div><span className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/30"><Sparkles className="h-6 w-6" /></span><h2 className="mt-5 text-3xl font-bold tracking-tight">O que vem no Kit Candidatura.</h2><p className="mt-4 text-neutral-600 dark:text-neutral-400">Uma entrega prática para uma vaga específica, com material para ajustar o currículo e se preparar para as próximas etapas.</p></div>
          <div className="grid gap-3 sm:grid-cols-2">{deliverables.map((item) => <div key={item} className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-sm font-semibold dark:border-neutral-800 dark:bg-neutral-950"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{item}</div>)}</div>
        </section>

        <section className="border-y border-neutral-200 bg-slate-950 text-white dark:border-neutral-800">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 md:px-8 lg:grid-cols-2 lg:items-center">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Antes e depois</p><h2 className="mt-3 text-3xl font-bold">Mais específico, sem aumentar sua experiência.</h2><p className="mt-4 text-white/60">O objetivo não é enfeitar o currículo. É tornar visível o que você realmente fez e que se conecta à vaga.</p></div>
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.06] p-6"><div className="flex gap-3 rounded-xl bg-white/[0.05] p-4"><X className="h-5 w-5 shrink-0 text-rose-400" /><div><p className="text-xs font-bold uppercase text-white/40">Antes</p><p className="mt-1">Responsável pelas redes sociais.</p></div></div><div className="flex gap-3 rounded-xl bg-emerald-400/10 p-4"><Check className="h-5 w-5 shrink-0 text-emerald-400" /><div><p className="text-xs font-bold uppercase text-emerald-300">Depois</p><p className="mt-1">Planejei o calendário editorial e acompanhei alcance e engajamento das publicações.</p></div></div><p className="text-xs text-white/45">Exemplo demonstrativo. Use apenas informações que representem sua experiência real.</p></div>
          </div>
        </section>

        <section id="para-voce" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Para diferentes momentos</p><h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">A mesma pergunta, com contextos diferentes.</h2><p className="mt-4 text-neutral-600 dark:text-neutral-400">O que do seu histórico ajuda nesta vaga e o que precisa ficar mais claro?</p></div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{journeys.map(([href, title, description, Icon]) => <Link key={href} href={href} className="group rounded-2xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-300 dark:border-neutral-800 dark:bg-neutral-950"><Icon className="h-5 w-5 text-blue-600" /><h3 className="mt-4 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-neutral-500">{description}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600">Ver orientação <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link>)}</div>
        </section>

        <section id="estudos" className="scroll-mt-8 border-y border-neutral-200 bg-white/70 dark:border-neutral-800 dark:bg-neutral-950/50">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">Estudos e formação</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Seu objetivo ainda não é uma candidatura?</h2>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">Acesse a jornada específica para escolher uma formação, estudar para concurso ou se preparar para a OAB.</p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {studyJourneys.map(({ href, title, description, linkLabel, Icon }) => (
                <Link key={href} href={href} className="group rounded-2xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-1 hover:border-violet-300 dark:border-neutral-800 dark:bg-neutral-950">
                  <span className="inline-flex rounded-xl bg-violet-50 p-3 text-violet-600 dark:bg-violet-950/30"><Icon className="h-5 w-5" /></span>
                  <h3 className="mt-4 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">{description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-violet-600">{linkLabel} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                </Link>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-neutral-500">
              <span>Quer acompanhar inscrições e editais?</span>
              <Link href="/vestibulares" className="font-bold text-violet-600 hover:underline">Radar de vestibulares</Link>
              <Link href="/concursos" className="font-bold text-violet-600 hover:underline">Radar de concursos</Link>
            </div>
          </div>
        </section>

        <section className="border-y border-neutral-200 bg-white/70 dark:border-neutral-800 dark:bg-neutral-950/50">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Confiança e segurança</p><h2 className="mt-3 text-3xl font-bold">Seu currículo merece cuidado, não promessas vazias.</h2></div><div className="mt-10 grid gap-5 md:grid-cols-3"><article className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"><LockKeyhole className="h-6 w-6 text-blue-600" /><h3 className="mt-4 font-bold">Privacidade em primeiro lugar</h3><p className="mt-2 text-sm text-neutral-500">Seus dados são usados para gerar a análise e ficam protegidos pelos controles da sua conta.</p></article><article className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"><ShieldCheck className="h-6 w-6 text-blue-600" /><h3 className="mt-4 font-bold">Sem inventar qualificações</h3><p className="mt-2 text-sm text-neutral-500">A ferramenta melhora a forma de apresentar fatos verdadeiros; você sempre revisa o resultado.</p></article><article className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"><FileCheck2 className="h-6 w-6 text-blue-600" /><h3 className="mt-4 font-bold">Falha técnica não é entrega</h3><p className="mt-2 text-sm text-neutral-500">Se algo der errado na geração, tente novamente ou acione o suporte para verificarmos o caso.</p></article></div></div>
        </section>

        <section id="preco" className="mx-auto max-w-6xl px-4 py-20 md:px-8 font-sans">
          <div className="text-center space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Preços Transparentes</p>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Escolha o formato ideal para o seu momento</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Seja para uma vaga específica ou para acompanhamento ilimitado em toda a sua busca profissional.
            </p>
          </div>

          <div className="mt-10 grid overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
            {/* Grátis */}
            <div className="p-6 flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Degustação</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">Grátis</p>
                <p className="text-xs text-slate-500 mt-1">1ª leitura inicial</p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> Score inicial de aderência</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> Leitura preliminar de requisitos</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> Resumo dos principais gaps</li>
                </ul>
              </div>
              <div className="pt-4">
                <PrimaryCta label="Testar Grátis Agora" />
              </div>
            </div>

            {/* Análise Completa 9,90 */}
            <div className="p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Análise Completa</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">R$ 9,90</p>
                <p className="text-xs text-slate-500 mt-1">Avulso para 1 vaga</p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> Score detalhado de 0 a 100%</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> Diagnóstico completo por IA</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> Palavras-chave exigidas pelos robôs (ATS)</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> Justificativa técnica do resultado</li>
                </ul>
              </div>
              <div className="pt-4">
                <PrimaryCta label="Fazer Análise (R$ 9,90)" />
              </div>
            </div>

            {/* Kit Candidatura 12,90 */}
            <div className="p-6 flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Kit Candidatura</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">R$ 12,90</p>
                <p className="text-xs text-slate-500 mt-1">Entrega completa para 1 vaga</p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> Tudo da Análise Completa</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> Currículo Otimizado em PDF</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> Carta de Apresentação pronta</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0" /> Perguntas de Entrevista da vaga</li>
                </ul>
              </div>
              <div className="pt-4">
                <PrimaryCta label="Gerar Kit (R$ 12,90)" />
              </div>
            </div>

            {/* Assinatura Mensal R$ 24,90/mês */}
            <div className="p-6 bg-slate-950 text-white flex flex-col justify-between space-y-4 relative">
              <span className="absolute right-4 top-4 rounded-full bg-blue-600 text-white px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider">
                Recomendado
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-400">Assinatura Profissional</p>
                <p className="mt-2 text-3xl font-extrabold text-white">R$ 24,90<span className="text-xs text-slate-400 font-semibold">/mês</span></p>
                <p className="text-xs text-slate-400 mt-1">Acesso ilimitado, cancele a qualquer momento</p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-200">
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> <strong>Análises com IA ilimitadas</strong></li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> <strong>Kits de Candidatura ilimitados</strong></li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Simulador de Entrevistas com IA</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Acompanhamento de evolução</li>
                </ul>
              </div>
              <div className="pt-4">
                <Link
                  href="/assinar?segment=career_pro"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-4 py-3 text-xs shadow-md transition-all"
                >
                  Assinar por R$ 24,90/mês
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-slate-500">
            <strong className="text-slate-800 dark:text-slate-200">Menos de R$ 0,83 por dia.</strong> A assinatura acompanha você em todas as vagas até conquistar sua contratação.
          </p>
        </section>

        <section className="border-t border-neutral-200 dark:border-neutral-800"><div className="mx-auto max-w-3xl px-4 py-20 md:px-8"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Dúvidas frequentes</p><h2 className="mt-3 text-3xl font-bold">Antes de enviar seu currículo.</h2></div><div className="mt-10 divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">{faqs.map(([question, answer]) => <details key={question} className="group py-5"><summary className="cursor-pointer list-none pr-8 font-bold marker:content-none">{question}</summary><p className="mt-3 text-sm leading-relaxed text-neutral-500">{answer}</p></details>)}</div></div></section>

        <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8"><div className="grid gap-8 rounded-3xl bg-blue-600 px-6 py-10 text-white md:px-10 lg:grid-cols-[1fr_auto] lg:items-center"><div><h2 className="text-3xl font-bold">Encontrou uma vaga? Não envie o mesmo currículo de novo.</h2><p className="mt-3 max-w-2xl text-white/70">Compare, ajuste o que for verdadeiro e relevante e candidate-se com mais clareza.</p></div><PrimaryCta /></div></section>

        <nav aria-label="Outras soluções CarreirasMatch" className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-6 gap-y-3 border-t border-neutral-200 px-4 py-8 text-sm text-neutral-500 dark:border-neutral-800"><span>Outras soluções:</span><Link href="/empresas" className="font-semibold hover:text-blue-600">Empresas</Link><Link href="/freelancers" className="font-semibold hover:text-blue-600">Freelancers</Link><Link href="/parceiro" className="font-semibold hover:text-blue-600">Parceiros</Link><Link href="/vagas-de-hoje" className="font-semibold hover:text-blue-600">Vagas</Link></nav>
      </main>
      <SiteFooter />
    </div>
  );
}
