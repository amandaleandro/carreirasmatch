import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  FileCheck2,
  FileSearch,
  GraduationCap,
  LockKeyhole,
  RefreshCw,
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
            <div className="rounded-3xl border border-white/15 bg-white/[0.08] p-4 shadow-2xl backdrop-blur-md md:p-6">
              <div className="rounded-2xl bg-white p-5 text-slate-950 shadow-xl md:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full border border-slate-200">
                      <Image src="/niche-hero/primeiro-emprego.png" alt="" fill sizes="40px" className="object-cover object-top" />
                    </div>
                    <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Exemplo demonstrativo</p><p className="mt-1 font-bold">Analista de Marketing</p></div>
                  </div>
                  <div className="text-right"><p className="text-2xl font-extrabold text-blue-600">78%</p><p className="text-[10px] font-bold uppercase text-slate-400">aderência</p></div>
                </div>
                <div className="mt-5 space-y-3">
                  <div className="rounded-xl bg-emerald-50 p-4"><p className="text-[10px] font-bold uppercase text-emerald-700">Requisito encontrado</p><p className="mt-1 text-sm font-semibold">Produção de conteúdo e planejamento editorial.</p></div>
                  <div className="rounded-xl bg-amber-50 p-4"><p className="text-[10px] font-bold uppercase text-amber-700">Falta comprovar</p><p className="mt-1 text-sm font-semibold">Uso de métricas para melhorar campanhas.</p></div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Antes</p><p className="mt-1 text-sm text-slate-500 line-through">Responsável pelas redes sociais.</p>
                    <p className="mt-3 text-[10px] font-bold uppercase text-blue-600">Depois</p><p className="mt-1 text-sm font-semibold text-slate-800">Planejei o calendário editorial e acompanhei alcance e engajamento das publicações.</p>
                  </div>
                </div>
                <a href="#exemplo" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600">Entender este exemplo <ArrowRight className="h-4 w-4" /></a>
              </div>
            </div>
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

        <section className="border-y border-neutral-200 bg-white/70 dark:border-neutral-800 dark:bg-neutral-950/50">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Confiança e segurança</p><h2 className="mt-3 text-3xl font-bold">Seu currículo merece cuidado, não promessas vazias.</h2></div><div className="mt-10 grid gap-5 md:grid-cols-3"><article className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"><LockKeyhole className="h-6 w-6 text-blue-600" /><h3 className="mt-4 font-bold">Privacidade em primeiro lugar</h3><p className="mt-2 text-sm text-neutral-500">Seus dados são usados para gerar a análise e ficam protegidos pelos controles da sua conta.</p></article><article className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"><ShieldCheck className="h-6 w-6 text-blue-600" /><h3 className="mt-4 font-bold">Sem inventar qualificações</h3><p className="mt-2 text-sm text-neutral-500">A ferramenta melhora a forma de apresentar fatos verdadeiros; você sempre revisa o resultado.</p></article><article className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"><FileCheck2 className="h-6 w-6 text-blue-600" /><h3 className="mt-4 font-bold">Falha técnica não é entrega</h3><p className="mt-2 text-sm text-neutral-500">Se algo der errado na geração, tente novamente ou acione o suporte para verificarmos o caso.</p></article></div></div>
        </section>

        <section id="preco" className="mx-auto max-w-5xl px-4 py-20 md:px-8">
          <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Preço claro</p><h2 className="mt-3 text-3xl font-bold">Comece grátis. Libere o kit se fizer sentido.</h2></div>
          <div className="mt-10 grid overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 md:grid-cols-2">
            <div className="p-7 md:p-9"><p className="text-sm font-bold text-neutral-500">Resultado inicial</p><p className="mt-3 text-4xl font-extrabold">Grátis</p><ul className="mt-6 space-y-3 text-sm"><li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500" /> Score inicial de aderência</li><li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500" /> Primeira leitura dos pontos fortes</li><li className="flex gap-2"><Check className="h-4 w-4 text-emerald-500" /> Indicação dos principais gaps</li></ul></div>
            <div className="bg-slate-950 p-7 text-white md:p-9"><p className="text-sm font-bold text-blue-300">Kit Candidatura</p><p className="mt-3 text-4xl font-extrabold">{kitPrice}</p><p className="mt-1 text-sm text-white/50">pagamento único por análise</p><ul className="mt-6 space-y-3 text-sm text-white/85">{deliverables.slice(2).map((item) => <li key={item} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-400" />{item}</li>)}</ul><div className="mt-7"><PrimaryCta label="Fazer análise gratuita primeiro" /></div></div>
          </div>
        </section>

        <section className="border-t border-neutral-200 dark:border-neutral-800"><div className="mx-auto max-w-3xl px-4 py-20 md:px-8"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Dúvidas frequentes</p><h2 className="mt-3 text-3xl font-bold">Antes de enviar seu currículo.</h2></div><div className="mt-10 divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">{faqs.map(([question, answer]) => <details key={question} className="group py-5"><summary className="cursor-pointer list-none pr-8 font-bold marker:content-none">{question}</summary><p className="mt-3 text-sm leading-relaxed text-neutral-500">{answer}</p></details>)}</div></div></section>

        <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8"><div className="grid gap-8 rounded-3xl bg-blue-600 px-6 py-10 text-white md:px-10 lg:grid-cols-[1fr_auto] lg:items-center"><div><h2 className="text-3xl font-bold">Encontrou uma vaga? Não envie o mesmo currículo de novo.</h2><p className="mt-3 max-w-2xl text-white/70">Compare, ajuste o que for verdadeiro e relevante e candidate-se com mais clareza.</p></div><PrimaryCta /></div></section>

        <nav aria-label="Outras soluções CarreirasMatch" className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-6 gap-y-3 border-t border-neutral-200 px-4 py-8 text-sm text-neutral-500 dark:border-neutral-800"><span>Outras soluções:</span><Link href="/empresas" className="font-semibold hover:text-blue-600">Empresas</Link><Link href="/freelancers" className="font-semibold hover:text-blue-600">Freelancers</Link><Link href="/parceiro" className="font-semibold hover:text-blue-600">Parceiros</Link><Link href="/vagas-de-hoje" className="font-semibold hover:text-blue-600">Vagas</Link></nav>
      </main>
      <SiteFooter />
    </div>
  );
}
