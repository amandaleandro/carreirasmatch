import type { CareerSegment } from "@/lib/career-segments";

export type CareerOffer = {
  segment: CareerSegment;
  title: string;
  shortTitle: string;
  firstAnalysisPrice: string;
  diagnosticPrice: string;
  monthlyPrice: string;
  monthlyName: string;
  /** Max analyses per 30-day billing period for subscribers; null means unlimited. */
  monthlyAnalysisLimit: number | null;
  launchOffer: string;
  includes: string[];
  monthlyFeatures: string[];
  retentionFeatures: string[];
  nextBestAction: string;
  curiosities: string[];
  freeCourses: string[];
  books: string[];
};

export const CAREER_OFFERS: CareerOffer[] = [
  {
    segment: "apprentice",
    title: "Jovem Aprendiz",
    shortTitle: "Jovem Aprendiz",
    firstAnalysisPrice: "R$4,90",
    diagnosticPrice: "R$4,90",
    monthlyPrice: "R$14,90/mês",
    monthlyName: "Primeira Oportunidade",
    monthlyAnalysisLimit: 50,
    launchOffer: "Diagnóstico Primeira Oportunidade",
    includes: [
      "Perfil inicial",
      "Currículo simples",
      "Vagas compatíveis",
      "Perguntas básicas de entrevista",
      "Plano de primeiro passo",
      "Checklist de documentos",
      "Cursos gratuitos recomendados",
      "Orientação sobre direitos e deveres",
    ],
    monthlyFeatures: [
      "Até 50 análises por mês",
      "Treino de entrevista simples",
      "Atualização do currículo inicial",
      "Lista de vagas compatíveis",
    ],
    retentionFeatures: [
      "Plano de 7 dias para primeiras candidaturas",
      "Lembrete de próximo passo",
      "Histórico de evolução do primeiro currículo",
    ],
    nextBestAction: "Montar o primeiro currículo e aplicar para vagas de aprendizagem compatíveis.",
    curiosities: [
      "Programas de aprendizagem valorizam postura, pontualidade e vontade de aprender mais do que experiência prévia.",
      "Atividades da escola, cursos livres e trabalhos em grupo podem virar exemplos para entrevista.",
      "Um currículo simples e bem organizado costuma funcionar melhor do que um modelo cheio de enfeites.",
    ],
    freeCourses: [
      "Fundação Bradesco: postura profissional, atendimento e pacote Office",
      "Sebrae: atendimento ao cliente e educação financeira",
      "Escola Virtual Gov: comunicação, cidadania e tecnologia básica",
    ],
    books: [
      "O Pequeno Príncipe - Antoine de Saint-Exupéry",
      "Quem Mexeu no Meu Queijo? - Spencer Johnson",
      "Comunicar para Liderar - Reinaldo Polito",
    ],
  },
  {
    segment: "first_job",
    title: "Primeiro Emprego",
    shortTitle: "Primeiro Emprego",
    firstAnalysisPrice: "R$4,90",
    diagnosticPrice: "R$4,90",
    monthlyPrice: "R$19,90/mês",
    monthlyName: "Primeira Oportunidade",
    monthlyAnalysisLimit: 60,
    launchOffer: "Diagnóstico Primeira Oportunidade",
    includes: [
      "Análise de currículo",
      "Vagas compatíveis",
      "Palavras-chave",
      "Mensagem para recrutador",
      "Plano semanal",
      "Checklist de candidatura",
      "Cargos de entrada compatíveis",
      "Roteiro de primeira entrevista",
    ],
    monthlyFeatures: [
      "Até 60 análises de vaga",
      "Currículo otimizado por tipo de vaga",
      "Mensagens para recrutadores",
      "Plano semanal de candidaturas",
    ],
    retentionFeatures: [
      "Alerta de pontos fracos recorrentes",
      "Lista de vagas em que vale aplicar mesmo sem todos os requisitos",
      "Histórico de candidaturas e retorno",
    ],
    nextBestAction: "Escolher cargos de entrada realistas e ajustar o currículo para cada vaga.",
    curiosities: [
      "Muitas vagas de entrada aceitam experiência informal, projetos pessoais e cursos como sinais de potencial.",
      "A primeira triagem costuma buscar clareza: cargo desejado, disponibilidade, cidade e habilidades básicas.",
      "Enviar menos candidaturas, mas com currículo ajustado, tende a gerar mais retorno do que disparar tudo igual.",
    ],
    freeCourses: [
      "Fundação Bradesco: Excel, Word, atendimento e fundamentos de administração",
      "Sebrae: vendas, empreendedorismo e atendimento",
      "Google Ateliê Digital: marketing digital e carreira",
    ],
    books: [
      "Mindset - Carol S. Dweck",
      "Como Fazer Amigos e Influenciar Pessoas - Dale Carnegie",
      "Os 7 Hábitos das Pessoas Altamente Eficazes - Stephen Covey",
    ],
  },
  {
    segment: "internship",
    title: "Estágio",
    shortTitle: "Estágio",
    firstAnalysisPrice: "R$4,90",
    diagnosticPrice: "R$4,90",
    monthlyPrice: "R$24,90/mês",
    monthlyName: "Estágio Pro",
    monthlyAnalysisLimit: 80,
    launchOffer: "Diagnóstico Primeira Oportunidade",
    includes: [
      "Análise currículo x vaga",
      "Score de aderência",
      "Projetos acadêmicos como experiência",
      "Plano de estudo",
      "Simulado de entrevista",
      "Sugestão de portfólio",
      "Perguntas técnicas básicas",
      "Acompanhamento de candidaturas",
    ],
    monthlyFeatures: [
      "Até 80 análises de vaga",
      "Currículo por vaga",
      "Plano de estudos por requisito",
      "Simulado de entrevista técnica básica",
    ],
    retentionFeatures: [
      "Transformador de matérias e projetos em experiência",
      "Tracker de candidaturas de estágio",
      "Sugestão de projetos para destacar no portfólio",
    ],
    nextBestAction: "Conectar projetos acadêmicos com os requisitos da vaga e criar um plano de estudo curto.",
    curiosities: [
      "Recrutadores de estágio gostam de ver projetos, monitorias, eventos, voluntariado e ligas acadêmicas.",
      "Uma boa descrição de projeto pode compensar a falta de experiência formal.",
      "O período do curso ajuda a definir se a vaga combina com aprendizado, efetivação ou exploração de área.",
    ],
    freeCourses: [
      "Microsoft Learn: fundamentos de tecnologia e produtividade",
      "Coursera/edX com opção gratuita para assistir aulas",
      "Fundação Bradesco: lógica, Excel, programação e administração",
    ],
    books: [
      "Mostre seu Trabalho - Austin Kleon",
      "Roube como um Artista - Austin Kleon",
      "Aprendendo a Aprender - Barbara Oakley e Terrence Sejnowski",
    ],
  },
  {
    segment: "student",
    title: "Faculdade ou Técnico",
    shortTitle: "Faculdade/Técnico",
    firstAnalysisPrice: "R$4,90",
    diagnosticPrice: "R$4,90",
    monthlyPrice: "R$24,90/mês",
    monthlyName: "Direção Acadêmica",
    monthlyAnalysisLimit: 60,
    launchOffer: "Diagnóstico Direção Profissional",
    includes: [
      "Teste de interesses",
      "Mapa de áreas",
      "Cursos recomendados",
      "Comparação faculdade/técnico",
      "Plano de decisão",
      "Trilhas profissionais",
      "Comparação de tempo e investimento",
      "Próximos passos com ou sem faculdade",
    ],
    monthlyFeatures: [
      "Testes de afinidade",
      "Comparação de áreas",
      "Trilhas de estudo",
      "Plano de decisão acompanhado",
    ],
    retentionFeatures: [
      "Simulador de caminhos profissionais",
      "Comparação de salário, rotina e empregabilidade",
      "Plano de decisão em etapas para estudante e família",
    ],
    nextBestAction: "Comparar caminhos possíveis e escolher uma trilha de estudo inicial sem travar na decisão.",
    curiosities: [
      "Curso técnico costuma ser mais rápido e prático; faculdade tende a abrir portas mais amplas no longo prazo.",
      "A melhor escolha depende de rotina, dinheiro, urgência de trabalhar e tipo de carreira desejada.",
      "Testar uma área com curso gratuito antes de pagar uma formação reduz muito o risco de arrependimento.",
    ],
    freeCourses: [
      "Sebrae: trilhas de empreendedorismo, carreira e gestão",
      "Fundação Bradesco: administração, tecnologia e desenvolvimento pessoal",
      "Khan Academy: matemática, ciências e preparação acadêmica",
    ],
    books: [
      "Designing Your Life - Bill Burnett e Dave Evans",
      "Trabalhe 4 Horas por Semana - Timothy Ferriss",
      "O Poder do Hábito - Charles Duhigg",
    ],
  },
  {
    segment: "career_change",
    title: "Transição de Carreira",
    shortTitle: "Transição",
    firstAnalysisPrice: "R$4,90",
    diagnosticPrice: "R$4,90",
    monthlyPrice: "R$49,90/mês",
    monthlyName: "Transição",
    monthlyAnalysisLimit: 150,
    launchOffer: "Diagnóstico Transição",
    includes: [
      "Habilidades transferíveis",
      "Vagas ponte",
      "Currículo de transição",
      "Narrativa de transição",
      "Plano de estudo",
      "Resposta sobre mudança de área",
      "Análise de risco da transição",
      "Plano 30/60/90 dias",
    ],
    monthlyFeatures: [
      "Até 150 análises por mês",
      "Trilha de transição",
      "Currículo para nova área",
      "Simulador de entrevista",
    ],
    retentionFeatures: [
      "Mapa de cargos ponte",
      "Plano de transição rápida, gradual ou paralela",
      "Revisão da narrativa de LinkedIn e entrevista",
    ],
    nextBestAction: "Escolher um cargo ponte e transformar experiência anterior em argumentos para a nova área.",
    curiosities: [
      "Transição de carreira raramente é pulo direto; cargos ponte aumentam a chance de entrada.",
      "Experiências anteriores viram vantagem quando traduzidas para problemas da nova área.",
      "Uma narrativa clara reduz a percepção de risco que recrutadores sentem ao contratar alguém em transição.",
    ],
    freeCourses: [
      "Google Ateliê Digital: carreira, dados e marketing",
      "Microsoft Learn: tecnologia, dados e IA",
      "Escola Virtual Gov: gestão, projetos e análise de dados",
    ],
    books: [
      "Designing Your Life - Bill Burnett e Dave Evans",
      "So Good They Can't Ignore You - Cal Newport",
      "A Startup de Você - Reid Hoffman e Ben Casnocha",
    ],
  },
  {
    segment: "career_pro",
    title: "Recolocação / Carreira Pro",
    shortTitle: "Carreira Pro",
    firstAnalysisPrice: "R$4,90",
    diagnosticPrice: "R$4,90",
    monthlyPrice: "R$59,90/mês fundador",
    monthlyName: "Carreira Pro",
    monthlyAnalysisLimit: null,
    launchOffer: "Diagnóstico Carreira Pro",
    includes: [
      "Score avançado",
      "Currículo otimizado por vaga",
      "Análise de LinkedIn",
      "Análise de feedbacks",
      "Plano semanal e relatório PDF",
      "Priorização de vagas",
      "Simulador por senioridade",
      "Histórico de evolução",
    ],
    monthlyFeatures: [
      "Análises de vaga ilimitadas",
      "Currículo otimizado por vaga",
      "Análise de LinkedIn e feedbacks",
      "Relatório final em PDF",
    ],
    retentionFeatures: [
      "Comparador de vagas",
      "Plano semanal de candidaturas qualificadas",
      "Histórico de evolução por score e por gap",
    ],
    nextBestAction: "Priorizar vagas com maior chance real e ajustar currículo, LinkedIn e narrativa por senioridade.",
    curiosities: [
      "Para vagas melhores, senioridade pesa tanto quanto palavras-chave: impacto, autonomia e resultados precisam aparecer.",
      "LinkedIn desalinhado com currículo pode reduzir confiança mesmo quando o perfil é bom.",
      "Feedbacks repetidos indicam padrões: senioridade, comunicação, técnica, pretensão ou posicionamento.",
    ],
    freeCourses: [
      "LinkedIn Learning gratuito via períodos promocionais ou bibliotecas parceiras",
      "Microsoft Learn: IA, dados, cloud e produtividade",
      "Escola Virtual Gov: liderança, gestão de projetos e transformação digital",
    ],
    books: [
      "Os Primeiros 90 Dias - Michael Watkins",
      "Essencialismo - Greg McKeown",
      "O Gestor Eficaz - Peter Drucker",
    ],
  },
];

export const CAREER_OFFER_BY_SEGMENT = Object.fromEntries(
  CAREER_OFFERS.map((offer) => [offer.segment, offer])
) as Record<CareerSegment, CareerOffer>;
