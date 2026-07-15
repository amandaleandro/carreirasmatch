"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { SiteFooter } from "@/components/site-footer";
import type { CareerTrack } from "@/components/analysis-display";
import { CAREER_OFFER_BY_SEGMENT } from "@/lib/career-offers";
import type { CareerSegment } from "@/lib/career-segments";
import { FIRST_JOB_GUIDE_BY_PATH, type FirstJobPath } from "@/lib/first-job-tips";

export type ThemeAccent = "blue" | "green" | "purple" | "orange" | "cyan" | "indigo";

export type Niche = {
  slug: string;
  track: CareerTrack;
  segment: CareerSegment;
  tabLabel: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  painPoints: string[];
  benefits: { title: string; description: string }[];
  ctaLabel: string;
  /** Overrides the default "/analise" destination for the hero/final CTA buttons. */
  primaryCtaHref?: string;
  /** Overrides the default funnel section heading. */
  funnelHeadline?: string;
  /** Overrides the default "envie currículo + vaga" 3-step "Como funciona" explainer. */
  howItWorks?: { title: string; description: string }[];
  /** Color theme used across the hero and highlighted sections. */
  themeAccent: ThemeAccent;
  /** Emoji placeholder shown in the hero visual until a real photo is added. */
  heroIcon: string;
  /** Photo shown in the hero visual card (path under /public). */
  heroImage: string;
  /** 4 short feature labels shown as icon chips right under the hero copy. */
  quickFeatures: string[];
  /** Label for the secondary hero button. Defaults to "Fazer primeira análise por {preço}". */
  heroSecondaryCtaLabel?: string;
  /** Short social-proof line shown near the pricing cards. */
  socialProof: string;
  /** Overrides for the pricing section's free/one-time tiers (defaults fit the resume-analysis product). */
  simpleTierLabel?: string;
  simpleTierDescription?: string;
  completeTierLabel?: string;
  completeTierDescription?: string;
  completeTierCta?: string;
  /** Example diagnostic output shown to prove concretely what the analysis delivers. */
  samplePreview: {
    score: number;
    scoreLabel: string;
    strengths: [string, string];
    gaps: [string, string];
    sampleQuestion: string;
  };
};

const THEME_PALETTE: Record<
  ThemeAccent,
  {
    heroBg: string;
    badge: string;
    btnPrimary: string;
    btnGhost: string;
    numberBg: string;
    accentText: string;
    blob: string;
    chip: string;
    cardBorder: string;
  }
> = {
  blue: {
    heroBg: "from-blue-950 via-blue-900 to-slate-950",
    badge: "bg-blue-500/15 text-blue-300 border border-blue-400/30",
    btnPrimary: "bg-blue-600 hover:bg-blue-500 text-white",
    btnGhost: "border border-blue-400/40 text-blue-100 hover:bg-blue-500/10",
    numberBg: "bg-blue-600",
    accentText: "text-blue-400",
    blob: "from-blue-500 to-indigo-600",
    chip: "bg-blue-500/10 text-blue-300 border border-blue-400/20",
    cardBorder: "border-blue-500/30",
  },
  green: {
    heroBg: "from-emerald-950 via-emerald-900 to-slate-950",
    badge: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30",
    btnPrimary: "bg-emerald-600 hover:bg-emerald-500 text-white",
    btnGhost: "border border-emerald-400/40 text-emerald-100 hover:bg-emerald-500/10",
    numberBg: "bg-emerald-600",
    accentText: "text-emerald-400",
    blob: "from-emerald-500 to-teal-600",
    chip: "bg-emerald-500/10 text-emerald-300 border border-emerald-400/20",
    cardBorder: "border-emerald-500/30",
  },
  purple: {
    heroBg: "from-violet-950 via-purple-900 to-slate-950",
    badge: "bg-violet-500/15 text-violet-300 border border-violet-400/30",
    btnPrimary: "bg-violet-600 hover:bg-violet-500 text-white",
    btnGhost: "border border-violet-400/40 text-violet-100 hover:bg-violet-500/10",
    numberBg: "bg-violet-600",
    accentText: "text-violet-400",
    blob: "from-violet-500 to-purple-600",
    chip: "bg-violet-500/10 text-violet-300 border border-violet-400/20",
    cardBorder: "border-violet-500/30",
  },
  orange: {
    heroBg: "from-orange-950 via-amber-900 to-slate-950",
    badge: "bg-orange-500/15 text-orange-300 border border-orange-400/30",
    btnPrimary: "bg-orange-600 hover:bg-orange-500 text-white",
    btnGhost: "border border-orange-400/40 text-orange-100 hover:bg-orange-500/10",
    numberBg: "bg-orange-600",
    accentText: "text-orange-400",
    blob: "from-orange-500 to-amber-600",
    chip: "bg-orange-500/10 text-orange-300 border border-orange-400/20",
    cardBorder: "border-orange-500/30",
  },
  cyan: {
    heroBg: "from-teal-950 via-cyan-900 to-slate-950",
    badge: "bg-cyan-500/15 text-cyan-300 border border-cyan-400/30",
    btnPrimary: "bg-cyan-600 hover:bg-cyan-500 text-white",
    btnGhost: "border border-cyan-400/40 text-cyan-100 hover:bg-cyan-500/10",
    numberBg: "bg-cyan-600",
    accentText: "text-cyan-400",
    blob: "from-cyan-500 to-teal-600",
    chip: "bg-cyan-500/10 text-cyan-300 border border-cyan-400/20",
    cardBorder: "border-cyan-500/30",
  },
  indigo: {
    heroBg: "from-slate-950 via-indigo-950 to-blue-950",
    badge: "bg-indigo-500/15 text-indigo-300 border border-indigo-400/30",
    btnPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white",
    btnGhost: "border border-indigo-400/40 text-indigo-100 hover:bg-indigo-500/10",
    numberBg: "bg-indigo-600",
    accentText: "text-indigo-400",
    blob: "from-indigo-500 to-blue-700",
    chip: "bg-indigo-500/10 text-indigo-300 border border-indigo-400/20",
    cardBorder: "border-indigo-500/30",
  },
};

export const NICHES = {
  estagiarios: {
    slug: "estagiarios",
    track: "internship",
    segment: "internship",
    tabLabel: "Estagiários",
    eyebrow: "Para estagiários",
    headline: "Sua vaga de estágio pede experiência que você ainda não tem?",
    subheadline:
      "A gente sabe: quase toda vaga de estágio parece exigir mais do que um estudante pode ter. Envie seu currículo e a vaga que você quer e veja exatamente onde focar para se destacar, sem precisar de anos de experiência.",
    painPoints: [
      "Currículo genérico que não destaca projetos da faculdade ou cursos",
      "Insegurança sobre o que colocar quando você nunca trabalhou antes",
      "Não saber quais perguntas o recrutador vai fazer numa primeira entrevista",
    ],
    benefits: [
      { title: "Score de aderência", description: "Um número de 0 a 100 que mostra se vale a pena aplicar, antes de você perder a vaga esperando resposta." },
      { title: "Gaps de palavras-chave", description: "As palavras exatas que faltam no currículo para passar pelo filtro automático do RH." },
      { title: "Resposta pronta para \"fale sobre você\"", description: "Um roteiro natural, sem decoreba, para você não travar na frente do recrutador." },
      { title: "Perguntas de entrevista prováveis", description: "As perguntas que esse tipo de vaga mais faz, chegue treinado mesmo na sua primeira entrevista." },
    ],
    ctaLabel: "Analisar meu currículo de estágio →",
    themeAccent: "green",
    heroIcon: "🎒",
    heroImage: "/niche-hero/estagio.png",
    quickFeatures: ["Currículo focado em estágio", "Vagas de estágio compatíveis", "Simulados e testes online", "Plano de estudo e desenvolvimento"],
    socialProof: "Se você sente que todo mundo parece mais pronto que você, aqui a ideia é te mostrar o que já conta a seu favor.",
    samplePreview: {
      score: 78,
      scoreLabel: "Aderência à vaga de Estágio em Marketing",
      strengths: [
        "Projeto acadêmico de campanha digital aparece como diferencial claro",
        "Inglês intermediário bate com o requisito da vaga",
      ],
      gaps: [
        "Falta a palavra-chave \"Google Analytics\", pedida na vaga",
        "Nenhuma menção a trabalho em equipe ou liderança de projeto",
      ],
      sampleQuestion: "Conte sobre um projeto da faculdade que você levaria para essa vaga.",
    },
  },
  "primeiro-emprego": {
    slug: "primeiro-emprego",
    track: "internship",
    segment: "first_job",
    tabLabel: "Primeiro emprego",
    eyebrow: "Para quem busca o primeiro emprego",
    headline: "Primeira vaga formal? Não aplique no escuro.",
    subheadline:
      "Sem experiência de carteira assinada, é fácil se sentir perdido sobre o que destacar. Envie seu currículo e a vaga desejada e receba um diagnóstico honesto do que já está bom e do que precisa mudar.",
    painPoints: [
      "Não saber se o currículo está \"bom o suficiente\" para aplicar",
      "Medo de ser descartado por falta de experiência formal",
      "Nervosismo com a primeira entrevista de emprego",
    ],
    benefits: [
      { title: "Score de aderência", description: "Descubra se você tem chance real nessa vaga antes de gastar tempo aplicando no escuro." },
      { title: "Plano de evolução", description: "O que estudar primeiro para fechar as lacunas que mais pesam contra você." },
      { title: "Checklist de currículo", description: "Cada erro de formatação e cada palavra-chave que falta, revisados um por um." },
      { title: "Perguntas de entrevista", description: "Treine as perguntas reais antes de sentar na frente do recrutador de verdade." },
    ],
    ctaLabel: "Ver meu diagnóstico de primeiro emprego →",
    themeAccent: "blue",
    heroIcon: "💼",
    heroImage: "/niche-hero/primeiro-emprego.png",
    quickFeatures: ["Currículo profissional com IA", "Vagas que combinam com seu perfil", "Simulados e testes online", "Dicas de entrevista"],
    socialProof: "Se você nunca teve carteira assinada, isso não te deixa para trás, só pede um currículo contado do jeito certo.",
    samplePreview: {
      score: 64,
      scoreLabel: "Aderência à vaga de Assistente Administrativo",
      strengths: [
        "Organização e Excel básico aparecem alinhados com a vaga",
        "Disponibilidade de horário compatível com o anunciado",
      ],
      gaps: [
        "Currículo não menciona nenhum resultado ou número concreto",
        "Falta uma frase de objetivo claro no topo do currículo",
      ],
      sampleQuestion: "Por que você quer essa vaga mesmo sem experiência de carteira assinada?",
    },
  },
  "transicao-de-carreira": {
    slug: "transicao-de-carreira",
    track: "career_change",
    segment: "career_change",
    tabLabel: "Transição de carreira",
    eyebrow: "Para transição de carreira",
    headline: "Trocar de área não é começar do zero.",
    subheadline:
      "Você já tem experiência, só não está na área nova ainda. Envie seu currículo e a vaga que você quer e veja quais habilidades da sua trajetória atual já contam a seu favor.",
    painPoints: [
      "Sensação de estar competindo com quem já é da área há anos",
      "Dificuldade de explicar por que está mudando de carreira",
      "Não saber quais cargos-ponte usar para chegar até o objetivo final",
    ],
    benefits: [
      { title: "Habilidades transferíveis", description: "O que da sua experiência atual já conta ponto na área nova, pare de se sentir \"atrás de todo mundo\"." },
      { title: "Narrativa de transição", description: "Um texto pronto para LinkedIn e entrevistas que explica sua mudança sem parecer fuga." },
      { title: "Cargos-ponte", description: "O cargo intermediário certo para entrar na área nova sem dar um salto grande demais." },
      { title: "Resposta para \"por que você quer mudar de área?\"", description: "Uma resposta estratégica e pronta, que vira ponto forte em vez de alarme no processo." },
    ],
    ctaLabel: "Analisar minha transição de carreira →",
    themeAccent: "orange",
    heroIcon: "🧭",
    heroImage: "/niche-hero/transicao.png",
    quickFeatures: ["Mapeamento de habilidades", "Vagas ponte e em alta", "Plano de estudo", "Currículo para nova área"],
    socialProof: "Trocar de área não apaga o que você já viveu; a gente ajuda a traduzir isso para a vaga nova.",
    samplePreview: {
      score: 71,
      scoreLabel: "Aderência à vaga de Analista de Dados Jr (vindo de Marketing)",
      strengths: [
        "Experiência com relatórios e métricas de Marketing conta como base analítica",
        "Curso recente de SQL aparece como sinal de movimento real",
      ],
      gaps: [
        "Currículo ainda lê como currículo de Marketing, não de Dados",
        "Falta contextualizar por que a mudança de área faz sentido",
      ],
      sampleQuestion: "Por que você quer mudar de Marketing para Dados agora?",
    },
  },
  recolocacao: {
    slug: "recolocacao",
    track: "reemployment",
    segment: "career_pro",
    tabLabel: "Recolocação",
    eyebrow: "Para recolocação profissional",
    headline: "De volta ao mercado, mas sem saber por onde recomeçar?",
    subheadline:
      "Depois de um tempo fora ou de um desligamento, cada candidatura pesa mais. Envie seu currículo e a vaga desejada e receba uma estratégia realista de como se posicionar.",
    painPoints: [
      "Gap no currículo que você não sabe como explicar",
      "Medo de estar com tecnologia ou conhecimento desatualizado",
      "Candidaturas sem retorno e sem saber o motivo",
    ],
    benefits: [
      { title: "Objeções prováveis do recrutador", description: "O que provavelmente vai pesar contra você nessa vaga, e como responder antes que perguntem." },
      { title: "Estratégia de candidatura", description: "Como se posicionar para esta vaga específica, sem reciclar o mesmo currículo de sempre." },
      { title: "Plano semanal de candidaturas", description: "Ações concretas para retomar a busca sem se perder ou travar de novo." },
      { title: "Análise de feedbacks anteriores", description: "Cole os feedbacks que já recebeu e descubra o padrão que está te barrando." },
    ],
    ctaLabel: "Analisar minha recolocação →",
    themeAccent: "purple",
    heroIcon: "🎯",
    heroImage: "/niche-hero/recolocacao.png",
    quickFeatures: ["Análise completa do currículo", "Vagas e oportunidades melhores", "Otimização do LinkedIn", "Preparação para entrevistas"],
    socialProof: "Depois de uma pausa, o que mais ajuda é clareza: o que dizer, o que mostrar e por onde voltar.",
    samplePreview: {
      score: 82,
      scoreLabel: "Aderência à vaga de Coordenador Comercial",
      strengths: [
        "Histórico de gestão de equipe bate com o nível pedido na vaga",
        "Resultados numéricos (crescimento de carteira) aparecem bem destacados",
      ],
      gaps: [
        "Gap de 8 meses no currículo sem nenhuma explicação",
        "LinkedIn desatualizado em relação ao currículo enviado",
      ],
      sampleQuestion: "O que você fez durante o período fora do mercado de trabalho?",
    },
  },
  "menor-aprendiz": {
    slug: "menor-aprendiz",
    track: "apprentice",
    segment: "apprentice",
    tabLabel: "Menor aprendiz",
    eyebrow: "Para jovem aprendiz",
    headline: "Seu primeiro currículo, pronto para o programa de aprendizagem.",
    subheadline:
      "Ninguém espera que você já tenha experiência de trabalho, mas o currículo ainda precisa mostrar o seu potencial. Envie o que você já tem e receba dicas simples para melhorar antes de aplicar.",
    painPoints: [
      "Nunca ter feito um currículo antes e não saber o que colocar",
      "Achar que \"não tem nada\" para mostrar por ainda não ter trabalhado",
      "Não saber o que esperar de uma primeira entrevista",
    ],
    benefits: [
      { title: "Diagnóstico simples e direto", description: "Sem termo difícil, direto ao ponto, feito para quem está começando agora." },
      { title: "O que já conta a seu favor", description: "Escola, cursos livres e atividades extracurriculares contam, sim, a gente mostra como usar isso." },
      { title: "Resposta pronta para \"fale sobre você\"", description: "Um roteiro fácil de decorar para você não travar na primeira entrevista da vida." },
      { title: "Checklist de currículo", description: "Os ajustes rápidos que deixam o currículo com cara de profissional." },
    ],
    ctaLabel: "Analisar meu currículo de jovem aprendiz →",
    themeAccent: "cyan",
    heroIcon: "🌱",
    heroImage: "/niche-hero/aprendiz.png",
    quickFeatures: ["Currículo simples e objetivo", "Vagas de Jovem Aprendiz", "Dicas para se destacar", "Dicas de entrevista"],
    socialProof: "Ninguém espera experiência de trabalho aqui; o importante é mostrar vontade, rotina e responsabilidade.",
    samplePreview: {
      score: 70,
      scoreLabel: "Aderência ao Programa de Aprendizagem",
      strengths: [
        "Disponibilidade de horário compatível com o programa",
        "Atividade extracurricular (grêmio estudantil) mostra iniciativa",
      ],
      gaps: [
        "Currículo sem nenhum contato de referência (professor, coordenador)",
        "Falta indicar a série/ano escolar atual",
      ],
      sampleQuestion: "Por que você quer participar do programa de aprendizagem?",
    },
  },
  estudante: {
    slug: "estudante",
    track: "growth",
    segment: "student",
    tabLabel: "Escolher carreira",
    eyebrow: "Para quem está escolhendo carreira",
    headline: "Faculdade, técnico ou nem isso ainda? Decida com informação, não no escuro.",
    subheadline:
      "Teste vocacional genérico te diz \"você gosta de gente\" e para por aí. Aqui você compara faculdade x técnico, entende o dia a dia e o mercado de cada área e sai com um caminho real para seguir.",
    painPoints: [
      "Não saber se vale mais a pena faculdade, curso técnico ou nem um nem outro",
      "Pressão da família e da escola para decidir uma profissão \"para a vida toda\"",
      "Testes vocacionais genéricos que não explicam o dia a dia real da profissão",
    ],
    benefits: [
      { title: "Teste vocacional por área", description: "Descubra qual caminho dentro da área combina mais com você, não só \"exatas ou humanas\"." },
      { title: "Faculdade x técnico", description: "Compare tempo, investimento e mercado de cada opção antes de decidir." },
      { title: "Mapa de áreas e trilhas", description: "Veja os caminhos possíveis dentro da profissão escolhida, sem travar na primeira escolha." },
      { title: "Plano de decisão", description: "Passos práticos para sair da dúvida e decidir com mais segurança." },
    ],
    ctaLabel: "Fazer meu teste vocacional →",
    primaryCtaHref: "/tools/vocation-test",
    themeAccent: "indigo",
    heroIcon: "🎓",
    heroImage: "/niche-hero/estudante.png",
    quickFeatures: ["Teste de afinidade profissional", "Área e carreiras compatíveis", "Faculdades e cursos recomendados", "Plano de estudo e ação"],
    heroSecondaryCtaLabel: "Analisar meu currículo",
    socialProof: "Escolher caminho sem pressão fica mais fácil quando alguém organiza a bagunça junto com você.",
    samplePreview: {
      score: 85,
      scoreLabel: "Afinidade com a área de Tecnologia",
      strengths: [
        "Alto interesse por resolver problemas lógicos passo a passo",
        "Preferência por trabalho autônomo bate com a rotina da área",
      ],
      gaps: [
        "Baixo interesse declarado por apresentações e comunicação em público",
        "Ainda não testou nenhuma linguagem de programação na prática",
      ],
      sampleQuestion: "Você prefere resolver um problema sozinho ou discutir a solução em grupo antes?",
    },
    simpleTierLabel: "Currículo Simples",
    simpleTierDescription: "Currículo pronto para já começar a se posicionar, mesmo sem ter escolhido a área ainda.",
    completeTierLabel: "Teste Vocacional",
    completeTierDescription: "Compare faculdade x técnico, veja o mercado de cada área e saia com um caminho real para seguir.",
    completeTierCta: "Fazer teste vocacional",
    howItWorks: [
      { title: "Escolha uma área", description: "Selecione a área que mais te interessa entre as opções disponíveis." },
      { title: "Responda o quiz", description: "Perguntas rápidas sobre o dia a dia real da profissão, não só gostos genéricos." },
      { title: "Decida com clareza", description: "Veja faculdade x técnico, mercado e trilhas antes de escolher seu caminho." },
    ],
    funnelHeadline: "Do grátis à assinatura: veja o que cada etapa libera na sua direção acadêmica",
  },
} as const satisfies Record<string, Niche>;

export type NicheSlug = keyof typeof NICHES;

const FIRST_JOB_PAIN_POINTS: Record<FirstJobPath, string[]> = {
  sem_formacao: [
    "Vaga não pede diploma, mas parece exigir experiência mesmo assim",
    "Não saber o que colocar no currículo além da escola",
    "Medo de ser descartado por não ter curso técnico ou faculdade",
  ],
  formacao: [
    "Formação em andamento e dúvida se já pode se candidatar",
    "Dificuldade de transformar trabalhos e TCC em experiência",
    "Concorrência com quem já estagiou na área durante o curso",
  ],
};

const FIRST_JOB_PATH_OPTIONS: { key: FirstJobPath; label: string }[] = [
  { key: "sem_formacao", label: "Sem formação obrigatória" },
  { key: "formacao", label: "Com faculdade ou curso técnico" },
];

const NICHE_ORDER = Object.keys(NICHES) as NicheSlug[];
const RESOURCE_TABS = [
  { key: "curiosities", label: "Curiosidades" },
  { key: "freeCourses", label: "Cursos gratis" },
  { key: "books", label: "Livros" },
] as const;

type ResourceTab = (typeof RESOURCE_TABS)[number]["key"];

function isNicheSlug(value: string | null): value is NicheSlug {
  return !!value && value in NICHES;
}

export function NicheLandingPage() {
  const [activeSlug, setActiveSlug] = useState<NicheSlug>(() => {
    if (typeof window === "undefined") return "estagiarios";
    const fromUrl = new URLSearchParams(window.location.search).get("nicho");
    return isNicheSlug(fromUrl) ? fromUrl : "estagiarios";
  });
  const [activeResourceTab, setActiveResourceTab] = useState<ResourceTab>("curiosities");
  const [firstJobPath, setFirstJobPath] = useState<FirstJobPath>("sem_formacao");

  const niche: Niche = NICHES[activeSlug];
  const theme = THEME_PALETTE[niche.themeAccent];
  const offer = CAREER_OFFER_BY_SEGMENT[niche.segment];
  const firstAnalysisHref = `/analise?track=${niche.track}`;
  const freeResumeHref = `/curriculo-gratis?nicho=${encodeURIComponent(niche.slug)}`;
  const subscriptionHref = `/assinar?segment=${encodeURIComponent(niche.segment)}`;
  const ctaHref = niche.primaryCtaHref ?? firstAnalysisHref;
  const completeTierHref = niche.primaryCtaHref ?? firstAnalysisHref;
  const resourceItems = offer[activeResourceTab];
  const isFirstJob = activeSlug === "primeiro-emprego";
  const firstJobGuide = FIRST_JOB_GUIDE_BY_PATH[firstJobPath];
  const painPoints = isFirstJob ? FIRST_JOB_PAIN_POINTS[firstJobPath] : niche.painPoints;
  // A CTA não cita preço: o valor da primeira análise aparece só no checkout,
  // então mudar `firstAnalysisPrice` não exige revisar o texto do hero.
  const heroSecondaryCtaLabel = niche.heroSecondaryCtaLabel ?? "Analisar meu currículo";
  const attentionCards = [
    {
      label: "Antes de aplicar",
      title: `${niche.samplePreview.score} de aderência`,
      description: niche.samplePreview.scoreLabel,
    },
    {
      label: "Onde mexer",
      title: "Lacunas claras, sem achismo",
      description: niche.samplePreview.gaps[0],
    },
    {
      label: "Próximo passo",
      title: offer.nextBestAction,
      description: niche.socialProof,
    },
  ];

  return (
    <div className="w-full">
      <div className={`bg-gradient-to-br ${theme.heroBg}`}>
        <header className="max-w-6xl mx-auto px-4 md:px-8 py-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/">
            <BrandLogo heightClassName="h-11" onDark />
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-white/70">
            <a href="#como-funciona" className="hidden sm:inline hover:text-white transition-colors">Como funciona</a>
            <a href="#recursos" className="hidden sm:inline hover:text-white transition-colors">Recursos</a>
            <a href="#planos" className="hidden sm:inline hover:text-white transition-colors">Planos</a>
            <Link href="/vagas-de-hoje" className="hover:text-white transition-colors whitespace-nowrap">Vagas de hoje</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          </nav>
          <Link
            href="/login"
            className="rounded-lg border border-white/20 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Entrar
          </Link>
        </header>

        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {/* Niche selector */}
          <section className="pt-2 md:pt-4">
            <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-3">
              Qual é o seu momento agora?
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {NICHE_ORDER.map((slug) => {
                const active = slug === activeSlug;
                const slugTheme = THEME_PALETTE[NICHES[slug].themeAccent];
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => setActiveSlug(slug)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold border transition-all ${
                      active
                        ? `${slugTheme.btnPrimary} border-transparent shadow-sm`
                        : "border-white/15 text-white/60 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {NICHES[slug].tabLabel}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Hero */}
          <section className="py-10 md:py-14 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
            <div>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-4 ${theme.badge}`}>
                {niche.eyebrow}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                {niche.headline}
              </h1>
              <p className="text-white/70 mt-5 max-w-xl text-base md:text-lg">
                {niche.subheadline}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Link
                  href={freeResumeHref}
                  className={`inline-flex items-center justify-center rounded-xl font-semibold px-6 py-3.5 text-sm transition-all shadow-md hover:-translate-y-0.5 ${theme.btnPrimary}`}
                >
                  Criar currículo grátis
                </Link>
                <Link
                  href={firstAnalysisHref}
                  className={`inline-flex items-center justify-center rounded-xl font-semibold px-6 py-3.5 text-sm transition-all ${theme.btnGhost}`}
                >
                  {heroSecondaryCtaLabel}
                </Link>
              </div>
              <p className="mt-4 text-[11px] text-white/40">
                Não precisa de cartão de crédito.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                <div className="rounded-xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/45 font-semibold">Entrega 1</p>
                  <p className="mt-1 text-sm font-semibold text-white">Score claro de aderência</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/45 font-semibold">Entrega 2</p>
                  <p className="mt-1 text-sm font-semibold text-white">Lacunas e palavras-chave</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/45 font-semibold">Entrega 3</p>
                  <p className="mt-1 text-sm font-semibold text-white">Pergunta provável de entrevista</p>
                </div>
              </div>

              {/* Quick features */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {niche.quickFeatures.map((feature) => (
                  <div
                    key={feature}
                    className={`rounded-xl px-3 py-2.5 text-[11px] font-medium leading-snug ${theme.chip}`}
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative mx-auto w-full max-w-xs aspect-[4/5] mt-16 lg:mt-0 lg:-translate-y-6">
              <div className={`absolute inset-0 rounded-[2.5rem] bg-gradient-to-br ${theme.blob} opacity-90`} />
              <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden">
                <Image
                  src={niche.heroImage}
                  alt={niche.eyebrow}
                  fill
                  sizes="(max-width: 1024px) 320px, 380px"
                  className="object-cover object-top"
                />
              </div>
              <div className="absolute -top-24 -right-4 max-w-[11rem] rounded-2xl bg-white/95 p-3 text-slate-900 shadow-xl backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Leitura rápida</p>
                <p className="mt-2 text-2xl font-extrabold leading-none">{niche.samplePreview.score}</p>
                <p className="mt-1 text-xs font-semibold leading-snug text-slate-700">{niche.samplePreview.scoreLabel}</p>
              </div>
              <div className="absolute left-4 right-4 bottom-4 rounded-2xl bg-slate-950/78 p-3 text-white shadow-xl backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">Pergunta que costuma aparecer</p>
                <p className="mt-1 text-sm leading-snug">“{niche.samplePreview.sampleQuestion}”</p>
              </div>
              <span className="absolute bottom-5 right-5 h-11 w-11 rounded-full bg-white/95 shadow-md flex items-center justify-center text-xl">
                {niche.heroIcon}
              </span>
            </div>
          </section>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Attention strip */}
        <section className="-mt-6 pb-4 md:pb-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {attentionCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white/96 dark:bg-neutral-950/96 p-5 shadow-lg shadow-slate-900/5"
              >
                <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${theme.accentText}`}>{card.label}</p>
                <p className="mt-2 text-base font-bold tracking-tight text-neutral-900 dark:text-white">{card.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Human reassurance */}
        <section className="pb-6 md:pb-8">
          <div className="rounded-[2rem] border border-neutral-200 dark:border-neutral-800 bg-slate-950 text-white p-6 md:p-8 shadow-2xl shadow-slate-950/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.16),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.10),transparent_35%)]" />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/45">
                Feito para quem já se sentiu travado
              </p>
              <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight max-w-3xl">
                Você não precisa parecer perfeito. Precisa entender o que mostrar, o que falar e por onde começar.
              </h2>
              <p className="mt-3 max-w-3xl text-sm md:text-base leading-relaxed text-white/72">
                A ideia aqui não é te encher de frase bonita nem te tratar como número. É pegar a sua história real, organizar o que ela já tem de bom e te devolver um caminho que faça sentido de verdade.
              </p>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">Primeiro</p>
                  <p className="mt-1 text-sm font-semibold text-white">A gente lê sua história sem julgamento.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">Depois</p>
                  <p className="mt-1 text-sm font-semibold text-white">Mostra o que já prova que você pode dar conta.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">Por fim</p>
                  <p className="mt-1 text-sm font-semibold text-white">Você sai com próximo passo claro, sem adivinhação.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pain points */}
        <section className="py-10 md:py-14">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-6 shadow-sm space-y-3 max-w-2xl mx-auto">
            <div className="flex items-start justify-between gap-4 pb-1">
              <div>
                <h2 className="font-bold text-sm text-neutral-500 uppercase tracking-wider">
                  Isso soa familiar?
                </h2>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-xl">
                  {niche.socialProof}
                </p>
              </div>
              <span className={`hidden sm:inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${theme.chip}`}>
                Feito para o seu momento
              </span>
            </div>
            {isFirstJob && (
              <div className="flex flex-wrap gap-2 pb-1">
                {FIRST_JOB_PATH_OPTIONS.map((path) => {
                  const active = path.key === firstJobPath;
                  return (
                    <button
                      key={path.key}
                      type="button"
                      onClick={() => setFirstJobPath(path.key)}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold border transition-all ${
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      {path.label}
                    </button>
                  );
                })}
              </div>
            )}
            <h2 className="font-bold text-sm text-neutral-500 uppercase tracking-wider">
              O que normalmente trava a sua candidatura
            </h2>
            <ul className="space-y-3">
              {painPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
                  <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center text-[11px] font-bold">
                    !
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Sample preview */}
        <section className="pb-12">
          <div className="text-center max-w-2xl mx-auto">
            <p className={`text-xs font-semibold uppercase tracking-wide ${theme.accentText}`}>Exemplo real</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
              Veja o que a análise te devolve
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              Um exemplo de diagnóstico gerado pelo sistema para o seu momento, o seu vai usar o seu currículo e a vaga real.
            </p>
          </div>

          <div className="mt-8 max-w-2xl mx-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-5">
              <div className={`h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-full flex items-center justify-center text-lg md:text-xl font-extrabold ${theme.chip}`}>
                {niche.samplePreview.score}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  Score de aderência (exemplo)
                </p>
                <p className="text-sm md:text-base font-bold mt-0.5">{niche.samplePreview.scoreLabel}</p>
              </div>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2">
                  Pontos fortes
                </p>
                <ul className="space-y-2">
                  {niche.samplePreview.strengths.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-2">
                  Pontos de atenção
                </p>
                <ul className="space-y-2">
                  {niche.samplePreview.gaps.map((g) => (
                    <li key={g} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold">
                        !
                      </span>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={`mt-6 rounded-xl p-4 text-sm ${theme.chip}`}>
              <p className="font-semibold mb-1">
                {niche.slug === "estudante" ? "Pergunta do teste vocacional" : "Pergunta provável de entrevista"}
              </p>
              <p>&ldquo;{niche.samplePreview.sampleQuestion}&rdquo;</p>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 text-left">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-400">Você enxerga rápido</p>
                <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">o que está bom</p>
              </div>
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 text-left">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-400">Você enxerga rápido</p>
                <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">o que está faltando</p>
              </div>
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 text-left">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-400">Você sai com</p>
                <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">um próximo passo concreto</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="como-funciona" className="py-12 border-t border-neutral-100 dark:border-neutral-900 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center">
            Como funciona
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {(
              niche.howItWorks ?? [
                { title: "Crie seu currículo grátis", description: "Responda algumas perguntas e gere um currículo profissional para se posicionar." },
                { title: "Faça sua primeira análise", description: "Descubra o quanto seu perfil combina com a vaga e o que ajustar." },
                { title: "Receba seu plano de ação", description: "Veja o que fazer para aumentar suas chances nas próximas candidaturas." },
              ]
            ).map((step, i) => (
              <div key={step.title} className="text-center">
                <span className={`mx-auto h-10 w-10 rounded-xl text-white flex items-center justify-center font-bold shadow-md ${theme.numberBg}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-semibold text-sm mt-3">{step.title}</p>
                <p className="text-xs text-neutral-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA banner */}
        <section className="py-10 border-t border-neutral-100 dark:border-neutral-900 text-center">
          <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${theme.accentText}`}>
            Comece de graça hoje mesmo
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2 max-w-md mx-auto text-sm">
            Crie seu currículo grátis e dê o primeiro passo para o seu futuro.
          </p>
          <Link
            href={freeResumeHref}
            className={`mt-5 inline-flex items-center justify-center rounded-xl font-semibold px-6 py-3.5 text-sm transition-all shadow-md hover:-translate-y-0.5 ${theme.btnPrimary}`}
          >
            Criar currículo grátis
          </Link>
          <p className="mt-3 text-[11px] text-neutral-400">
            Não precisa de cartão de crédito.
          </p>
          <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
            Ainda não tem currículo nenhum?{" "}
            <Link href={freeResumeHref} className={`font-semibold hover:underline ${theme.accentText}`}>
              Monte um do zero, grátis
            </Link>
          </p>
        </section>

        {/* Pricing: grátis, pagamento único e assinatura mensal, valor específico do nicho */}
        <section id="planos" className="py-12 border-t border-neutral-100 dark:border-neutral-900 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto">
            <p className={`text-xs font-semibold uppercase tracking-wide ${theme.accentText}`}>O que você ganha</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
              {niche.funnelHeadline ?? "Do grátis à assinatura: veja o que cada etapa libera"}
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Tier 1: grátis */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-6 flex flex-col">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Para começar</p>
              <p className="text-lg font-bold mt-1">{niche.simpleTierLabel ?? "Análise Simples"}</p>
              <p className={`mt-2 text-3xl font-extrabold ${theme.accentText}`}>Grátis</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 flex-1">
                {niche.simpleTierDescription ?? "Score básico, pontos fortes e de atenção, e as palavras-chave que faltam no currículo."}
              </p>
              <Link
                href={freeResumeHref}
                className="mt-6 inline-flex items-center justify-center rounded-lg font-semibold px-5 py-3 text-sm border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                Começar grátis
              </Link>
            </div>

            {/* Tier 2: pagamento único */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-6 flex flex-col">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Pagamento único</p>
              <p className="text-lg font-bold mt-1">{niche.completeTierLabel ?? "Análise Completa"}</p>
              <p className={`mt-2 text-3xl font-extrabold ${theme.accentText}`}>{offer.diagnosticPrice}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                {niche.completeTierDescription ?? "Tudo que você precisa para aplicar com confiança nesta vaga."}
              </p>
              <div className="mt-4 space-y-2 flex-1">
                {offer.includes.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                      +
                    </span>
                    {item}
                  </div>
                ))}
              </div>
              <Link
                href={completeTierHref}
                className={`mt-6 inline-flex items-center justify-center rounded-lg font-semibold px-5 py-3 text-sm transition-colors ${theme.btnPrimary}`}
              >
                {niche.completeTierCta ?? "Quero minha análise"}
              </Link>
            </div>

            {/* Tier 3: assinatura mensal, valor por nicho */}
            <div className={`relative rounded-2xl border-2 ${theme.cardBorder} bg-white dark:bg-neutral-950 p-6 flex flex-col shadow-lg lg:-my-2 lg:py-8`}>
              <span className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full text-white text-[10px] font-bold uppercase tracking-wide px-3 py-1 shadow-sm whitespace-nowrap ${theme.numberBg}`}>
                Melhor custo-benefício
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Assinatura mensal</p>
              <p className="text-lg font-bold mt-1">{offer.monthlyName}</p>
              <p className={`mt-2 text-3xl font-extrabold ${theme.accentText}`}>{offer.monthlyPrice}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                Resolve toda a sua busca, não só uma vaga.
              </p>
              <div className="mt-4 space-y-2 flex-1">
                {[...offer.monthlyFeatures, ...offer.retentionFeatures].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                    {item}
                  </div>
                ))}
              </div>
              <span className="mt-4 inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold px-2.5 py-1">
                Sem fidelidade, cancele quando quiser
              </span>
              <Link
                href={subscriptionHref}
                className={`mt-4 inline-flex items-center justify-center rounded-lg font-semibold px-5 py-3 text-sm transition-colors ${theme.btnPrimary}`}
              >
                Assinar {offer.monthlyName}
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
            {niche.socialProof}
          </p>
          <p className="mt-2 max-w-2xl mx-auto text-center text-xs text-neutral-400">
            <strong className="text-neutral-600 dark:text-neutral-300">Próxima melhor ação:</strong> {offer.nextBestAction}
          </p>
        </section>

        {/* Learning resources */}
        <section id="recursos" className="py-12 border-t border-neutral-100 dark:border-neutral-900 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${theme.accentText}`}>
                Biblioteca por momento
              </p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                Curiosidades, cursos gratis e livros
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
                Conteúdo enxuto não prende atenção. Aqui a ideia é abrir caminhos reais e ajudar você a decidir com mais segurança.
              </p>
            </div>
            <div className="inline-flex rounded-xl border border-neutral-200 dark:border-neutral-800 p-1 bg-white/80 dark:bg-neutral-950/80">
              {RESOURCE_TABS.map((tab) => {
                const active = activeResourceTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveResourceTab(tab.key)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                      active
                        ? theme.btnPrimary
                        : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            {resourceItems.map((item, index) => (
              <div
                key={item}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
              >
                <p className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${theme.accentText}`}>
                  {RESOURCE_TABS[index].label}
                </p>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 border-t border-neutral-100 dark:border-neutral-900">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center">
            O que você recebe na análise
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {niche.benefits.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-5 shadow-sm hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
              >
                <p className="font-bold text-sm">{item.title}</p>
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* First job tips teaser */}
        {isFirstJob && (
          <section className="py-12 border-t border-neutral-100 dark:border-neutral-900">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center">
              Dicas para {FIRST_JOB_PATH_OPTIONS.find((p) => p.key === firstJobPath)!.label.toLowerCase()}
            </h2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {firstJobGuide.tips.slice(0, 2).map((tip, i) => (
                <div
                  key={tip.title}
                  className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-5 shadow-sm flex items-start gap-3"
                >
                  <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[11px] font-bold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{tip.title}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 max-w-3xl mx-auto rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                O plano mensal libera o guia completo, com todas as dicas explicadas passo a passo e o que fazer na prática em cada uma.
              </p>
              <Link
                href={ctaHref}
                className="shrink-0 inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors"
              >
                Assinar e ver guia completo
              </Link>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="py-14 pb-24 sm:pb-14 border-t border-neutral-100 dark:border-neutral-900 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Pronto para montar seu currículo?
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2 max-w-md mx-auto text-sm">
            Comece pelo fluxo grátis e, depois, use a análise completa quando quiser comparar com uma vaga real.
          </p>
          <Link
            href={freeResumeHref}
            className={`mt-6 inline-flex items-center justify-center rounded-xl font-semibold px-6 py-3.5 text-sm transition-all shadow-md hover:-translate-y-0.5 ${theme.btnPrimary}`}
          >
            Criar currículo grátis
          </Link>
        </section>
      </main>

      {/* Sticky mobile CTA */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-20 border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur px-4 py-3">
        <Link
          href={freeResumeHref}
          className={`flex items-center justify-center rounded-xl font-semibold px-6 py-3 text-sm transition-all shadow-md ${theme.btnPrimary}`}
        >
          Criar currículo grátis
        </Link>
      </div>

      <SiteFooter />
    </div>
  );
}
