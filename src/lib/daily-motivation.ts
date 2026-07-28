export type EmploymentStatusKey =
  | "unemployed_active"
  | "employed_open"
  | "career_transition"
  | "student"
  | "high_school_student"
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
  student: {
    label: "Estudante Universitário / Técnico",
    icon: "📚",
    description: "Cursando ensino superior ou técnico e se preparando para o mercado",
    badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  },
  high_school_student: {
    label: "Estudante do Ensino Médio",
    icon: "🎒",
    description: "Cursando o ensino médio, focado em ENEM, vestibulares ou Jovem Aprendiz",
    badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
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

export interface DailyMotivationProfile {
  careerSegment?: string | null;
  area?: string | null;
  currentArea?: string | null;
  studyCourse?: string | null;
}

const MOTIVATION_CATALOG: Record<EmploymentStatusKey, DailyMotivation[]> = {
  unemployed_active: [
    {
      id: 1,
      quote: "O não você já tem. O sim está no próximo currículo ajustado estrategicamente.",
      author: "Sabedoria de Carreira",
      tip: "Hoje, personalize 2 candidaturas focando nas competências chave exigidas na descrição da vaga.",
      memeTitle: "A saga do processo seletivo",
      memeSetup: "Entrevistador: 'Procuramos um profissional dinâmico, multitarefa e resiliente.'",
      memePunchline: "Candidato: 'Perfeito! Consigo responder e-mails, tomar café e manter a calma enquanto espero o retorno há 3 semanas.' 😂",
      memeTag: "Expectativa vs Realidade",
    },
    {
      id: 2,
      quote: "A persistência é o caminho do êxito. Cada entrevista é um aprendizado rumo à oportunidade certa.",
      author: "Charles Chaplin",
      tip: "Atualize seu resumo profissional e envie 1 mensagem amigável para uma conexão do seu setor.",
      memeTitle: "Notificação do celular",
      memeSetup: "Celular toca: 🔔 'Você recebeu uma nova mensagem!'",
      memePunchline: "Esperança: 'É o RH me chamando pra entrevista!' | Realidade: 'Sua fatura do cartão foi gerada.' 🥲",
      memeTag: "Vida de Candidato",
    },
    {
      id: 3,
      quote: "Não pare até se orgulhar do resultado dos seus esforços.",
      author: "Foco & Determinação",
      tip: "Revise a formatação do seu currículo para garantir leitura clara em qualquer dispositivo.",
      memeTitle: "Formulário da Vaga vs Currículo",
      memeSetup: "Site de Vagas: 'Por favor, anexe seu currículo em PDF.'",
      memePunchline: "Logo em seguida: 'Agora preencha manualmente cada uma das últimas 10 experiências desde a infância.' 🤡",
      memeTag: "Rotina de Inscrição",
    },
  ],
  employed_open: [
    {
      id: 1,
      quote: "A melhor hora para procurar uma nova oportunidade é enquanto você já está produzindo e ativo.",
      author: "Estratégia Profissional",
      tip: "Mantenha seus contatos profissionais aquecidos e seu perfil atualizado com suas conquistas recentes.",
      memeTitle: "Reunião que poderia ser e-mail",
      memeSetup: "Chefe: 'Vamos fazer uma reunião rápida de alinhamento de 5 minutos.'",
      memePunchline: "2 horas depois: Discutindo a cor do clipe de papel enquanto penso na minha carreira. ☕🫣",
      memeTag: "Cotidiano de Trabalho",
    },
    {
      id: 2,
      quote: "Seu valor não diminui pela incapacidade de alguém de enxergar o seu potencial no trabalho atual.",
      author: "Foco no Crescimento",
      tip: "Mapeie 3 empresas referências na sua área e acompanhe as vagas que elas abrem frequentemente.",
      memeTitle: "Roupa da Entrevista Secreta",
      memeSetup: "Colega de trabalho: 'Nossa, por que você veio tão arrumado(a) hoje?'",
      memePunchline: "Eu: 'Ah, sabe como é... resolvi dar um upgrade no meu visual na terça-feira!' 🤫💼",
      memeTag: "Modo Furtivo",
    },
  ],
  career_transition: [
    {
      id: 1,
      quote: "Nunca é tarde demais para ser aquilo que você poderia ter sido.",
      author: "George Eliot",
      tip: "Destaque suas competências comportamentais e bagagem prática que enriquecem o novo setor.",
      memeTitle: "Mudando de Área",
      memeSetup: "Eu ontem: 'Domino tudo da minha área antiga com o pé nas costas!'",
      memePunchline: "Eu hoje aprendendo os novos termos: 'Achei que sabia português até ver os jargões desse setor!' 🧠💥",
      memeTag: "Nível Aprendiz",
    },
    {
      id: 2,
      quote: "Coragem é a decisão de que o seu crescimento é mais importante que o receio do novo.",
      author: "Desenvolvimento de Carreira",
      tip: "Conecte-se com pessoas que já trabalham na sua área de destino para pegar dicas reais.",
      memeTitle: "Transição Sem Filtro",
      memeSetup: "Amigos: 'Que incrível sua coragem de mudar de profissão!'",
      memePunchline: "Eu estudando a nova área de madrugada com 3 xícaras de café: 'Corajoso(a) ou louco(a)?' ☕😵‍💫",
      memeTag: "Vida Real",
    },
  ],
  student: [
    {
      id: 1,
      quote: "A educação é o investimento mais seguro para transformar a sua trajetória.",
      author: "Nelson Mandela",
      tip: "Organize seus trabalhos acadêmicos e atividades complementares em um portfólio prático.",
      memeTitle: "Semana de Provas vs Vagas",
      memeSetup: "Professor: 'O trabalho em grupo vale 50% da nota e é para amanhã.'",
      memePunchline: "Eu conciliando aula, prova, trabalho em grupo e mandando currículo: 'Tranquilidade pura!' ☕📚🔥",
      memeTag: "Rotina de Estudante",
    },
    {
      id: 2,
      quote: "Investir em conhecimento gera os frutos mais valiosos para o seu futuro.",
      author: "Benjamin Franklin",
      tip: "Adicione certificações, oficinas e cursos livres no seu resumo profissional.",
      memeTitle: "Vaga de Estágio Exigente",
      memeSetup: "Anúncio da Vaga: 'Procuramos estagiário(a) com 5 anos de experiência e domínio pleno do setor.'",
      memePunchline: "Eu na faculdade: 'Se eu tivesse 5 anos de experiência não era estágio, era a diretoria!' 😅🎓",
      memeTag: "Vida de Universitário",
    },
  ],
  high_school_student: [
    {
      id: 1,
      quote: "O futuro pertence àqueles que se preparam hoje para as oportunidades de amanhã.",
      author: "Foco nos Estudos",
      tip: "Cadastre-se no programa Jovem Aprendiz da sua cidade e mantenha seu boletim escolar atualizado.",
      memeTitle: "ENEM vs Primeiro Emprego",
      memeSetup: "Mãe: 'Já estudou pro ENEM hoje ou tá procurando vaga de Jovem Aprendiz?'",
      memePunchline: "Eu com 15 abas da Wikipedia e 10 candidaturas abertas: 'Estou fazendo os dois ao mesmo tempo!' 🎒🎒✨",
      memeTag: "Ensino Médio",
    },
    {
      id: 2,
      quote: "Sua dedicação diária constrói o caminho para a faculdade e para o mercado de trabalho.",
      author: "Início de Carreira",
      tip: "Destaque suas habilidades em tecnologia, trabalho em equipe e projetos escolares no seu 1º currículo.",
      memeTitle: "Experiência de Ensino Médio",
      memeSetup: "Currículo: 'Campo de Experiência Profissional (Obrigatório)'",
      memePunchline: "Eu: 'Fui líder de grupo na feira de ciências e ajudei na quermesse da escola... conta como gestão de projetos?' 😂💼",
      memeTag: "Primeiros Passos",
    },
  ],
  first_job: [
    {
      id: 1,
      quote: "Todo profissional renomado começou com a primeira oportunidade e muita vontade de aprender.",
      author: "Desenvolvimento Pessoal",
      tip: "Destaque experiências de liderança na escola/faculdade, trabalhos voluntários ou projetos de equipe.",
      memeTitle: "O dilema do 1º emprego",
      memeSetup: "Vaga Inicial: 'Pré-requisito: Experiência anterior demonstrada.'",
      memePunchline: "Eu querendo o 1º emprego pra ter experiência, mas precisando de experiência pra ter o 1º emprego: 🔄🤯",
      memeTag: "Primeiros Passos",
    },
    {
      id: 2,
      quote: "Ninguém nasce sabendo. Todo mundo que você admira também mandou o primeiro currículo com o coração na mão.",
      author: "Início de Carreira",
      tip: "Liste 3 projetos pessoais, acadêmicos ou voluntários que mostrem na prática o que você sabe fazer.",
      memeTitle: "Entrevista de estágio",
      memeSetup: "Recrutador: 'Fale sobre um desafio profissional que você superou.'",
      memePunchline: "Eu, 19 anos: 'Bem, uma vez o Wi-Fi caiu durante minha apresentação de TCC e eu improvisei.' 😅",
      memeTag: "Primeiro Emprego",
    },
    {
      id: 3,
      quote: "A primeira oportunidade não define seu teto, só abre a porta. O resto você constrói.",
      author: "Foco no Futuro",
      tip: "Peça uma indicação ou recomendação para um professor, chefe de estágio ou líder de projeto.",
      memeTitle: "Salário de estagiário vs Expectativa",
      memeSetup: "Eu antes de assinar: 'Vou economizar, viajar, comprar um carro...'",
      memePunchline: "Eu depois do primeiro contracheque: 'Ok, vou economizar o vale-transporte.' 🚌💸",
      memeTag: "Realidade do Estágio",
    },
  ],
  freelance: [
    {
      id: 1,
      quote: "Construir seu próprio caminho exige autonomia, mas traz o poder de moldar seus próprios resultados.",
      author: "Mentalidade Autônoma",
      tip: "Apresente suas soluções focando no problema real do cliente e mostre depoimentos de quem já atendeu.",
      memeTitle: "O 'ajustezinho' rápido",
      memeSetup: "Cliente: 'É só um ajustezinho de 5 minutos, rapidinho você faz!'",
      memePunchline: "O ajustezinho: Refazer o serviço inteiro do zero em um final de semana. 📉🫣",
      memeTag: "Vida de Autônomo",
    },
    {
      id: 2,
      quote: "Quem trabalha por conta própria não tem chefe, tem vários — e todos acham que o prazo é 'pra ontem'.",
      author: "Humor Autônomo",
      tip: "Formalize um orçamento por escrito antes de começar qualquer projeto novo, mesmo com clientes antigos.",
      memeTitle: "Orçamento vs Escopo real",
      memeSetup: "Cliente: 'Fechado! Só isso mesmo que combinamos.'",
      memePunchline: "Uma semana depois: 'Ah, e será que dá pra incluir só mais uma telinha?' 🙃",
      memeTag: "Escopo Fantasma",
    },
    {
      id: 3,
      quote: "Cada 'não' de um cliente te aproxima do cliente certo, que valoriza o que você entrega.",
      author: "Resiliência Autônoma",
      tip: "Divulgue um resultado recente do seu trabalho nas redes — prova social vende mais que autoelogio.",
      memeTitle: "Fatura enviada",
      memeSetup: "Eu enviando a fatura: 'Só um lembrete gentil sobre o pagamento combinado 😊'",
      memePunchline: "Eu 5 dias depois, no terceiro 'oi, tudo bem?': 'Só um lembrete GENTIL.' 🫠",
      memeTag: "Vida de Autônomo",
    },
  ],
};

function personalizeMotivation(motivation: DailyMotivation, profile?: DailyMotivationProfile): DailyMotivation {
  const area = profile?.area?.trim() || profile?.studyCourse?.trim();
  if (!area) return motivation;

  const normalized = area.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const currentArea = profile?.currentArea?.trim();
  const isTransition = profile?.careerSegment === "career_change" && currentArea;
  const areaLabel = isTransition ? `${currentArea} → ${area}` : area;

  let tip = `Separe 15 minutos hoje para praticar uma habilidade de ${area} e registre o que aprendeu no seu portfólio.`;
  let memeTitle = `Quando você escolhe ${area}`;
  let memeSetup = "Pessoa: 'Vou só pesquisar um pouco sobre a área.'";
  let memePunchline = `Duas horas depois: 14 abas abertas, um curso salvo e vontade de começar um projeto de ${area}.`;
  let memeTag = "Vida na Área";

  if (/(tecnologia|program|dados|software|dev|ti)/.test(normalized)) {
    tip = `Escolha um pequeno problema de ${area} e transforme-o em um projeto prático. Portfólio vence promessa.`;
    memeTitle = "Só mais um tutorial";
    memeSetup = "Eu: 'Depois deste tutorial eu começo o projeto.'";
    memePunchline = "O tutorial: parte 47 de 48. O projeto: ainda na pasta Downloads.";
    memeTag = "Rotina Tech";
  } else if (/(direito|jurid|administr|negoc|financ|contab)/.test(normalized)) {
    tip = `Leia um caso real de ${area}, resuma o problema em cinco linhas e explique qual seria sua decisão.`;
    memeTitle = "O documento era simples";
    memeSetup = "Alguém: 'É só dar uma olhadinha rápida neste documento.'";
    memePunchline = "O documento: 37 páginas, 12 anexos e uma reunião marcada para ontem.";
    memeTag = "Vida Corporativa";
  } else if (/(saude|medicina|enferm|psico|fisi|odonto)/.test(normalized)) {
    tip = `Revise um conceito essencial de ${area} e transforme-o em uma explicação simples, como se estivesse ensinando alguém.`;
    memeTitle = "Plantão do conhecimento";
    memeSetup = "Eu: 'Hoje vou estudar só um tópico.'";
    memePunchline = "O tópico: tem 18 capítulos, 4 protocolos e uma prova surpresa.";
    memeTag = "Rotina da Saúde";
  } else if (/(marketing|comunic|design|criativ|audiovisual)/.test(normalized)) {
    tip = `Analise uma campanha ou peça de ${area} que você viu hoje e anote o que funcionou — e o que você faria diferente.`;
    memeTitle = "Briefing do cliente";
    memeSetup = "Cliente: 'Quero algo simples, mas impactante, moderno e diferente.'";
    memePunchline = "Eu: 'Perfeito. Só preciso de mais 12 referências e três cafés.'";
    memeTag = "Briefing Real";
  }

  return {
    ...motivation,
    tip: isTransition
      ? `Na transição ${areaLabel}, escolha uma habilidade transferível da sua experiência anterior e mostre como ela gera valor na nova área.`
      : tip,
    memeTitle: isTransition ? `Transição: ${areaLabel}` : memeTitle,
    memeSetup,
    memePunchline,
    memeTag: isTransition ? "Mudança de Carreira" : memeTag,
  };
}

export function getDailyMotivation(status?: string | null, profile?: DailyMotivationProfile): DailyMotivation {
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
  return personalizeMotivation(catalog[index], profile);
}
