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
    monthlyPrice: "R$14,90/mes",
    monthlyName: "Primeira Oportunidade",
    monthlyAnalysisLimit: 50,
    launchOffer: "Diagnostico Primeira Oportunidade",
    includes: [
      "Perfil inicial",
      "Curriculo simples",
      "Vagas compativeis",
      "Perguntas basicas de entrevista",
      "Plano de primeiro passo",
      "Checklist de documentos",
      "Cursos gratuitos recomendados",
      "Orientacao sobre direitos e deveres",
    ],
    monthlyFeatures: [
      "Ate 50 analises por mes",
      "Treino de entrevista simples",
      "Atualizacao do curriculo inicial",
      "Lista de vagas compativeis",
    ],
    retentionFeatures: [
      "Plano de 7 dias para primeiras candidaturas",
      "Lembrete de proximo passo",
      "Historico de evolucao do primeiro curriculo",
    ],
    nextBestAction: "Montar o primeiro curriculo e aplicar para vagas de aprendizagem compativeis.",
    curiosities: [
      "Programas de aprendizagem valorizam postura, pontualidade e vontade de aprender mais do que experiencia previa.",
      "Atividades da escola, cursos livres e trabalhos em grupo podem virar exemplos para entrevista.",
      "Um curriculo simples e bem organizado costuma funcionar melhor do que um modelo cheio de enfeites.",
    ],
    freeCourses: [
      "Fundacao Bradesco: postura profissional, atendimento e pacote Office",
      "Sebrae: atendimento ao cliente e educacao financeira",
      "Escola Virtual Gov: comunicacao, cidadania e tecnologia basica",
    ],
    books: [
      "O Pequeno Principe - Antoine de Saint-Exupery",
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
    monthlyPrice: "R$19,90/mes",
    monthlyName: "Primeira Oportunidade",
    monthlyAnalysisLimit: 60,
    launchOffer: "Diagnostico Primeira Oportunidade",
    includes: [
      "Analise de curriculo",
      "Vagas compativeis",
      "Palavras-chave",
      "Mensagem para recrutador",
      "Plano semanal",
      "Checklist de candidatura",
      "Cargos de entrada compativeis",
      "Roteiro de primeira entrevista",
    ],
    monthlyFeatures: [
      "Ate 60 analises de vaga",
      "Curriculo otimizado por tipo de vaga",
      "Mensagens para recrutadores",
      "Plano semanal de candidaturas",
    ],
    retentionFeatures: [
      "Alerta de pontos fracos recorrentes",
      "Lista de vagas em que vale aplicar mesmo sem todos os requisitos",
      "Historico de candidaturas e retorno",
    ],
    nextBestAction: "Escolher cargos de entrada realistas e ajustar o curriculo para cada vaga.",
    curiosities: [
      "Muitas vagas de entrada aceitam experiencia informal, projetos pessoais e cursos como sinais de potencial.",
      "A primeira triagem costuma buscar clareza: cargo desejado, disponibilidade, cidade e habilidades basicas.",
      "Enviar menos candidaturas, mas com curriculo ajustado, tende a gerar mais retorno do que disparar tudo igual.",
    ],
    freeCourses: [
      "Fundacao Bradesco: Excel, Word, atendimento e fundamentos de administracao",
      "Sebrae: vendas, empreendedorismo e atendimento",
      "Google Atelie Digital: marketing digital e carreira",
    ],
    books: [
      "Mindset - Carol S. Dweck",
      "Como Fazer Amigos e Influenciar Pessoas - Dale Carnegie",
      "Os 7 Habitos das Pessoas Altamente Eficazes - Stephen Covey",
    ],
  },
  {
    segment: "internship",
    title: "Estagio",
    shortTitle: "Estagio",
    firstAnalysisPrice: "R$4,90",
    diagnosticPrice: "R$4,90",
    monthlyPrice: "R$24,90/mes",
    monthlyName: "Estagio Pro",
    monthlyAnalysisLimit: 80,
    launchOffer: "Diagnostico Primeira Oportunidade",
    includes: [
      "Analise curriculo x vaga",
      "Score de aderencia",
      "Projetos academicos como experiencia",
      "Plano de estudo",
      "Simulado de entrevista",
      "Sugestao de portfolio",
      "Perguntas tecnicas basicas",
      "Acompanhamento de candidaturas",
    ],
    monthlyFeatures: [
      "Ate 80 analises de vaga",
      "Curriculo por vaga",
      "Plano de estudos por requisito",
      "Simulado de entrevista tecnica basica",
    ],
    retentionFeatures: [
      "Transformador de materias e projetos em experiencia",
      "Tracker de candidaturas de estagio",
      "Sugestao de projetos para destacar no portfolio",
    ],
    nextBestAction: "Conectar projetos academicos com os requisitos da vaga e criar um plano de estudo curto.",
    curiosities: [
      "Recrutadores de estagio gostam de ver projetos, monitorias, eventos, voluntariado e ligas academicas.",
      "Uma boa descricao de projeto pode compensar a falta de experiencia formal.",
      "O periodo do curso ajuda a definir se a vaga combina com aprendizado, efetivacao ou exploracao de area.",
    ],
    freeCourses: [
      "Microsoft Learn: fundamentos de tecnologia e produtividade",
      "Coursera/edX com opcao gratuita para assistir aulas",
      "Fundacao Bradesco: logica, Excel, programacao e administracao",
    ],
    books: [
      "Mostre seu Trabalho - Austin Kleon",
      "Roube como um Artista - Austin Kleon",
      "Aprendendo a Aprender - Barbara Oakley e Terrence Sejnowski",
    ],
  },
  {
    segment: "student",
    title: "Faculdade ou Tecnico",
    shortTitle: "Faculdade/Tecnico",
    firstAnalysisPrice: "R$4,90",
    diagnosticPrice: "R$4,90",
    monthlyPrice: "R$24,90/mes",
    monthlyName: "Direcao Academica",
    monthlyAnalysisLimit: 60,
    launchOffer: "Diagnostico Direcao Profissional",
    includes: [
      "Teste de interesses",
      "Mapa de areas",
      "Cursos recomendados",
      "Comparacao faculdade/tecnico",
      "Plano de decisao",
      "Trilhas profissionais",
      "Comparacao de tempo e investimento",
      "Proximos passos com ou sem faculdade",
    ],
    monthlyFeatures: [
      "Testes de afinidade",
      "Comparacao de areas",
      "Trilhas de estudo",
      "Plano de decisao acompanhado",
    ],
    retentionFeatures: [
      "Simulador de caminhos profissionais",
      "Comparacao de salario, rotina e empregabilidade",
      "Plano de decisao em etapas para estudante e familia",
    ],
    nextBestAction: "Comparar caminhos possiveis e escolher uma trilha de estudo inicial sem travar na decisao.",
    curiosities: [
      "Curso tecnico costuma ser mais rapido e pratico; faculdade tende a abrir portas mais amplas no longo prazo.",
      "A melhor escolha depende de rotina, dinheiro, urgencia de trabalhar e tipo de carreira desejada.",
      "Testar uma area com curso gratuito antes de pagar uma formacao reduz muito o risco de arrependimento.",
    ],
    freeCourses: [
      "Sebrae: trilhas de empreendedorismo, carreira e gestao",
      "Fundacao Bradesco: administracao, tecnologia e desenvolvimento pessoal",
      "Khan Academy: matematica, ciencias e preparacao academica",
    ],
    books: [
      "Designing Your Life - Bill Burnett e Dave Evans",
      "Trabalhe 4 Horas por Semana - Timothy Ferriss",
      "O Poder do Habito - Charles Duhigg",
    ],
  },
  {
    segment: "career_change",
    title: "Transicao de Carreira",
    shortTitle: "Transicao",
    firstAnalysisPrice: "R$4,90",
    diagnosticPrice: "R$4,90",
    monthlyPrice: "R$49,90/mes",
    monthlyName: "Transicao",
    monthlyAnalysisLimit: 150,
    launchOffer: "Diagnostico Transicao",
    includes: [
      "Habilidades transferiveis",
      "Vagas ponte",
      "Curriculo de transicao",
      "Narrativa de transicao",
      "Plano de estudo",
      "Resposta sobre mudanca de area",
      "Analise de risco da transicao",
      "Plano 30/60/90 dias",
    ],
    monthlyFeatures: [
      "Ate 150 analises por mes",
      "Trilha de transicao",
      "Curriculo para nova area",
      "Simulador de entrevista",
    ],
    retentionFeatures: [
      "Mapa de cargos ponte",
      "Plano de transicao rapida, gradual ou paralela",
      "Revisao da narrativa de LinkedIn e entrevista",
    ],
    nextBestAction: "Escolher um cargo ponte e transformar experiencia anterior em argumentos para a nova area.",
    curiosities: [
      "Transicao de carreira raramente e pulo direto; cargos ponte aumentam a chance de entrada.",
      "Experiencias anteriores viram vantagem quando traduzidas para problemas da nova area.",
      "Uma narrativa clara reduz a percepcao de risco que recrutadores sentem ao contratar alguem em transicao.",
    ],
    freeCourses: [
      "Google Atelie Digital: carreira, dados e marketing",
      "Microsoft Learn: tecnologia, dados e IA",
      "Escola Virtual Gov: gestao, projetos e analise de dados",
    ],
    books: [
      "Designing Your Life - Bill Burnett e Dave Evans",
      "So Good They Can't Ignore You - Cal Newport",
      "A Startup de Você - Reid Hoffman e Ben Casnocha",
    ],
  },
  {
    segment: "career_pro",
    title: "Recolocacao / Carreira Pro",
    shortTitle: "Carreira Pro",
    firstAnalysisPrice: "R$4,90",
    diagnosticPrice: "R$4,90",
    monthlyPrice: "R$59,90/mes fundador",
    monthlyName: "Carreira Pro",
    monthlyAnalysisLimit: null,
    launchOffer: "Diagnostico Carreira Pro",
    includes: [
      "Score avancado",
      "Curriculo otimizado por vaga",
      "Analise de LinkedIn",
      "Analise de feedbacks",
      "Plano semanal e relatorio PDF",
      "Priorizacao de vagas",
      "Simulador por senioridade",
      "Historico de evolucao",
    ],
    monthlyFeatures: [
      "Analises de vaga ilimitadas",
      "Curriculo otimizado por vaga",
      "Analise de LinkedIn e feedbacks",
      "Relatorio final em PDF",
    ],
    retentionFeatures: [
      "Comparador de vagas",
      "Plano semanal de candidaturas qualificadas",
      "Historico de evolucao por score e por gap",
    ],
    nextBestAction: "Priorizar vagas com maior chance real e ajustar curriculo, LinkedIn e narrativa por senioridade.",
    curiosities: [
      "Para vagas melhores, senioridade pesa tanto quanto palavras-chave: impacto, autonomia e resultados precisam aparecer.",
      "LinkedIn desalinhado com curriculo pode reduzir confianca mesmo quando o perfil e bom.",
      "Feedbacks repetidos indicam padroes: senioridade, comunicacao, tecnica, pretensao ou posicionamento.",
    ],
    freeCourses: [
      "LinkedIn Learning gratuito via periodos promocionais ou bibliotecas parceiras",
      "Microsoft Learn: IA, dados, cloud e produtividade",
      "Escola Virtual Gov: lideranca, gestao de projetos e transformacao digital",
    ],
    books: [
      "As Primeiras 90 Dias - Michael Watkins",
      "Essencialismo - Greg McKeown",
      "O Gestor Eficaz - Peter Drucker",
    ],
  },
];

export const CAREER_OFFER_BY_SEGMENT = Object.fromEntries(
  CAREER_OFFERS.map((offer) => [offer.segment, offer])
) as Record<CareerSegment, CareerOffer>;
