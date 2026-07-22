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
    firstAnalysisPrice: "R$9,90",
    diagnosticPrice: "R$12,90",
    monthlyPrice: "R$24,90/mês",
    monthlyName: "Primeira Oportunidade",
    monthlyAnalysisLimit: null,
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
      "Análises de vaga ilimitadas com IA",
      "Kits de Candidatura ilimitados",
      "Treino de entrevista simulado",
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
    firstAnalysisPrice: "R$9,90",
    diagnosticPrice: "R$12,90",
    monthlyPrice: "R$24,90/mês",
    monthlyName: "Primeira Oportunidade",
    monthlyAnalysisLimit: null,
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
      "Análises de vaga ilimitadas com IA",
      "Kits de Candidatura ilimitados",
      "Mensagens prontas para recrutadores",
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
    firstAnalysisPrice: "R$9,90",
    diagnosticPrice: "R$12,90",
    monthlyPrice: "R$24,90/mês",
    monthlyName: "Estágio Pro",
    monthlyAnalysisLimit: null,
    launchOffer: "Diagnóstico Primeira Oportunidade",
    includes: [
      "Análise currículo x vaga",
      "Score de aderência",
      "Projetos acadêmicos como experiência",
      "Plano de estudo",
      "Simulado de entrevista",
      "Sugestão de portfólio",
      "Perguntas básicas da área",
      "Acompanhamento de candidaturas",
    ],
    monthlyFeatures: [
      "Análises de vaga ilimitadas com IA",
      "Kits de Candidatura ilimitados",
      "Plano de estudos por requisito",
      "Simulado de entrevista interativo da área",
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
    firstAnalysisPrice: "R$9,90",
    diagnosticPrice: "R$12,90",
    monthlyPrice: "R$24,90/mês",
    monthlyName: "Direção Acadêmica",
    monthlyAnalysisLimit: null,
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
      "Testes de afinidade ilimitados",
      "Kits de Candidatura ilimitados",
      "Trilhas de estudo personalizadas",
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
    firstAnalysisPrice: "R$9,90",
    diagnosticPrice: "R$12,90",
    monthlyPrice: "R$24,90/mês",
    monthlyName: "Transição",
    monthlyAnalysisLimit: null,
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
      "Análises de vaga ilimitadas com IA",
      "Kits de Candidatura ilimitados",
      "Currículo para nova área",
      "Simulador de entrevista interativo",
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
    firstAnalysisPrice: "R$9,90",
    diagnosticPrice: "R$12,90",
    monthlyPrice: "R$24,90/mês",
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
      "Análises de vaga ilimitadas com IA",
      "Kits de Candidatura ilimitados",
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
  {
    segment: "concurseiro",
    title: "Concurso Público",
    shortTitle: "Concurseiro",
    firstAnalysisPrice: "R$9,90",
    diagnosticPrice: "R$12,90",
    monthlyPrice: "R$24,90/mês",
    monthlyName: "Aprovação Concurso",
    monthlyAnalysisLimit: null,
    launchOffer: "Diagnóstico de Preparação",
    includes: [
      "Plano de estudo por edital",
      "Ciclo de estudos semanal",
      "Simulados por disciplina e banca",
      "Estimativa de nota de corte",
      "Revisão por lei seca e jurisprudência",
      "Cronograma até a data da prova",
      "Priorização por peso das matérias",
      "Acompanhamento de desempenho",
    ],
    monthlyFeatures: [
      "Plano de estudo por edital ilimitado",
      "Simulados ilimitados no mês",
      "Estimativa de nota de corte por cargo",
      "Revisão espaçada por disciplina",
    ],
    retentionFeatures: [
      "Reajuste do cronograma conforme você avança",
      "Ranking de disciplinas por acerto e peso",
      "Histórico de desempenho por simulado",
    ],
    nextBestAction: "Colar o edital, gerar o ciclo de estudos e começar pelas disciplinas de maior peso.",
    curiosities: [
      "Bancas têm estilo próprio: CESPE/Cebraspe cobra certo/errado com pegadinhas, FGV e FCC vão de múltipla escolha detalhista.",
      "Estudar por peso e incidência de assunto rende mais que seguir o edital na ordem.",
      "Revisão espaçada e resolução de questões pesam mais na reta final do que ler teoria nova.",
    ],
    freeCourses: [
      "Estratégia/Gran com aulas gratuitas e questões comentadas no YouTube",
      "Escola Virtual Gov: direito, administração pública e português",
      "Portais de bancas: editais, provas anteriores e gabaritos oficiais",
    ],
    books: [
      "Como Passar em Concursos Públicos - William Douglas",
      "Gestão da Rotina de Estudos - método do ciclo de estudos",
      "Vade Mecum atualizado da sua área",
    ],
  },
  {
    segment: "oab",
    title: "Exame da OAB",
    shortTitle: "OAB",
    firstAnalysisPrice: "R$9,90",
    diagnosticPrice: "R$12,90",
    monthlyPrice: "R$24,90/mês",
    monthlyName: "Aprovação OAB",
    monthlyAnalysisLimit: null,
    launchOffer: "Diagnóstico de Preparação OAB",
    includes: [
      "Plano de estudo para 1ª e 2ª fase",
      "Simulado 1ª fase estilo FGV (80 questões)",
      "Corretor de peça prático-profissional",
      "Correção de questões discursivas",
      "Revisão por lei seca e súmulas",
      "Cronograma até a data do exame",
      "Priorização por incidência FGV",
      "Acompanhamento de desempenho",
    ],
    monthlyFeatures: [
      "Simulados 1ª fase ilimitados no mês",
      "Correção de peças e discursivas da 2ª fase",
      "Plano de estudo por fase",
      "Revisão espaçada por disciplina",
    ],
    retentionFeatures: [
      "Reajuste do cronograma conforme você avança",
      "Feedback por critério da FGV (estrutura, fundamentação, técnica)",
      "Histórico de desempenho por simulado e por peça",
    ],
    nextBestAction: "Fazer um simulado da 1ª fase para medir o ponto de partida e montar o plano até o exame.",
    curiosities: [
      "A FGV é previsível na incidência: certos temas de Ética, Constitucional e Civil caem quase todo exame.",
      "Na 2ª fase, a peça vale muito e depende de estrutura correta e fundamentação legal, não só de saber o conteúdo.",
      "Resolver provas anteriores da FGV é o melhor termômetro, o estilo das questões se repete.",
    ],
    freeCourses: [
      "CERS, Gran e Damásio com aulões gratuitos de OAB no YouTube",
      "Provas e gabaritos oficiais da FGV (1ª e 2ª fase)",
      "Súmulas e informativos comentados de tribunais superiores",
    ],
    books: [
      "Vade Mecum OAB e Legislação FGV",
      "Manuais por disciplina (Civil, Penal, Constitucional, Ética)",
      "Coletâneas de peças práticas comentadas da 2ª fase",
    ],
  },
];

export const CAREER_OFFER_BY_SEGMENT = Object.fromEntries(
  CAREER_OFFERS.map((offer) => [offer.segment, offer])
) as Record<CareerSegment, CareerOffer>;
