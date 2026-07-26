import { normalizeGamePhase, type GamePhase } from "@/lib/game-progression";

export type CareerGameProfile = {
  careerSegment?: string | null;
  professionalArea?: string | null;
  currentProfessionalArea?: string | null;
  targetProfessionalArea?: string | null;
  studyCourse?: string | null;
};

export type CareerQuestion = {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
};

export type CareerMemoryPair = { term: string; definition: string };

export type CareerGamePack = {
  area: string;
  context: string;
  questions: CareerQuestion[];
  pairs: CareerMemoryPair[];
  words: { word: string; hint: string }[];
};

const AREA_PACKS: Record<string, { terms: CareerMemoryPair[]; fact?: CareerQuestion }> = {
  tecnologia: {
    terms: [
      ["API", "Interface que permite sistemas conversarem"],
      ["Git", "Controle de versões do código"],
      ["Deploy", "Publicação de uma aplicação em um ambiente"],
      ["Banco de dados", "Estrutura que armazena informações organizadas"],
      ["Teste automatizado", "Verificação repetível do comportamento do software"],
      ["Nuvem", "Infraestrutura de computação acessada pela internet"],
    ].map(([term, definition]) => ({ term, definition })),
    fact: {
      q: "Qual prática ajuda a reduzir regressões em um projeto de Tecnologia?",
      options: ["Testes automatizados", "Apagar o histórico do Git", "Evitar documentação", "Publicar sem revisar"],
      correct: 0,
      explanation: "Testes automatizados verificam comportamentos importantes antes da publicação.",
    },
  },
  saude: {
    terms: [
      ["Anamnese", "Coleta estruturada do histórico da pessoa atendida"],
      ["Triagem", "Classificação inicial de prioridade e risco"],
      ["Biossegurança", "Práticas para reduzir riscos de contaminação"],
      ["Prontuário", "Registro organizado do atendimento"],
      ["Protocolo", "Orientação padronizada para uma conduta"],
      ["Humanização", "Cuidado que considera a pessoa além do procedimento"],
    ].map(([term, definition]) => ({ term, definition })),
    fact: {
      q: "Em uma carreira da Saúde, qual atitude demonstra prática profissional responsável?",
      options: ["Seguir protocolos e registrar o atendimento", "Ignorar sinais de risco", "Compartilhar dados do paciente", "Improvisar sempre"],
      correct: 0,
      explanation: "Protocolos, registro e respeito à privacidade sustentam um atendimento seguro.",
    },
  },
  direito: {
    terms: [
      ["Jurisprudência", "Conjunto de decisões que orienta interpretações"],
      ["Petição", "Manifestação formal apresentada em um processo"],
      ["Contrato", "Acordo que estabelece direitos e obrigações"],
      ["Prazo", "Período para realizar um ato processual ou contratual"],
      ["Compliance", "Práticas para atuar conforme regras e políticas"],
      ["Conciliação", "Busca de acordo para resolver um conflito"],
    ].map(([term, definition]) => ({ term, definition })),
    fact: {
      q: "Qual cuidado é essencial em uma rotina profissional do Direito?",
      options: ["Controlar prazos e conferir documentos", "Confiar apenas na memória", "Ignorar a fonte da informação", "Prometer resultado garantido"],
      correct: 0,
      explanation: "Controle de prazos, documentos e fontes reduz riscos na atuação jurídica.",
    },
  },
  marketing: {
    terms: [
      ["Persona", "Representação do público que uma marca quer alcançar"],
      ["Funil", "Etapas da jornada até uma conversão"],
      ["CTA", "Chamada para a ação desejada"],
      ["Conversão", "Realização da ação definida como objetivo"],
      ["Métrica", "Medida usada para acompanhar um resultado"],
      ["Copy", "Texto criado para comunicar e estimular uma ação"],
    ].map(([term, definition]) => ({ term, definition })),
    fact: {
      q: "Antes de criar uma campanha de Marketing, o que deve ser definido?",
      options: ["Público e objetivo mensurável", "Apenas a cor do anúncio", "O texto sem conhecer o público", "O resultado antes do teste"],
      correct: 0,
      explanation: "Público e objetivo orientam a mensagem, o canal e a avaliação da campanha.",
    },
  },
  design: {
    terms: [
      ["Wireframe", "Esboço da estrutura de uma interface"],
      ["Protótipo", "Representação interativa de uma solução"],
      ["Usabilidade", "Facilidade para realizar uma tarefa"],
      ["Hierarquia visual", "Organização que orienta o olhar e a leitura"],
      ["Persona", "Perfil de referência para decisões de design"],
      ["Feedback", "Retorno usado para melhorar uma solução"],
    ].map(([term, definition]) => ({ term, definition })),
    fact: {
      q: "O que uma boa decisão de Design deve considerar primeiro?",
      options: ["A necessidade da pessoa usuária", "Somente a tendência visual", "A quantidade de efeitos", "O gosto pessoal do designer"],
      correct: 0,
      explanation: "Design resolve problemas para pessoas e precisa considerar contexto e usabilidade.",
    },
  },
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function areaKey(profile: CareerGameProfile) {
  const value = profile.targetProfessionalArea || profile.professionalArea || profile.studyCourse || "sua área";
  const normalized = normalize(value);
  if (/(tecnolog|program|software|dados|ti|comput)/.test(normalized)) return "tecnologia";
  if (/(medicin|saude|enferm|odonto|fisi|psico|farmac)/.test(normalized)) return "saude";
  if (/(direito|jurid|advoc)/.test(normalized)) return "direito";
  if (/(marketing|publicidade|comunic|vendas)/.test(normalized)) return "marketing";
  if (/(design|ux|ui|criativ)/.test(normalized)) return "design";
  return value.trim() || "sua área";
}

function genericPairs(area: string, course?: string | null): CareerMemoryPair[] {
  return [
    { term: area, definition: `Área profissional escolhida pelo usuário${course ? `, relacionada ao curso de ${course}` : ""}` },
    { term: "Habilidade técnica", definition: `Conhecimento prático necessário para atuar em ${area}` },
    { term: "Portfólio", definition: `Evidência concreta de projetos ou resultados em ${area}` },
    { term: "Networking", definition: `Construção de relações profissionais relevantes para ${area}` },
    { term: "Feedback", definition: "Retorno usado para melhorar uma entrega" },
    { term: "Próximo passo", definition: `Ação pequena e prática para avançar em ${area}` },
  ];
}

export function buildCareerGamePack(profile: CareerGameProfile, phaseValue?: string | null): CareerGamePack {
  const phase: GamePhase = normalizeGamePhase(phaseValue);
  const area = areaKey(profile);
  const knownPack = AREA_PACKS[area];
  const pairs = (knownPack?.terms ?? genericPairs(area, profile.studyCourse)).slice(0, phase === 1 ? 4 : phase === 2 ? 5 : 6);
  const transition = profile.currentProfessionalArea && profile.targetProfessionalArea
    ? `Você está fazendo uma transição de ${profile.currentProfessionalArea} para ${profile.targetProfessionalArea}.`
    : profile.studyCourse
    ? `Você está se preparando a partir do curso de ${profile.studyCourse}.`
    : `Seu foco profissional é ${area}.`;

  const questions: CareerQuestion[] = [
    knownPack?.fact ?? {
      q: `Qual atitude mais ajuda quem quer construir carreira em ${area}?`,
      options: [`Praticar e registrar evidências em ${area}`, "Esperar estar perfeito para começar", "Evitar feedback", "Fazer tudo sem prioridade"],
      correct: 0,
      explanation: `Prática consistente, evidências e feedback ajudam a transformar interesse em competência em ${area}.`,
    },
    {
      q: `Como demonstrar preparo para uma oportunidade em ${area}?`,
      options: ["Apresentar um projeto ou situação resolvida", "Listar somente desejos", "Esconder o que ainda está aprendendo", "Enviar a mesma mensagem para todas as vagas"],
      correct: 0,
      explanation: "Projetos, exemplos e resultados tornam a experiência mais concreta para quem avalia.",
    },
    {
      q: transition,
      options: ["Usar a experiência anterior como ponte e aprender o que falta", "Apagar toda a experiência anterior", "Mudar sem estudar a nova área", "Esperar uma oportunidade sem praticar"],
      correct: 0,
      explanation: "Uma transição fica mais forte quando conecta habilidades transferíveis com prática na nova área.",
    },
  ];

  const words = pairs
    .filter(({ term }) => normalize(term).replace(/[^a-z]/g, "").length >= 4)
    .map(({ term, definition }) => ({
      word: normalize(term).replace(/[^a-z]/g, "").toUpperCase(),
      hint: definition,
    }));

  return { area, context: transition, questions: questions.slice(0, phase === 1 ? 1 : phase === 2 ? 2 : 3), pairs, words };
}
