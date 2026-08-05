import { getVocationArea } from "@/lib/vocation-areas";

/**
 * Segundo pilar de conteúdo do blog: temas transversais de carreira, que não
 * pertencem a uma área vocacional específica (currículo, entrevista, ensino
 * médio etc.) mas concentram a maior parte da busca genérica e apontam direto
 * para as ferramentas pagas do produto. Roda em rodízio com VOCATION_AREAS
 * em blog-scheduler.ts — ver getAllBlogTopics().
 */
export type BlogTopicConfig = {
  slug: string;
  label: string;
  description: string;
  /** Ângulos/subtemas sugeridos ao gerador, no lugar das subáreas de uma profissão. */
  subareas: string[];
  careerNotes?: string;
  /** Ferramenta do produto mais relevante para o CTA ao fim do post. */
  toolPath: string;
  toolLabel: string;
};

export const TRANSVERSAL_TOPICS: BlogTopicConfig[] = [
  {
    slug: "curriculo",
    label: "Currículo",
    description: "Como montar, revisar e adaptar um currículo que passa por triagem automática (ATS) e convence recrutador humano.",
    subareas: [
      "Currículo sem experiência",
      "Adaptar currículo para cada vaga",
      "Erros que reprovam no ATS",
      "Como descrever experiências fracas ou gaps",
      "Currículo em vídeo/LinkedIn vs. currículo tradicional",
      "Palavras-chave e como a triagem automática lê o currículo",
    ],
    toolPath: "/tools/resume-from-scratch",
    toolLabel: "Montar currículo do zero",
  },
  {
    slug: "entrevista",
    label: "Entrevista de Emprego",
    description: "Como se preparar, responder perguntas difíceis e conduzir entrevistas de emprego em qualquer etapa da carreira.",
    subareas: [
      "Perguntas comportamentais e método STAR",
      "Como responder 'fale sobre você'",
      "Entrevista técnica vs. entrevista com RH",
      "Como negociar salário na entrevista",
      "Erros que eliminam candidatos na entrevista",
      "Entrevista em inglês ou remota por vídeo",
    ],
    toolPath: "/tools/interview-simulator",
    toolLabel: "Simular uma entrevista",
  },
  {
    slug: "primeiro-emprego",
    label: "Primeiro Emprego",
    description: "Como entrar no mercado de trabalho sem experiência prévia, da candidatura aos primeiros meses no cargo.",
    subareas: [
      "Como se candidatar sem experiência",
      "Estágio vs. jovem aprendiz vs. CLT direto",
      "O que esperar dos primeiros 90 dias",
      "Como pedir ajuda sem parecer despreparado",
      "Construir rede de contatos começando do zero",
      "Erros comuns de quem está começando",
    ],
    toolPath: "/tools/first-job-guide",
    toolLabel: "Guia de primeiro emprego",
  },
  {
    slug: "ensino-medio",
    label: "Ensino Médio, ENEM e Vestibular",
    description: "Como se organizar nos estudos, escolher curso e se preparar para ENEM e vestibular no ensino médio.",
    subareas: [
      "Como montar cronograma de estudos",
      "Redação nota 1000: estrutura e erros comuns",
      "Como escolher curso e faculdade",
      "ENEM vs. vestibular tradicional",
      "Técnicas de memorização e revisão",
      "Como lidar com ansiedade antes da prova",
    ],
    toolPath: "/ensino-medio",
    toolLabel: "Ferramentas de ensino médio",
  },
  {
    slug: "transicao-carreira",
    label: "Transição de Carreira",
    description: "Como migrar de área profissional com segurança, aproveitando experiência anterior em vez de começar do zero.",
    subareas: [
      "Como identificar habilidades transferíveis",
      "Currículo para quem está trocando de área",
      "Transição sem perder renda",
      "Quando vale fazer uma pós ou certificação",
      "Como explicar a mudança de área na entrevista",
      "Erros comuns de quem troca de carreira tarde",
    ],
    toolPath: "/tools/career-change-guide",
    toolLabel: "Guia de transição de carreira",
  },
  {
    slug: "recolocacao",
    label: "Recolocação Profissional",
    description: "Como voltar ao mercado após demissão, licença ou pausa na carreira, com estratégia em vez de ansiedade.",
    subareas: [
      "Como lidar com a demissão emocionalmente",
      "Como explicar um período fora do mercado",
      "Recolocação após 40/50 anos",
      "Reorganizar as finanças durante a busca",
      "Como usar o seguro-desemprego a seu favor",
      "Erros de quem procura vaga com pressa",
    ],
    toolPath: "/tools/reemployment-guide",
    toolLabel: "Guia de recolocação",
  },
  {
    slug: "concurso-publico",
    label: "Concurso Público",
    description: "Como se preparar para concursos públicos, da escolha do cargo à reta final antes da prova.",
    subareas: [
      "Como escolher qual concurso prestar",
      "Como montar plano de estudo por edital",
      "Erros que derrubam nota na prova objetiva",
      "Concurso vs. CLT: o que considerar",
      "Como estudar com pouco tempo disponível",
      "Reta final: revisão e simulados",
    ],
    toolPath: "/tools/concurso/plano-de-estudo",
    toolLabel: "Montar plano de estudo",
  },
  {
    slug: "trabalho-freelancer",
    label: "Trabalho Freelancer",
    description: "Como começar, precificar e crescer como freelancer ou autônomo em qualquer área de atuação.",
    subareas: [
      "Como precificar o primeiro projeto",
      "Como conseguir os primeiros clientes",
      "Contrato e cobrança: se proteger sem CLT",
      "Freelancer vs. CLT: prós e contras reais",
      "Como lidar com cliente que não paga",
      "Organizar rotina sem chefe cobrando prazo",
    ],
    toolPath: "/freelancers",
    toolLabel: "Explorar projetos freelancer",
  },
];

export function getTransversalTopic(slug: string): BlogTopicConfig | undefined {
  return TRANSVERSAL_TOPICS.find((t) => t.slug === slug);
}

/** Formato comum usado pela página pilar do blog, seja área vocacional ou tema transversal. */
export type ContentPillar = {
  slug: string;
  label: string;
  description: string;
  careerNotes?: string;
  cta: { path: string; label: string };
};

export function getContentPillar(slug: string): ContentPillar | undefined {
  const topic = getTransversalTopic(slug);
  if (topic) {
    return {
      slug: topic.slug,
      label: topic.label,
      description: topic.description,
      cta: { path: topic.toolPath, label: topic.toolLabel },
    };
  }

  const area = getVocationArea(slug);
  if (!area) return undefined;

  return {
    slug: area.slug,
    label: area.label,
    description: area.description,
    careerNotes: area.careerNotes,
    cta: { path: "/tools/vocation-test", label: "Fazer o teste vocacional" },
  };
}
