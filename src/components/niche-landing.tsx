"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { SiteFooter } from "@/components/site-footer";
import type { CareerTrack } from "@/components/analysis-display";
import { CAREER_OFFER_BY_SEGMENT } from "@/lib/career-offers";
import { COMMERCIAL_PLANS } from "@/lib/commercial-plan-catalog";
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
  /** Overrides the default "Criar currículo grátis" primary action (hero, banner, sticky, final CTA).
   * Used by study niches (concurso/OAB) to send people to the study hub instead of the resume flow. */
  heroPrimaryCtaLabel?: string;
  heroPrimaryCtaHref?: string;
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
      { title: "Saiba se vale aplicar", description: "Uma leitura simples para você entender se essa vaga combina com o que já sabe fazer." },
      { title: "Descubra o que falta", description: "Veja quais palavras e experiências precisam aparecer melhor no seu currículo." },
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
      scoreLabel: "Como seu currículo conversa com uma vaga de Marketing",
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
      "Sem experiência de carteira assinada, é fácil se sentir perdido sobre o que destacar. Envie seu currículo e a vaga desejada para entender o que já está bom e o que precisa mudar.",
    painPoints: [
      "Não saber se o currículo está \"bom o suficiente\" para aplicar",
      "Medo de ser descartado por falta de experiência formal",
      "Nervosismo com a primeira entrevista de emprego",
    ],
    benefits: [
      { title: "Uma leitura honesta", description: "Entenda se o seu currículo conversa com a vaga antes de gastar tempo aplicando no escuro." },
      { title: "Plano de evolução", description: "O que estudar primeiro para fechar as lacunas que mais pesam contra você." },
      { title: "Checklist de currículo", description: "Cada erro de formatação e cada palavra-chave que falta, revisados um por um." },
      { title: "Perguntas de entrevista", description: "Treine as perguntas reais antes de sentar na frente do recrutador de verdade." },
    ],
    ctaLabel: "Ver como melhorar meu currículo →",
    themeAccent: "blue",
    heroIcon: "💼",
    heroImage: "/niche-hero/primeiro-emprego.png",
    quickFeatures: ["Currículo profissional", "Vagas que combinam com seu perfil", "Simulados e testes online", "Dicas de entrevista"],
    socialProof: "Se você nunca teve carteira assinada, isso não te deixa para trás, só pede um currículo contado do jeito certo.",
    samplePreview: {
      score: 64,
      scoreLabel: "Como seu currículo conversa com uma vaga administrativa",
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
      scoreLabel: "Como sua experiência se conecta com uma vaga de Dados Jr",
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
      scoreLabel: "Como sua experiência se conecta com uma vaga comercial",
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
      scoreLabel: "O que seu perfil já mostra para um programa de aprendizagem",
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
    eyebrow: "Orientação de carreira & Ajuda nos estudos do Ensino Médio",
    headline: "Escolha seu caminho profissional e receba ajuda nos estudos do dia a dia.",
    subheadline:
      "Precisa passar nas matérias e decidir o futuro? Tire dúvidas, faça resumos, corrija suas redações do ENEM e compare faculdade x curso técnico em um só lugar.",
    painPoints: [
      "Dificuldade de tirar dúvidas em matérias difíceis da escola fora do horário de aula",
      "Insegurança ao escrever a Redação do ENEM sem saber a nota real por competência",
      "Indecisão sobre fazer faculdade, curso técnico ou entrar direto no mercado",
    ],
    benefits: [
      { title: "Ajuda para estudar 📖", description: "Tire dúvidas de qualquer matéria e receba explicações passo a passo." },
      { title: "Corretor Oficial de Redação ENEM ✍️", description: "Avaliação instantânea de 0 a 1000 dividida pelas 5 competências oficiais do ENEM." },
      { title: "Comparador Faculdade x Técnico ⚖️", description: "Veja duração, investimento, salários e mercado de trabalho antes de tomar sua decisão." },
      { title: "Teste Vocacional & Cronograma 📅", description: "Descubra a área que combina com você e monte seu plano de estudos semanal personalizado." },
    ],
    ctaLabel: "Receber ajuda nos estudos & Orientação →",
    primaryCtaHref: "/ensino-medio",
    themeAccent: "indigo",
    heroIcon: "🎓",
    heroImage: "/niche-hero/estudante.png",
    quickFeatures: ["Ajuda para estudar 24h", "Resumos de matérias", "Corretor de redação ENEM", "Comparador faculdade x técnico"],
    heroSecondaryCtaLabel: "Fazer teste vocacional",
    socialProof: "Tirar dúvidas da escola e decidir seu futuro fica muito mais fácil quando você tem um próximo passo claro.",
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
      { title: "Peça ajuda nas matérias", description: "Tire dúvidas 24h e gere resumos de qualquer matéria do Ensino Médio." },
      { title: "Pratique a Redação ENEM", description: "Envie sua redação e receba avaliação detalhada de 0 a 1000 com dicas de melhoria." },
      { title: "Decida seu caminho", description: "Compare faculdade x técnico, veja o mercado de trabalho e escolha seu futuro com segurança." },
    ],
    funnelHeadline: "Do grátis à assinatura: veja o que cada etapa libera na sua direção acadêmica",
  },
  concurseiro: {
    slug: "concurseiro",
    track: "growth",
    segment: "concurseiro",
    tabLabel: "Concurseiro",
    eyebrow: "Para quem estuda para concurso",
    headline: "Edital gigante e pouco tempo? Estude pelo que realmente cai.",
    subheadline:
      "Cole o edital e o cargo que você quer e receba um ciclo de estudos por peso das matérias, simulados no estilo da banca e uma estimativa de nota de corte, para focar no que aumenta sua chance de aprovação.",
    painPoints: [
      "Edital enorme e a sensação de não saber por onde começar",
      "Estudar muita teoria e travar na hora de resolver questão",
      "Não saber se o seu ritmo dá para chegar pronto até a prova",
    ],
    benefits: [
      { title: "Plano por peso das matérias", description: "Um ciclo de estudos que prioriza o que mais cai e vale mais ponto, não a ordem do edital." },
      { title: "Simulados no estilo da banca", description: "Questões no formato da sua banca (CESPE, FGV, FCC) com gabarito comentado." },
      { title: "Estimativa de nota de corte", description: "Uma referência realista de onde você precisa chegar para o seu cargo." },
      { title: "Cronograma até a prova", description: "Um plano semanal que cabe na sua rotina e se ajusta conforme você avança." },
    ],
    ctaLabel: "Montar meu plano de estudo →",
    primaryCtaHref: "/tools/concurso",
    themeAccent: "indigo",
    heroIcon: "📚",
    heroImage: "/niche-hero/concurso.png",
    quickFeatures: ["Plano de estudo por edital", "Simulados por banca", "Estimativa de nota de corte", "Cronograma até a prova"],
    heroPrimaryCtaLabel: "Montar meu plano de estudo",
    heroPrimaryCtaHref: "/tools/concurso",
    heroSecondaryCtaLabel: "Fazer um simulado grátis",
    socialProof: "Concurso não premia quem estuda mais horas, e sim quem estuda o que cai e resolve questão de verdade.",
    samplePreview: {
      score: 68,
      scoreLabel: "Aproveitamento no simulado de Direito Constitucional",
      strengths: [
        "Bom desempenho em Controle de Constitucionalidade, tema de alta incidência",
        "Ritmo de estudo compatível com a data da prova",
      ],
      gaps: [
        "Baixo acerto em Direito Administrativo, disciplina de peso alto no edital",
        "Poucas questões resolvidas em relação ao tempo de teoria",
      ],
      sampleQuestion: "Segundo a CF/88, compete privativamente à União legislar sobre direito do trabalho. (Certo/Errado)",
    },
    simpleTierLabel: "Plano Inicial",
    simpleTierDescription: "Gere um primeiro ciclo de estudos e faça um simulado para medir seu ponto de partida.",
    completeTierLabel: "Diagnóstico de Preparação",
    completeTierDescription: "Plano por peso das matérias, simulados por banca e estimativa de nota de corte para o seu cargo.",
    completeTierCta: "Montar meu plano",
    howItWorks: [
      { title: "Cole o edital e o cargo", description: "Informe banca, disciplinas e a data da prova que você vai prestar." },
      { title: "Receba o ciclo de estudos", description: "Um plano semanal por peso das matérias, com simulados no estilo da banca." },
      { title: "Acompanhe até a prova", description: "Resolva questões, veja sua estimativa de nota de corte e ajuste o ritmo." },
    ],
    funnelHeadline: "Do grátis à assinatura: veja o que cada etapa libera na sua preparação",
  },
  oab: {
    slug: "oab",
    track: "growth",
    segment: "oab",
    tabLabel: "OAB",
    eyebrow: "Para quem estuda para a OAB",
    headline: "1ª e 2ª fase da OAB: estude pelo estilo da FGV, não no escuro.",
    subheadline:
      "Faça simulados da 1ª fase no formato FGV, treine peças e questões discursivas da 2ª fase com correção por critério e monte um plano de estudo até o dia do exame.",
    painPoints: [
      "Conteúdo enorme e dúvida sobre o que a FGV mais cobra",
      "Insegurança na 2ª fase: estrutura da peça e fundamentação legal",
      "Estudar sem simular o exame e chegar cru na prova",
    ],
    benefits: [
      { title: "Simulado 1ª fase estilo FGV", description: "Questões no formato do exame, com gabarito comentado e foco na incidência da FGV." },
      { title: "Corretor de peça da 2ª fase", description: "Cole sua peça prático-profissional e receba correção por estrutura, fundamentação e técnica." },
      { title: "Correção de discursivas", description: "Treine as questões discursivas da sua área e veja onde ganhar e perder ponto." },
      { title: "Plano por fase", description: "Um cronograma que separa 1ª e 2ª fase e cabe na sua rotina até o exame." },
    ],
    ctaLabel: "Começar minha preparação OAB →",
    primaryCtaHref: "/tools/oab",
    themeAccent: "purple",
    heroIcon: "⚖️",
    heroImage: "/niche-hero/oab.png",
    quickFeatures: ["Simulado 1ª fase (FGV)", "Corretor de peça 2ª fase", "Correção de discursivas", "Plano por fase"],
    heroPrimaryCtaLabel: "Começar minha preparação",
    heroPrimaryCtaHref: "/tools/oab",
    heroSecondaryCtaLabel: "Fazer um simulado da 1ª fase",
    socialProof: "A FGV é previsível: quem treina no estilo do exame e domina a estrutura da peça larga na frente.",
    samplePreview: {
      score: 72,
      scoreLabel: "Aproveitamento no simulado da 1ª fase",
      strengths: [
        "Bom desempenho em Ética e Estatuto da OAB, tema de alta incidência",
        "Constitucional dentro da média necessária para aprovação",
      ],
      gaps: [
        "Baixo acerto em Direito Civil, uma das disciplinas mais cobradas",
        "Peça da 2ª fase sem endereçamento e pedidos completos",
      ],
      sampleQuestion: "Na peça de Direito do Trabalho, qual a ação cabível e o juízo competente para o pedido do enunciado?",
    },
    simpleTierLabel: "Plano Inicial",
    simpleTierDescription: "Faça um simulado da 1ª fase e gere um primeiro plano de estudo até o exame.",
    completeTierLabel: "Diagnóstico de Preparação OAB",
    completeTierDescription: "Simulados FGV, corretor de peça e discursivas da 2ª fase e plano por fase.",
    completeTierCta: "Começar preparação",
    howItWorks: [
      { title: "Escolha a fase", description: "Comece pela 1ª fase com simulado FGV ou pela 2ª fase com peça e discursivas." },
      { title: "Treine e corrija", description: "Resolva questões e receba correção por critério da FGV, com feedback item a item." },
      { title: "Siga o plano até o exame", description: "Um cronograma por fase que se ajusta ao seu desempenho." },
    ],
    funnelHeadline: "Do grátis à assinatura: veja o que cada etapa libera na sua aprovação",
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

// Rota dedicada de cada nicho: usado para linkar (crawlable, não só troca de aba)
// entre as landing pages dedicadas e reforçar que são o mesmo produto.
const NICHE_ROUTES: Record<NicheSlug, string> = {
  estagiarios: "/estagio",
  "menor-aprendiz": "/jovem-aprendiz",
  "primeiro-emprego": "/primeiro-emprego",
  estudante: "/faculdade-ou-tecnico",
  oab: "/oab",
  recolocacao: "/recolocacao",
  "transicao-de-carreira": "/transicao",
  concurseiro: "/concurso",
};
const DEDICATED_HERO_COPY: Record<NicheSlug, { headline: string; subheadline: string }> = {
  estagiarios: {
    headline: "Seu primeiro estágio pode começar com o que você já sabe.",
    subheadline: "Transforme projetos, cursos e atividades em evidências que uma empresa consegue enxergar. Descubra com o CarreirasMatch o ajuste que falta antes de aplicar.",
  },
  "primeiro-emprego": {
    headline: "Seu primeiro emprego não precisa parecer impossível.",
    subheadline: "Com o CarreirasMatch, mostre cursos, projetos e responsabilidades do jeito certo para a vaga. Sem inventar experiência e sem se diminuir.",
  },
  "transicao-de-carreira": {
    headline: "Mudar de área não apaga a experiência que você construiu.",
    subheadline: "Encontre as habilidades transferíveis que já aproximam você da nova carreira e aprenda, com o CarreirasMatch, a contar essa mudança com segurança.",
  },
  recolocacao: {
    headline: "Volte ao mercado com uma história que faz sentido.",
    subheadline: "Organize sua experiência, explique pausas com segurança e ajuste, com o CarreirasMatch, sua apresentação para a vaga que você quer agora.",
  },
  "menor-aprendiz": {
    headline: "Você já tem mais para mostrar do que imagina.",
    subheadline: "Monte com o CarreirasMatch um currículo claro para Jovem Aprendiz usando escola, cursos, atividades e responsabilidade, mesmo sem experiência.",
  },
  estudante: {
    headline: "Pare de escolher seu futuro no achismo.",
    subheadline: "Entenda qual caminho combina com seus interesses, rotina e objetivos, enquanto o CarreirasMatch te ajuda a estudar melhor todos os dias.",
  },
  concurseiro: {
    headline: "Pare de estudar tudo e continuar sem saber se está avançando.",
    subheadline: "Transforme o edital em prioridades, treine com simulados e acompanhe, com o CarreirasMatch, o que realmente aproxima você da aprovação.",
  },
  oab: {
    headline: "Na OAB, estudar mais não basta. Você precisa estudar certo.",
    subheadline: "Treine no padrão da FGV, corrija seus erros e siga, com o CarreirasMatch, um plano claro para a fase em que você está.",
  },
};
const ECOSYSTEM_CARDS = [
  { icon: "🤖", title: "Candidatura automática", description: "Depois do diagnóstico, deixe o sistema aplicar sozinho nas vagas mais compatíveis com o seu perfil.", href: "/applications" },
  { icon: "📡", title: "Radar de concurso e vestibular", description: "Editais e provas monitorados por você, com alertas assim que saem.", href: "/concursos" },
  { icon: "🧑‍💻", title: "Marketplace freelancer", description: "Contrate ou seja contratado para projetos, com um perfil já validado pela plataforma.", href: "/freelancers" },
  { icon: "🗂️", title: "Central de candidaturas", description: "Histórico de Match, currículos e kits organizados por vaga, sem planilha.", href: "/applications" },
] as const;

const RESOURCE_TABS = [
  { key: "curiosities", label: "Curiosidades" },
  { key: "freeCourses", label: "Cursos gratis" },
  { key: "books", label: "Livros" },
] as const;

type ResourceTab = (typeof RESOURCE_TABS)[number]["key"];

function isNicheSlug(value: string | null): value is NicheSlug {
  return !!value && value in NICHES;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Conta de 0 até `value` quando entra na tela. Cai para o valor final direto
 *  se o usuário pediu menos movimento ou o navegador não suporta observer. */
function CountUp({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (
      !el ||
      prefersReducedMotion() ||
      typeof IntersectionObserver === "undefined"
    ) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    let start = 0;
    const duration = 950;
    const run = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(run);
    };

    setDisplay(0);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          raf = requestAnimationFrame(run);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

/** Barra fina no topo que reflete o quanto da página já foi lido. */
function ReadingProgress({ className }: { className: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, doc.scrollTop / max) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent" aria-hidden>
      <div
        className={`h-full origin-left ${className}`}
        style={{ transform: `scaleX(${progress})`, transition: "transform 0.1s linear" }}
      />
    </div>
  );
}

/** Anel de progresso desenhado ao redor do score, que preenche ao entrar na tela.
 *  A cor vem do texto (stroke-current), então o container define o tom do tema. */
function ScoreRing({ value }: { value: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const [inView, setInView] = useState(false);
  const size = 100;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circ * (1 - clamped / 100);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${size} ${size}`}
      className="score-ring h-full w-full -rotate-90"
      style={
        {
          "--ring-circumference": `${circ}`,
          "--ring-offset": `${offset}`,
        } as CSSProperties
      }
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-current opacity-15" />
      {inView && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="score-ring-value stroke-current"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      )}
    </svg>
  );
}

export function NicheLandingPage({ initialNiche }: { initialNiche?: NicheSlug }) {
  const [activeSlug, setActiveSlug] = useState<NicheSlug>(() => {
    if (initialNiche) return initialNiche;
    if (typeof window === "undefined") return "estagiarios";
    const fromUrl = new URLSearchParams(window.location.search).get("nicho");
    return isNicheSlug(fromUrl) ? fromUrl : "estagiarios";
  });
  const [activeResourceTab, setActiveResourceTab] = useState<ResourceTab>("curiosities");
  const [firstJobPath, setFirstJobPath] = useState<FirstJobPath>("sem_formacao");
  const rootRef = useRef<HTMLDivElement>(null);
  const heroVisualRef = useRef<HTMLDivElement>(null);

  // Reveal ao rolar: qualquer .reveal dentro da página aparece ao entrar na tela.
  // Re-roda quando o conteúdo condicional muda (troca de nicho / primeiro emprego)
  // para observar nós recém-montados. Nós já visíveis mantêm a classe.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => {
      if (!el.classList.contains("is-visible")) io.observe(el);
    });
    return () => io.disconnect();
  }, [activeSlug, firstJobPath]);

  // Parallax de ponteiro: o cartão do hero inclina de leve seguindo o mouse.
  // Só no desktop (ponteiro fino) e quando o usuário aceita movimento.
  useEffect(() => {
    const el = heroVisualRef.current;
    if (!el || prefersReducedMotion()) return;
    if (typeof window.matchMedia === "function" && !window.matchMedia("(pointer: fine)").matches) {
      return;
    }
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width - 0.5;
      const cy = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--rx", `${(-cy * 6).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(cx * 8).toFixed(2)}deg`);
    };
    const reset = () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", reset);
    };
  }, []);

  const niche: Niche = NICHES[activeSlug];
  const isDedicatedLanding = initialNiche !== undefined;
  const dedicatedCopy = DEDICATED_HERO_COPY[activeSlug];
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
  const heroSecondaryCtaLabel = niche.heroSecondaryCtaLabel ?? "Criar currículo do zero";
  // Nichos de estudo (concurso/OAB) não usam o fluxo de currículo: a ação primária
  // leva ao hub de estudo e a copy troca de "currículo" para "plano de estudo".
  const isStudyNiche = Boolean(niche.heroPrimaryCtaHref);
  const primaryActionHref = niche.heroPrimaryCtaHref ?? firstAnalysisHref;
  const primaryActionLabel = niche.heroPrimaryCtaLabel ?? "Analisar meu currículo grátis";
  const attentionCards = [
    {
      label: isStudyNiche ? "Onde você está" : "Antes de aplicar",
      title: isStudyNiche ? `${niche.samplePreview.score}% de aproveitamento` : `${niche.samplePreview.score}% de compatibilidade`,
      description: niche.samplePreview.scoreLabel,
    },
    {
      label: isStudyNiche ? "Onde focar" : "Onde mexer",
      title: isStudyNiche ? "Prioridades claras, sem achismo" : "Lacunas claras, sem achismo",
      description: niche.samplePreview.gaps[0],
    },
    {
      label: "Próximo passo",
      title: offer.nextBestAction,
      description: niche.socialProof,
    },
  ];

  return (
    <div ref={rootRef} className="w-full">
      <ReadingProgress className={theme.numberBg} />
      <div className={`relative overflow-hidden bg-gradient-to-br ${theme.heroBg}`}>
        {/* Aurora: dois glows grandes driftando devagar atrás de todo o hero. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className={`animate-aurora absolute -top-32 -left-24 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br ${theme.blob} opacity-30 blur-3xl`}
          />
          <div
            className={`animate-aurora-delayed absolute -bottom-40 right-[-6rem] h-[30rem] w-[30rem] rounded-full bg-gradient-to-br ${theme.blob} opacity-20 blur-3xl`}
          />
        </div>
        <header className="public-header relative max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/">
            <BrandLogo heightClassName="h-12 sm:h-14" onDark />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg border border-white/20 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-slate-950 shadow-sm hover:bg-blue-50 transition-colors"
            >
              Criar conta grátis
            </Link>
          </div>
        </header>

        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          {/* Niche selector */}
          {!isDedicatedLanding && <section className="pt-2 md:pt-4">
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
          </section>}

          {/* Hero remonta ao trocar de nicho para reproduzir a entrada escalonada */}
          <section key={activeSlug} className="py-10 md:py-14 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
            <div>

              <h1 className="animate-rise text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight" style={{ animationDelay: "80ms" }}>
                {isDedicatedLanding ? dedicatedCopy.headline : niche.headline}
              </h1>
              <p className="animate-rise text-white/70 mt-5 max-w-xl text-base md:text-lg" style={{ animationDelay: "160ms" }}>
                {isDedicatedLanding ? dedicatedCopy.subheadline : niche.subheadline}
              </p>
              <div className="animate-rise mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3" style={{ animationDelay: "240ms" }}>
                <Link
                  href={primaryActionHref}
                  className={`btn-shine inline-flex items-center justify-center rounded-xl font-semibold px-6 py-3.5 text-sm transition-all shadow-md hover:-translate-y-0.5 ${theme.btnPrimary}`}
                >
                  {primaryActionLabel}
                </Link>
                <Link
                  href={isStudyNiche ? completeTierHref : freeResumeHref}
                  className={`inline-flex items-center justify-center rounded-xl font-semibold px-6 py-3.5 text-sm transition-all ${theme.btnGhost}`}
                >
                  {heroSecondaryCtaLabel}
                </Link>
              </div>
              <p className="mt-4 text-[11px] text-white/40">
                Não precisa de cartão de crédito.
              </p>

              <div className="animate-rise mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl" style={{ animationDelay: "320ms" }}>
                <div className="rounded-xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/45 font-semibold">Primeiro</p>
                  <p className="mt-1 text-sm font-semibold text-white">{isStudyNiche ? "Plano por peso das matérias" : "Entenda suas chances"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/45 font-semibold">Depois</p>
                  <p className="mt-1 text-sm font-semibold text-white">{isStudyNiche ? "Simulados no estilo da banca" : "Lacunas e palavras-chave"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/45 font-semibold">Por fim</p>
                  <p className="mt-1 text-sm font-semibold text-white">{isStudyNiche ? "Estimativa de nota de corte" : "Pergunta provável de entrevista"}</p>
                </div>
              </div>

              {/* Quick features */}
              <div className="animate-rise mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ animationDelay: "400ms" }}>
                {niche.quickFeatures.map((feature) => (
                  <div
                    key={feature}
                    className={`rounded-xl px-3 py-2.5 text-[11px] font-medium leading-snug transition-transform hover:-translate-y-0.5 ${theme.chip}`}
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div
              ref={heroVisualRef}
              className="hero-tilt animate-rise relative mx-auto w-full max-w-xs aspect-[4/5] mt-16 lg:mt-0 lg:-translate-y-6"
              style={{ animationDelay: "300ms" }}
            >
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
              <div className="animate-float-soft absolute -top-24 -right-4 max-w-[11rem] rounded-2xl bg-white/95 p-3 text-slate-900 shadow-xl backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Leitura rápida</p>
                <p className="mt-2 text-2xl font-extrabold leading-none">
                  <CountUp value={niche.samplePreview.score} />
                </p>
                <p className="mt-1 text-xs font-semibold leading-snug text-slate-700">{niche.samplePreview.scoreLabel}</p>
              </div>
              <div className="animate-float-soft-slow absolute left-4 right-4 bottom-4 rounded-2xl bg-slate-950/78 p-3 text-white shadow-xl backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">Pergunta que costuma aparecer</p>
                <p className="mt-1 text-sm leading-snug">“{niche.samplePreview.sampleQuestion}”</p>
              </div>
              <span className="animate-float-soft absolute bottom-5 right-5 h-11 w-11 rounded-full bg-white/95 shadow-md flex items-center justify-center text-xl">
                {niche.heroIcon}
              </span>
            </div>
          </section>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Attention strip */}
        <section className="reveal -mt-6 pb-4 md:pb-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {attentionCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white/96 dark:bg-neutral-950/96 p-5 shadow-lg shadow-slate-900/5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
              >
                <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${theme.accentText}`}>{card.label}</p>
                <p className="mt-2 text-base font-bold tracking-tight text-neutral-900 dark:text-white">{card.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Human reassurance */}
        <section className="reveal pb-6 md:pb-8">
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
        <section className="reveal py-10 md:py-14">
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
              {isStudyNiche ? "O que normalmente trava o seu estudo" : "O que normalmente trava a sua candidatura"}
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
        <section className="reveal pb-12">
          <div className="text-center max-w-2xl mx-auto">
            <p className={`text-xs font-semibold uppercase tracking-wide ${theme.accentText}`}>Exemplo demonstrativo</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
              Veja o que você descobre
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              Uma demonstração do formato da entrega. O seu resultado será calculado com os dados que você informar.
            </p>
          </div>

          <div className="mt-8 max-w-2xl mx-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-5">
              <div className={`relative h-16 w-16 md:h-20 md:w-20 shrink-0 ${theme.accentText}`}>
                <ScoreRing value={niche.samplePreview.score} />
                <div className="absolute inset-0 flex items-center justify-center text-lg md:text-xl font-extrabold text-neutral-900 dark:text-white">
                  <CountUp value={niche.samplePreview.score} />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  {isStudyNiche ? "Aproveitamento (exemplo)" : "Compatibilidade (exemplo)"}
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
        <section id="como-funciona" className="reveal py-12 border-t border-neutral-100 dark:border-neutral-900 scroll-mt-24">
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
              <div key={step.title} className="group text-center">
                <span className={`mx-auto h-10 w-10 rounded-xl text-white flex items-center justify-center font-bold shadow-md transition-transform group-hover:scale-110 ${theme.numberBg}`}>
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
        <section className="reveal py-10 border-t border-neutral-100 dark:border-neutral-900 text-center">
          <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${theme.accentText}`}>
            Comece de graça hoje mesmo
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2 max-w-md mx-auto text-sm">
            {isStudyNiche
              ? "Monte seu plano de estudo grátis e dê o primeiro passo rumo à aprovação."
              : "Compare seu currículo com uma vaga real e veja os ajustes prioritários antes de se candidatar."}
          </p>
          <Link
            href={primaryActionHref}
            className={`btn-shine mt-5 inline-flex items-center justify-center rounded-xl font-semibold px-6 py-3.5 text-sm transition-all shadow-md hover:-translate-y-0.5 ${theme.btnPrimary}`}
          >
            {primaryActionLabel}
          </Link>
          <p className="mt-3 text-[11px] text-neutral-400">
            Não precisa de cartão de crédito.
          </p>
          {!isStudyNiche && (
            <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
              Ainda não tem currículo nenhum?{" "}
              <Link href={freeResumeHref} className={`font-semibold hover:underline ${theme.accentText}`}>
                Monte um do zero, grátis
              </Link>
            </p>
          )}
        </section>

        {/* Pricing: grátis, pagamento único e assinatura mensal, valor específico do nicho */}
        <section id="planos" className="reveal py-12 border-t border-neutral-100 dark:border-neutral-900 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto">
            <p className={`text-xs font-semibold uppercase tracking-wide ${theme.accentText}`}>O que você ganha</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
              {niche.funnelHeadline ?? (isStudyNiche ? "Do plano inicial à preparação completa" : "Comece grátis e libere o Kit Candidatura se fizer sentido")}
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 items-stretch lg:grid-cols-3">
            {/* Tier 1: grátis */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-6 flex flex-col">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Para começar</p>
              <p className="text-lg font-bold mt-1">{niche.simpleTierLabel ?? "Análise Simples"}</p>
              <p className={`mt-2 text-3xl font-extrabold ${theme.accentText}`}>Grátis</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 flex-1">
                {niche.simpleTierDescription ?? "Uma leitura inicial, os pontos fortes e o que ainda precisa aparecer melhor no currículo."}
              </p>
              <Link
                href={primaryActionHref}
                className="mt-6 inline-flex items-center justify-center rounded-lg font-semibold px-5 py-3 text-sm border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                Começar grátis
              </Link>
            </div>

            {/* Tier 2: pagamento único */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-6 flex flex-col">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Pagamento único</p>
              <p className="text-lg font-bold mt-1">{niche.completeTierLabel ?? "Kit Candidatura"}</p>
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
            <div className={`animate-soft-glow relative rounded-2xl border-2 ${theme.cardBorder} bg-white dark:bg-neutral-950 p-6 flex flex-col shadow-lg lg:-my-2 lg:py-8`}>
              <span className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full text-white text-[10px] font-bold uppercase tracking-wide px-3 py-1 shadow-sm whitespace-nowrap ${theme.numberBg}`}>
                Melhor custo-benefício
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Assinatura mensal</p>
              <p className="text-lg font-bold mt-1">{offer.monthlyName}</p>
              <p className={`mt-2 text-3xl font-extrabold ${theme.accentText}`}>{`R$ ${(COMMERCIAL_PLANS.pro.priceCents / 100).toFixed(2).replace(".", ",")}/mês`}</p>
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
            <strong className="text-neutral-600 dark:text-neutral-300">Seu próximo passo:</strong> {offer.nextBestAction}
          </p>
        </section>

        {/* Ecossistema: deixa claro que a plataforma não termina no diagnóstico desta página */}
        <section className="reveal py-12 border-t border-neutral-100 dark:border-neutral-900">
          <div className="max-w-2xl">
            <p className={`text-xs font-semibold uppercase tracking-wide ${theme.accentText}`}>Depois deste diagnóstico</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">Isso é só o começo.</h2>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Este diagnóstico resolve o momento de agora. O CarreirasMatch continua com você depois dele.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ECOSYSTEM_CARDS.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-900 text-lg">
                  {card.icon}
                </span>
                <h3 className="mt-4 text-sm font-bold leading-snug text-neutral-900 dark:text-white">{card.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{card.description}</p>
                <span className={`mt-4 inline-flex items-center gap-1 text-xs font-bold transition-transform group-hover:translate-x-1 ${theme.accentText}`}>
                  Conhecer →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Learning resources */}
        {(!isDedicatedLanding || isStudyNiche) && <section id="recursos" className="reveal py-12 border-t border-neutral-100 dark:border-neutral-900 scroll-mt-24">
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
          <div key={activeResourceTab} className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            {resourceItems.map((item, index) => (
              <div
                key={item}
                className="animate-rise rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <p className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${theme.accentText}`}>
                  {RESOURCE_TABS[index].label}
                </p>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>}

        {/* Benefits */}
        <section className="reveal py-12 border-t border-neutral-100 dark:border-neutral-900">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center">
            {isStudyNiche ? "O que a sua preparação inclui" : "O que você recebe na análise"}
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

        {/* Ensino Médio & ENEM Banner para o Nicho Estudante */}
        {niche.slug === "estudante" && (
          <section className="reveal py-12 border-t border-neutral-100 dark:border-neutral-900">
            <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-200">
                  🎓 Módulo Completo do Estudante
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold">
                  Estude para o Ensino Médio e o ENEM com mais segurança
                </h3>
                <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                  Resumos de matérias escolares, corretor oficial de redação ENEM (nota 0-1000), calculadora de notas por peso, cronograma de estudos e tutor escolar 24h.
                </p>
              </div>
              <Link
                href="/ensino-medio"
                className="shrink-0 inline-flex items-center justify-center rounded-2xl bg-white hover:bg-blue-50 text-blue-950 font-bold px-6 py-3.5 text-sm transition-all shadow-md active:scale-95"
              >
                Acessar Suíte Ensino Médio →
              </Link>
            </div>
          </section>
        )}

        {/* First job tips teaser */}
        {isFirstJob && !isDedicatedLanding && (
          <section className="reveal py-12 border-t border-neutral-100 dark:border-neutral-900">
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

        {/* Outros momentos: links crawláveis (não abas client-side) entre as
            landing pages dedicadas, para reforçar que é a mesma plataforma
            cobrindo toda a carreira, não uma ferramenta isolada. */}
        {isDedicatedLanding && (
          <section className="reveal py-12 border-t border-neutral-100 dark:border-neutral-900">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-5">
              O CarreirasMatch também ajuda em outros momentos
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {NICHE_ORDER.filter((slug) => slug !== activeSlug).map((slug) => (
                <Link
                  key={slug}
                  href={NICHE_ROUTES[slug]}
                  className="rounded-full border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {NICHES[slug].tabLabel}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="reveal py-14 pb-24 sm:pb-14 border-t border-neutral-100 dark:border-neutral-900 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isStudyNiche ? "Pronto para começar a estudar com prioridade?" : "Pronto para ajustar seu currículo para uma vaga real?"}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2 max-w-md mx-auto text-sm">
            {isStudyNiche
              ? "Comece pelo fluxo grátis e, quando quiser, destrave o plano completo e os simulados."
              : "Comece pelo resultado gratuito e libere o Kit Candidatura somente se a análise fizer sentido para você."}
          </p>
          <Link
            href={primaryActionHref}
            className={`btn-shine mt-6 inline-flex items-center justify-center rounded-xl font-semibold px-6 py-3.5 text-sm transition-all shadow-md hover:-translate-y-0.5 ${theme.btnPrimary}`}
          >
            {primaryActionLabel}
          </Link>
        </section>
      </main>

      {/* Sticky mobile CTA */}
      <div className="public-mobile-cta sm:hidden fixed bottom-0 inset-x-0 z-20 border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur px-4 py-3">
        <Link
          href={primaryActionHref}
          className={`btn-shine flex items-center justify-center rounded-xl font-semibold px-6 py-3 text-sm transition-all shadow-md ${theme.btnPrimary}`}
        >
          {primaryActionLabel}
        </Link>
      </div>

      <SiteFooter />
    </div>
  );
}
