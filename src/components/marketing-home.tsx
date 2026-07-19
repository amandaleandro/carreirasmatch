import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  Check,
  Compass,
  FileSearch,
  GraduationCap,
  RefreshCw,
  Scale,
  ShieldCheck,
  Target,
  UserRoundSearch,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { SiteFooter } from "@/components/site-footer";

const steps = [
  {
    number: "01",
    title: "Envie seu currículo",
    description: "Use um PDF com informações reais da sua trajetória.",
  },
  {
    number: "02",
    title: "Adicione a vaga",
    description: "Cole a descrição ou informe o link da oportunidade desejada.",
  },
  {
    number: "03",
    title: "Saia com um plano",
    description: "Veja aderência, lacunas, ajustes e preparação para entrevista.",
  },
];

const journeys = [
  {
    href: "/estagio",
    label: "Estágio",
    title: "Conecte projetos e faculdade à vaga desejada.",
    description: "Transforme projetos, cursos e atividades em evidências relevantes.",
    icon: GraduationCap,
    accent: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
  {
    href: "/jovem-aprendiz",
    label: "Jovem Aprendiz",
    title: "Prepare seu primeiro currículo profissional.",
    description: "Valorize escola, comportamento, cursos e vontade de aprender.",
    icon: UserRoundSearch,
    accent: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30 dark:text-cyan-300",
  },
  {
    href: "/primeiro-emprego",
    label: "Primeiro emprego",
    title: "Mostre potencial mesmo sem carteira assinada.",
    description: "Transforme atividades, projetos e cursos em sinais de capacidade.",
    icon: BriefcaseBusiness,
    accent: "text-sky-600 bg-sky-50 dark:bg-sky-950/30 dark:text-sky-300",
  },
  {
    href: "/faculdade-ou-tecnico",
    label: "Faculdade ou técnico",
    title: "Escolha formação com mais informação.",
    description: "Compare áreas, tempo, investimento e caminhos profissionais.",
    icon: Compass,
    accent: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-300",
  },
  {
    href: "/recolocacao",
    label: "Recolocação e vaga melhor",
    title: "Faça sua experiência aparecer na linguagem da vaga.",
    description: "Priorize resultados, palavras-chave e argumentos para recrutadores.",
    icon: BriefcaseBusiness,
    accent: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-300",
  },
  {
    href: "/transicao",
    label: "Transição de carreira",
    title: "Mude de direção sem apagar sua história.",
    description: "Encontre habilidades transferíveis, cargos-ponte e uma narrativa clara.",
    icon: RefreshCw,
    accent: "text-violet-600 bg-violet-50 dark:bg-violet-950/30 dark:text-violet-300",
  },
  {
    href: "/concurso",
    label: "Concurso público",
    title: "Organize o edital e estude por prioridade.",
    description: "Use planos, simulados e notas de corte para direcionar sua preparação.",
    icon: BookOpenCheck,
    accent: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300",
  },
  {
    href: "/oab",
    label: "Exame da OAB",
    title: "Prepare cada fase pelo estilo da FGV.",
    description: "Pratique questões, peças, discursivas e acompanhe um plano por fase.",
    icon: Scale,
    accent: "text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-300",
  },
];

const deliverables = [
  "Score de aderência e leitura ATS",
  "Pontos fortes e lacunas prioritárias",
  "Palavras-chave encontradas e ausentes",
  "Sugestões para currículo e resumo",
  "Perguntas prováveis de entrevista",
  "Plano de evolução e próximos passos",
];

export function MarketingHome() {
  return (
    <div className="w-full overflow-hidden">
      <section className="relative bg-[linear-gradient(135deg,#061522_0%,#0d2f61_55%,#111827_100%)] text-white">
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-28 -top-36 h-[30rem] w-[30rem] rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-40 right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-amber-400/10 blur-3xl" />
        </div>

        <header className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 md:px-8">
          <Link href="/" aria-label="CarreirasMatch">
            <BrandLogo heightClassName="h-11" onDark />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-white/70 md:flex">
            <a href="#como-funciona" className="hover:text-white">Como funciona</a>
            <a href="#para-voce" className="hover:text-white">Para você</a>
            <Link href="/vagas-de-hoje" className="hover:text-white">Vagas</Link>
            <Link href="/gratuito" className="hover:text-white">Ferramentas grátis</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10">
              Entrar
            </Link>
            <Link href="/register" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-blue-50">
              Criar conta
            </Link>
          </div>
        </header>

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-12 md:px-8 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:pb-28 lg:pt-20">
          <div>
            <span className="animate-rise inline-block text-xs font-semibold uppercase tracking-[0.2em] text-blue-300/90">
              Candidaturas mais estratégicas
            </span>
            <h1 className="animate-rise mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl" style={{ animationDelay: "80ms" }}>
              Pare de se candidatar no escuro.
            </h1>
            <p className="animate-rise mt-6 max-w-2xl text-base leading-relaxed text-white/70 md:text-xl" style={{ animationDelay: "160ms" }}>
              Compare seu currículo com uma vaga real, descubra o que está ajudando ou
              atrapalhando e receba um plano claro antes de aplicar.
            </p>
            <div className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "240ms" }}>
              <Link
                href="/analise"
                className="btn-shine group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold shadow-lg shadow-blue-950/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-900/40"
              >
                Analisar currículo e vaga
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/vagas-de-hoje"
                className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:border-white/40 hover:bg-white/10"
              >
                Ver vagas de hoje
              </Link>
            </div>
            <div className="animate-rise mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/55" style={{ animationDelay: "320ms" }}>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Resultado inicial gratuito</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Sem promessa de contratação</span>
            </div>
          </div>

          <div className="animate-rise relative" style={{ animationDelay: "300ms" }}>
            <div className="rounded-3xl border border-white/15 bg-white/[0.08] p-4 shadow-2xl backdrop-blur-md transition-transform duration-500 hover:-translate-y-1 md:p-6">
              <div className="rounded-2xl bg-white p-5 text-slate-950 shadow-xl md:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Prévia do diagnóstico</p>
                    <p className="mt-1 font-bold">Analista de Marketing</p>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-[6px] border-blue-100 text-xl font-extrabold text-blue-600">
                    78
                  </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Já ajuda você</p>
                    <p className="mt-2 text-sm font-semibold">Projetos e experiência com conteúdo estão alinhados.</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Ajuste prioritário</p>
                    <p className="mt-2 text-sm font-semibold">Falta provar análise de métricas pedida na vaga.</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Próximo passo</p>
                  <p className="mt-1 text-sm text-slate-700">Conectar um resultado mensurável ao projeto mais relevante e preparar um exemplo para entrevista.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main>
        <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 md:px-8">
          <div className="reveal-up max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Da vaga ao próximo passo</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Clareza em três etapas.</h2>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">Você não precisa mudar toda a sua história. Precisa mostrar as evidências mais relevantes para a oportunidade certa.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="reveal-up rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-blue-900">
                <span className="text-sm font-extrabold text-blue-600">{step.number}</span>
                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-neutral-200 bg-white/70 dark:border-neutral-800 dark:bg-neutral-950/50">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div className="reveal-up">
              <span className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/30 dark:text-blue-300">
                <Target className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight">Não é só uma nota. É uma lista do que fazer agora.</h2>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">O score abre a conversa. O valor está em transformar os requisitos da vaga em ajustes, exemplos e preparação prática.</p>
              <Link href="/analise" className="mt-6 inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700">
                Começar minha análise <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {deliverables.map((item) => (
                <div key={item} className="reveal-up flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-sm font-semibold transition-colors duration-200 hover:border-blue-200 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-blue-900">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="para-voce" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 md:px-8">
          <div className="reveal-up text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Orientação para o seu momento</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Qual desafio você está tentando resolver?</h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {journeys.map(({ href, label, title, description, icon: Icon, accent }) => (
              <Link key={href} href={href} className="reveal-up group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
                <span className={`inline-flex rounded-xl p-3 ${accent}`}><Icon className="h-5 w-5" /></span>
                <p className="mt-5 text-xs font-bold uppercase tracking-wide text-neutral-400">{label}</p>
                <h3 className="mt-2 text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600">
                  Ver caminho <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 md:px-8">
          <div className="reveal-up grid gap-8 overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white md:px-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-blue-300"><FileSearch className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.18em]">Sua próxima candidatura</span></div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">Encontrou uma vaga? Não envie o mesmo currículo ainda.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">Faça a comparação, identifique os requisitos centrais e ajuste apenas o que for verdadeiro e relevante.</p>
            </div>
            <Link href="/analise" className="btn-shine group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-900/40">
              Analisar antes de aplicar <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
