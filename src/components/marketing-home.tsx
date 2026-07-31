import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import Link from "next/link";
import { HeroInstantScanner } from "@/components/hero-instant-scanner";
import {
  ArrowRight,
  Check,
  FileCheck2,
  FileSearch,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Bot,
  Radar,
  Briefcase,
  LayoutGrid,
  Gift,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { PublicNav, PublicNavMobile } from "@/components/public-nav";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const steps = [
  ["01", "Envie seu currículo", "Cole o texto ou envie seu PDF atual. A análise respeita tudo o que você já construiu."],
  ["02", "Cole a vaga desejada", "Insira o texto ou o link da oportunidade para a qual você quer se candidatar."],
  ["03", "Descubra seu Match", "Entenda a aderência real, ajuste pontos-chave e aumente suas chances de entrevista."],
];

const deliverables = [
  "Diagnóstico claro de aderência técnica por requisito",
  "Requisitos preenchidos e lacunas para você comprovar",
  "Palavras-chave essenciais para passar nos filtros (ATS)",
  "Currículo formatado e pronto para download em PDF",
  "Guia de preparação para as perguntas da entrevista",
  "Plano de ação simples com os próximos passos",
];

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

const ecosystemCards = [
  [Bot, "Candidatura automática", "Depois do Match, deixe o CarreirasMatch aplicar sozinho nas vagas mais compatíveis com o seu perfil.", "/applications"],
  [Radar, "Radar de concurso e vestibular", "Editais e provas monitorados por você, com alertas assim que saem.", "/concursos"],
  [Briefcase, "Marketplace freelancer", "Contrate ou seja contratado para projetos, com um perfil já validado pela plataforma.", "/freelancers"],
  [LayoutGrid, "Central de candidaturas", "Histórico de Match, currículos e kits organizados por vaga, sem planilha.", "/applications"],
] as const;

const audienceCards = [
  ["Descobrir", "Estou escolhendo uma profissão", "Teste vocacional, comparação de profissões e o caminho entre faculdade e curso técnico.", "/faculdade-ou-tecnico"],
  ["Aprender", "Estou estudando", "Ensino médio, concursos, OAB e ferramentas completas de apoio aos estudos.", "/concurso"],
  ["Conquistar", "Quero estágio", "Transforme projetos da faculdade e cursos em experiência que conta.", "/estagio"],
  ["Conquistar", "Quero meu primeiro emprego", "Crie uma candidatura consistente e mostre seu valor mesmo sem carteira assinada.", "/primeiro-emprego"],
  ["Conquistar", "Quero melhorar minhas candidaturas", "Analise seu currículo contra a vaga e descubra exatamente o que ajustar.", "/analise"],
  ["Evoluir", "Quero mudar de carreira", "Identifique as habilidades que você já possui e aproximam você da nova área.", "/transicao"],
  ["Conquistar", "Quero voltar ao mercado", "Ajuste seu currículo para as exigências atuais das empresas e conquiste respostas.", "/recolocacao"],
  ["Freelancer", "Quero trabalhar por conta", "Monte seu perfil, envie propostas e acompanhe contratos em um só lugar.", "/freelancers"],
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight text-white">
              Sua carreira inteira, em um só lugar.
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-slate-300 max-w-2xl">
              Descubra caminhos, desenvolva competências, prepare-se para oportunidades e acompanhe sua evolução profissional com inteligência artificial.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row pt-2">
              <PrimaryCta label="Descobrir meu próximo passo" />
              <a href="#momento" className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-white/10 transition-all">
                Conhecer a plataforma
              </a>
            </div>

            <div className="grid gap-2.5 text-xs font-medium text-slate-300 sm:grid-cols-2 pt-2">
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Análise inicial gratuita</span>
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Diagnóstico humano e respeitoso</span>
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Palavras-chave exigidas pela vaga</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" /> Sem inventar qualificações falsas</span>
            </div>
          </div>

          <div>
            <HeroInstantScanner />
          </div>
        </div>
      </section>

      <main>
        {/* MOMENTO PROFISSIONAL */}
        <section id="momento" className="mx-auto max-w-7xl scroll-mt-8 px-4 py-16 md:px-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Em que momento da sua carreira você está?
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Escolha o que mais combina com você agora. O CarreirasMatch entende seu momento e mostra o próximo passo, sem que você precise conhecer todas as ferramentas.
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

        {/* PROVA SOCIAL */}
        <SocialProof analysisCount={analysisCount} />

        {/* EXEMPLO PRÁTICO */}
        <section id="exemplo" className="mx-auto max-w-7xl scroll-mt-8 px-4 py-20 md:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Mais do que uma nota, entregamos clareza sobre o seu momento
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Mostramos o que a empresa procura, o que já se destaca no seu perfil e onde vale a pena dedicar atenção antes do envio.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <Card variant="interactive">
              <CardHeader>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Pontos Fortes Identificados</span>
                <CardTitle className="mt-2">Planejamento e Execução</CardTitle>
                <CardDescription>Seu histórico apresenta comprovações de organização, cumprimento de prazos e trabalho em equipe.</CardDescription>
              </CardHeader>
            </Card>

            <Card variant="interactive">
              <CardHeader>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Oportunidade de Ajuste</span>
                <CardTitle className="mt-2">Métricas de Resultado</CardTitle>
                <CardDescription>A vaga valoriza demonstração de dados e resultados, mas seu resumo atual foca apenas em tarefas rotineiras.</CardDescription>
              </CardHeader>
            </Card>

            <Card variant="interactive" className="border-blue-200 dark:border-blue-900">
              <CardHeader>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Sugestão Prática</span>
                <CardTitle className="mt-2">Destaque de Impacto</CardTitle>
                <CardDescription>Insira percentuais ou volumes atendidos. Se for um novo desafio, destaque cursos e projetos práticos recentes.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="border-y border-slate-200/80 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 space-y-12">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Como ajudamos você em 3 etapas simples
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {steps.map(([number, title, description]) => (
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

        {/* O QUE VEM NO KIT */}
        <section id="kit" className="mx-auto max-w-7xl px-4 py-20 md:px-8 grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Tudo o que você precisa para se candidatar com segurança
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Nosso objetivo é te preparar não apenas para o robô da triagem, mas para a entrevista presencial com o gestor da vaga.
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

        {/* ECOSSISTEMA */}
        <section className="border-y border-slate-200/80 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Ferramentas completas para toda a sua trajetória
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Além do Match de currículo, acompanhamos seu desenvolvimento em cada etapa do seu crescimento profissional.
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

        {/* PLANOS E PREÇOS - GANHOS REAIS E BRINDES BÔNUS */}
        <section id="preco" className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Invista na sua carreira com retorno garantido
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Escolha a opção ideal para o seu momento. Todos os planos pagos contêm brindes e bônus inclusos sem custo adicional.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {/* Card 1: Grátis */}
              <Card className="p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gratuito</span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Análise Inicial</h3>
                  <p className="text-xs text-slate-500">Ideal para testar seu Match e entender como a vaga lê o seu perfil.</p>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">R$ 0</p>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Diagnóstico de aderência inicial</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Mapeamento simples de requisitos</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Dicas rápidas de ajuste</p>
                  </div>
                </div>
                <Link href="/analise" className="w-full text-center py-3 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  Testar grátis
                </Link>
              </Card>

              {/* Card 2: Kit Candidatura */}
              <Card className="p-6 flex flex-col justify-between space-y-6 border-blue-500/50 relative shadow-md bg-blue-50/20 dark:bg-blue-950/20">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Opção Mais Recomendada</span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Kit Candidatura</h3>
                  <p className="text-xs text-slate-500">Tudo pronto para enviar sua candidatura para a vaga dos seus sonhos.</p>
                  <p className="text-3xl font-extrabold text-blue-600">R$ 9,90 <span className="text-xs font-normal text-slate-400">/ vaga</span></p>
                  
                  <div className="border-t border-blue-100 dark:border-blue-900/60 pt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-200 font-medium">
                    <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Currículo 100% otimizado pronto em PDF</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Palavras-chave exatas para robôs ATS</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> Roteiro com perguntas da entrevista</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> Análise detalhada de pontos fortes</p>
                    
                    {/* GIFT BONUS */}
                    <div className="mt-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 p-3 space-y-1">
                      <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                        <Gift className="h-4 w-4 text-amber-500 shrink-0" /> BRINDE BÔNUS INCLUSO:
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                        Modelo de Mensagem Pronta para enviar direto ao Recrutador no LinkedIn ou E-mail.
                      </p>
                    </div>
                  </div>
                </div>
                <Link href="/analise" className="w-full text-center py-3.5 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm">
                  Gerar meu kit completo
                </Link>
              </Card>

              {/* Card 3: Profissional */}
              <Card className="p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Acesso Ilimitado</span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Plano Profissional</h3>
                  <p className="text-xs text-slate-500">Para quem quer se candidatar a várias vagas por mês com velocidade máxima.</p>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">R$ 29,90 <span className="text-xs font-normal text-slate-400">/ mês</span></p>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Análises e Kits de vaga ilimitados</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Simulador de entrevistas interativo por IA</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Radar e alertas de vagas em tempo real</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Central completa de gestão de candidaturas</p>

                    {/* GIFT BONUS */}
                    <div className="mt-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-3 space-y-1">
                      <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <Gift className="h-4 w-4 text-amber-500 shrink-0" /> BRINDES EXCLUSIVOS:
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                        Guia de Negociação Salarial + 5 Modelos de Carta de Apresentação Profissional.
                      </p>
                    </div>
                  </div>
                </div>
                <Link href="/assinar" className="w-full text-center py-3 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  Assinar Plano Profissional
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-4xl px-4 py-20 md:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Perguntas frequentes</h2>
          </div>

          <div className="space-y-4">
            {faqs.map(([q, a]) => (
              <Card key={q} className="p-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{q}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{a}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
