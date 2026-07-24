export type EmploymentStatusKey =
  | "unemployed_active"
  | "employed_open"
  | "career_transition"
  | "first_job"
  | "freelance";

export const EMPLOYMENT_STATUS_CONFIG: Record<
  EmploymentStatusKey,
  { label: string; icon: string; description: string; badgeColor: string }
> = {
  unemployed_active: {
    label: "Buscando Recolocação",
    icon: "🎯",
    description: "Desempregado(a) em busca ativa por novos desafios",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  employed_open: {
    label: "Aberto(a) a Propostas",
    icon: "💼",
    description: "Empregado(a), mas atento(a) a oportunidades melhores",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  career_transition: {
    label: "Transição de Carreira",
    icon: "🔄",
    description: "Mudando de área ou pivotando competências",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  first_job: {
    label: "Primeiro Emprego / Estágio",
    icon: "🎓",
    description: "Iniciando a jornada profissional ou acadêmica",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  freelance: {
    label: "Autônomo / Freelancer",
    icon: "🚀",
    description: "Prestando serviços de forma independente",
    badgeColor: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  },
};

export interface DailyMotivation {
  id: number;
  quote: string;
  author: string;
  tip: string;
  memeTitle: string;
  memeSetup: string;
  memePunchline: string;
  memeTag: string;
}

const MOTIVATION_CATALOG: Record<EmploymentStatusKey, DailyMotivation[]> = {
  unemployed_active: [
    {
      id: 1,
      quote: "O não você já tem. O sim está no próximo currículo ajustado estrategicamente com IA.",
      author: "Sabedoria Tech",
      tip: "Hoje, personalize 2 candidaturas focando nas palavras-chave exatas da descrição da vaga.",
      memeTitle: "O RH e as 500 candidaturas",
      memeSetup: "Recrutador: 'Buscamos alguém com 10 anos de experiência em uma tecnologia que foi lançada ano passado.'",
      memePunchline: "Candidato: 'Eu criei essa tecnologia há 2 anos e mesmo assim meu currículo caiu no filtro automático! 😂'",
      memeTag: "Expectativa vs Realidade",
    },
    {
      id: 2,
      quote: "A persistência é o caminho do êxito. Cada entrevista é um treino pago para a sua vaga perfeita.",
      author: "Charles Chaplin",
      tip: "Envie uma mensagem amigável no LinkedIn para 1 recrutador da empresa onde deseja trabalhar.",
      memeTitle: "O status no LinkedIn",
      memeSetup: "Status: 'Em transição de carreira e aberto a desafios!'",
      memePunchline: "Caixa de entrada: 0 mensagens do RH. 5 mensagens de venda de curso de milhas. 🥲",
      memeTag: "Vida de Candidato",
    },
    {
      id: 3,
      quote: "Não pare até se orgulhar do seu painel de processos concluídos com sucesso.",
      author: "Motivação DEV",
      tip: "Atualize o resumo do seu perfil destacando seus projetos práticos recentes.",
      memeTitle: "A saga da pretensão salarial",
      memeSetup: "Formulário da Vaga: 'Qual sua pretensão salarial?' (Campo numérico obrigatório)",
      memePunchline: "Eu digitando: R$ 5.000 ou 1 coxinha e passagem de ônibus se a vaga for legal. 🤡",
      memeTag: "Humor Corporativo",
    },
  ],
  employed_open: [
    {
      id: 1,
      quote: "A melhor hora para procurar um emprego excelente é quando você já tem um bom.",
      author: "Estratégia Profissional",
      tip: "Mantenha seu LinkedIn sempre no modo discreto 'Open to Work' visível apenas para recrutadores.",
      memeTitle: "Entrevista em horário comercial",
      memeSetup: "Chefe: 'Por que você tá de terno na reunião de alinhamento de terça de manhã?'",
      memePunchline: "Eu: 'Ah, é que hoje à tarde vou ao médico... de médico bem chique!' 🤫💼",
      memeTag: "Modo Furtivo",
    },
    {
      id: 2,
      quote: "Seu valor não diminui pela incapacidade de alguém de enxergar o seu potencial no trabalho atual.",
      author: "Foco na Carreira",
      tip: "Mapeie 3 empresas dos seus sonhos e ative os alertas de novas vagas abertas para elas.",
      memeTitle: "A reunião que podia ser um e-mail",
      memeSetup: "Reunião emergencial de 2 horas sobre a cor do botão da intranet.",
      memePunchline: "Eu por fora: 😃👍 | Eu por dentro atualizando o currículo no Antigravity: 🚀💻",
      memeTag: "Cotidiano de TI",
    },
  ],
  career_transition: [
    {
      id: 1,
      quote: "Nunca é tarde demais para ser aquilo que você poderia ter sido.",
      author: "George Eliot",
      tip: "Destaque suas soft skills e conquistas anteriores que se aplicam diretamente ao novo cargo.",
      memeTitle: "Aprendendo Framework Novo",
      memeSetup: "Eu ontem: 'Já sei tudo da área antiga!'",
      memePunchline: "Eu hoje lendo a documentação nova: 'O que significa este erro em vermelho?' 🧠💥",
      memeTag: "Nível Aprendiz",
    },
    {
      id: 2,
      quote: "Coragem não é a ausência de medo, mas a decisão de que algo é mais importante que o medo.",
      author: "Ambrose Redmoon",
      tip: "Crie um pequeno projeto autoral mostrando como sua bagagem antiga ajuda no novo setor.",
      memeTitle: "Transição Sem Filtro",
      memeSetup: "Amigos: 'Nossa, você é muito corajoso de mudar de área!'",
      memePunchline: "Eu tentando entender 45 abas abertas no navegador: ☕😵‍сль",
      memeTag: "Vida Real",
    },
  ],
  first_job: [
    {
      id: 1,
      quote: "Todo especialista um dia foi um iniciante que não desistiu no primeiro obstáculo.",
      author: "Provérbio da Carreira",
      tip: "Inclua trabalhos voluntários, projetos de faculdade ou exercícios práticos no seu portfólio.",
      memeTitle: "O paradoxo da experiência",
      memeSetup: "Vaga de Estágio / Júnior: 'Necessário 3 anos de experiência comercial prévia.'",
      memePunchline: "Eu com 19 anos: 'Será que conta a experiência de ter sobrevivido ao Ensino Médio?' 😂🎓",
      memeTag: "Primeiros Passos",
    },
  ],
  freelance: [
    {
      id: 1,
      quote: "Construir seu próprio caminho exige coragem, mas a liberdade de escolha vale cada esforço.",
      author: "Visão Empreendedora",
      tip: "Revise sua proposta de valor e envie um orçamento acompanhado de depoimentos de clientes satisfeitos.",
      memeTitle: "Ajuste no escopo",
      memeSetup: "Cliente: 'É só um ajustezinho rápido de 5 minutos, nada de mais!'",
      memePunchline: "O 'ajustezinho': Reescrever o sistema do zero em 2 dias. 📉🫣",
      memeTag: "Vida de Freelancer",
    },
  ],
};

export function getDailyMotivation(status?: string | null): DailyMotivation {
  const validStatus: EmploymentStatusKey =
    status && status in MOTIVATION_CATALOG
      ? (status as EmploymentStatusKey)
      : "unemployed_active";

  const catalog = MOTIVATION_CATALOG[validStatus] || MOTIVATION_CATALOG.unemployed_active;
  
  // Seed determinístico por dia do ano (ex: 2026-07-24)
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );

  const index = dayOfYear % catalog.length;
  return catalog[index];
}
