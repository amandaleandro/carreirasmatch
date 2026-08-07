import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import Link from "next/link";
import { HeroInstantScanner } from "@/components/hero-instant-scanner";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  TrendingUp,
  Bot,
  Radar,
  Briefcase,
  LayoutGrid,
  Target,
  ClipboardCheck,
  Search,
  PenLine,
  MessageCircle,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { PublicNav, PublicNavMobile } from "@/components/public-nav";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { COMMERCIAL_PLANS } from "@/lib/commercial-plan-catalog";
import { COMMERCIAL_PRODUCTS } from "@/lib/commercial-products";
import { JOURNEYS } from "@/lib/journeys";

const routeSteps = [
  [Search, "01", "Encontre ou cole a vaga", "Comece pela oportunidade real que você quer conquistar."],
  [Target, "02", "Descubra seu Match", "Veja a aderência real entre seu perfil e o que a vaga pede."],
  [ClipboardCheck, "03", "Veja o que falta", "Entenda as lacunas antes de se candidatar, não depois."],
  [PenLine, "04", "Ajuste sua candidatura", "Currículo e palavras-chave alinhados a esta vaga específica."],
  [MessageCircle, "05", "Prepare-se para a entrevista", "Perguntas prováveis, respostas e roteiro de preparo."],
] as const;

const darkColumns = [
  ["NO ESCURO", ["Enviar o mesmo currículo para tudo", "Torcer para passar pelo filtro", "Receber silêncio", "Não saber o que aconteceu", "Repetir tudo de novo"]],
  ["COM ROTA", ["Encontrar uma vaga", "Dar Match", "Entender as lacunas", "Preparar-se", "Candidatar-se", "Acompanhar"]],
] as const;

export const marketingFaqs = [
  ["A análise gratuita já mostra o resultado?", "Sim. Você recebe o resultado inicial de aderência. O Plano de Candidatura reúne a versão otimizada em PDF, a análise de palavras-chave e a preparação para entrevista."],
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
  ["Começando agora", "Primeiro emprego ou estágio", "Descubra onde seu perfil já tem valor mesmo sem experiência. Veja vagas compatíveis e o que destacar além da experiência profissional.", "/analise", "Encontrar minhas oportunidades"],
  ["Aprendendo", "Descubra seu próximo caminho", "Descubra que cursos e profissões já fazem sentido com o que você sabe fazer hoje.", "/descobrir", "Explorar meus caminhos"],
  ["Voltando ao mercado", "Recolocação", "Descubra o que pode estar impedindo seu próximo “sim”. Compare currículo, mercado e vagas antes da próxima candidatura.", "/analise", "Analisar minha recolocação"],
  ["Mudando de área", "Transição de carreira", "Descubra o que da sua carreira atual já vale na próxima. Habilidades transferíveis, gaps e vagas em que seu perfil já pode competir.", "/tools/career-change-guide", "Ver meu caminho"],
  ["Construindo seu caminho", "Projetos, freelas e renda", "Descubra onde suas habilidades já geram valor fora do emprego fixo. Portfólio, projetos e oportunidades para começar agora.", "/freelancers", "Ver minhas oportunidades"],
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
            Sua busca por emprego também precisa de organização.
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Entrevistas, candidaturas, retornos e prazos reunidos em um só lugar. Você procura a vaga, o CarreirasMatch ajuda você a não perder o processo.
          </p>
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
              Pare de se candidatar no escuro
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight text-white">
              Encontrou uma vaga?
              <span className="block text-blue-300">Descubra suas chances antes de se candidatar.</span>
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-slate-300 max-w-2xl">
              Cole a vaga e veja em poucos minutos:
            </p>

            <ul className="space-y-2 text-sm sm:text-base font-medium text-slate-200 max-w-2xl">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Quanto seu perfil combina</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> O que está faltando</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> O que destacar no currículo</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Como se preparar para a entrevista</li>
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row pt-2">
              <PrimaryCta label="Analisar esta vaga" />
              <Link href="/todas-as-vagas" className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-white/10 transition-all">
                Encontrar vagas
              </Link>
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
        {/* MOMENTO MATCH */}
        <section id="exemplo" className="mx-auto max-w-7xl scroll-mt-8 px-4 py-20 md:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Exemplo de análise</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              O número é só o começo
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Mostramos o que a empresa procura, o que já se destaca no seu perfil e onde vale a pena dedicar atenção antes do envio.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-slate-200/90 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sua análise</span>
            <p className="mt-2 text-6xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400 sm:text-7xl">76%</p>
            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">Boa aderência à vaga</p>

            <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
              <Card variant="interactive">
                <CardHeader>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">O que já joga a seu favor</span>
                  <CardTitle className="mt-2 text-base">Senioridade</CardTitle>
                  <CardDescription>Sua experiência está alinhada ao nível solicitado.</CardDescription>
                </CardHeader>
              </Card>

              <Card variant="interactive">
                <CardHeader>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">O que merece atenção</span>
                  <CardTitle className="mt-2 text-base">Kubernetes</CardTitle>
                  <CardDescription>A vaga valoriza essa competência, mas ela aparece pouco no currículo.</CardDescription>
                </CardHeader>
              </Card>

              <Card variant="interactive" className="border-blue-200 dark:border-blue-900">
                <CardHeader>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">O que fazer agora</span>
                  <CardTitle className="mt-2 text-base">Ajustar sua experiência com Kubernetes</CardTitle>
                  <CardDescription>Antes de se candidatar, deixe isso mais claro no currículo.</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="mt-8">
              <PrimaryCta label="Ver meu Plano de Candidatura" />
            </div>
          </div>
        </section>

        {/* DA VAGA À ENTREVISTA */}
        <section id="como-funciona" className="border-y border-slate-200/80 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
            <div className="mx-auto max-w-2xl text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Da vaga até a entrevista.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-5">
              {routeSteps.map(([Icon, number, title, description], index) => (
                <div key={number} className="relative flex flex-col items-center text-center">
                  {index < routeSteps.length - 1 && (
                    <span className="absolute left-1/2 top-6 hidden h-px w-full -translate-y-1/2 bg-slate-200 dark:bg-slate-800 md:block" />
                  )}
                  <span className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="mt-3 text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{number}</span>
                  <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center gap-4">
              <p className="text-center text-lg font-bold text-slate-900 dark:text-white">
                Candidatura preparada <Check className="inline h-5 w-5 text-emerald-500" />
              </p>
              <PrimaryCta label="Começar com uma vaga" />
            </div>
          </div>
        </section>

        {/* PROVA SOCIAL */}
        <SocialProof analysisCount={analysisCount} />

        {/* CANDIDATURA NO ESCURO */}
        <section className="bg-[#071827] text-white">
          <div className="mx-auto max-w-5xl px-4 py-20 md:px-8">
            <h2 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tem um jeito comum de procurar emprego. E tem outro.
            </h2>

            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {darkColumns.map(([title, items]) => (
                <div
                  key={title}
                  className={
                    title === "COM ROTA"
                      ? "rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6"
                      : "rounded-2xl border border-white/10 bg-white/5 p-6"
                  }
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-300">{title}</span>
                  <ul className="mt-4 space-y-3">
                    {items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-200">
                        {title === "COM ROTA" ? (
                          <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                        ) : (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
                        )}
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="mt-12 text-center text-lg font-bold">
              Candidatar-se mais não significa candidatar-se melhor.
            </p>
          </div>
        </section>

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
            {audienceCards.map(([label, title, description, href, cta]) => (
              <Link key={href} href={href} className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <span className="inline-block text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{label}</span>
                <h3 className="mt-3 text-base font-bold leading-snug text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-transform group-hover:translate-x-1">{cta} <ArrowRight className="h-3.5 w-3.5" /></span>
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

        {/* OFERTA */}
        <section className="mx-auto max-w-5xl px-4 py-20 md:px-8">
          <div className="mx-auto max-w-2xl text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              O que você precisa resolver agora?
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Uma vaga</span>
              <h3 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">Plano de Candidatura</h3>
              <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(COMMERCIAL_PRODUCTS.fullAnalysis.priceCents / 100)}
                <span className="text-xs font-medium text-slate-500"> pagamento único</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Para quando você encontrou uma oportunidade que realmente importa.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {["Diagnóstico completo", "Ajustes recomendados no currículo", "Preparação da candidatura", "Perguntas prováveis de entrevista", "Acompanhamento desta vaga"].map((item) => (
                  <li key={item} className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /><span>{item}</span></li>
                ))}
              </ul>
              <Link href="/plano-de-candidatura" className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-xs font-bold text-slate-700 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-400">
                Preparar esta vaga
              </Link>
            </div>

            <div className="rounded-3xl border border-blue-500 bg-blue-50/70 p-6 shadow-lg shadow-blue-500/10 dark:bg-blue-950/30 sm:p-8">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Busca contínua</span>
              <h3 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">Rota Profissional</h3>
              <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(COMMERCIAL_PLANS.pro.priceCents / 100)}
                <span className="text-xs font-medium text-slate-500">/mês</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Para quem está realmente procurando a próxima oportunidade.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {["Análises de vagas recorrentes", "Currículos adaptados por vaga", "Vagas recomendadas e alertas", "Candidaturas e acompanhamento", "Preparação de entrevistas"].map((item) => (
                  <li key={item} className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /><span>{item}</span></li>
                ))}
              </ul>
              <Link href="/rota-profissional" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-blue-700">
                Começar minha rota
              </Link>
              <p className="mt-3 text-center text-[11px] text-slate-500 dark:text-slate-400">Também disponível anual, com desconto.</p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Quer só começar de graça? <Link href="/register" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">Descubra seu Match sem custo</Link>.
          </p>
        </section>

        {/* PROVA: O QUE UMA ANÁLISE ENCONTRA */}
        <section className="border-y border-slate-200/80 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-4xl px-4 py-20 md:px-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Vaga: Analista de Marketing</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Veja o que uma análise encontra
              </h2>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Antes</span>
                <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />Currículo genérico</li>
                  <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />Poucas palavras-chave</li>
                  <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />Experiência relevante escondida</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6 dark:border-blue-900 dark:bg-blue-950/20">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Depois da análise</span>
                <ul className="mt-4 space-y-2.5 text-sm text-slate-700 dark:text-slate-200">
                  <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />87% de aderência</li>
                  <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />6 experiências para destacar</li>
                  <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />4 palavras-chave ausentes</li>
                  <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />8 perguntas prováveis de entrevista</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

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
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Aquela vaga pode ser importante demais para uma candidatura no escuro</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-blue-100">
              Envie seu currículo, cole a vaga e descubra seu Match, e saiba o que fazer depois.
            </p>
            <Link href="/analise" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50">
              Analisar minha vaga <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
