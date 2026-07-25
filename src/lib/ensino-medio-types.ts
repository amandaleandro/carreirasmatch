export type YearId = "all" | "1o-ano" | "2o-ano" | "3o-ano";

export interface HighSchoolYearInfo {
  id: YearId;
  label: string;
  badge: string;
  description: string;
}

export const HIGH_SCHOOL_YEARS: HighSchoolYearInfo[] = [
  { id: "all", label: "Todos os Anos", badge: "Ensino Médio Completo", description: "Visão geral de toda a grade curricular" },
  { id: "1o-ano", label: "1º Ano", badge: "Fundamentos & Base", description: "Introdução e conceitos básicos de cada disciplina" },
  { id: "2o-ano", label: "2º Ano", badge: "Aprofundamento", description: "Desenvolvimento avançado e aplicações intermediárias" },
  { id: "3o-ano", label: "3º Ano & ENEM", badge: "Revisão & Vestibulares", description: "Foco total no ENEM, vestibulares e consolidação" },
];

export interface SubjectMetadata {
  slug: string;
  name: string;
  category: "Exatas" | "Humanas" | "Biológicas" | "Linguagens";
  iconName: string;
  description: string;
  topics: string[];
  topicsByYear: {
    "1o-ano": string[];
    "2o-ano": string[];
    "3o-ano": string[];
  };
  collegeCourses: string[];
  technicalCourses: string[];
}

export const HIGH_SCHOOL_SUBJECTS: SubjectMetadata[] = [
  {
    slug: "matematica",
    name: "Matemática",
    category: "Exatas",
    iconName: "Calculator",
    description: "Geometria, Álgebra, Funções, Estatística e Matemática Financeira.",
    topics: ["Geometria Plana e Espacial", "Funções de 1º e 2º Grau", "Estatística e Probabilidade", "Porcentagem e Juros", "Trigonometria"],
    topicsByYear: {
      "1o-ano": [
        "Conjuntos e Razão & Proporção",
        "Funções de 1º Grau (Afim) e 2º Grau (Quadrática)",
        "Função Exponencial e Logaritmos",
        "Geometria Plana: Áreas e Perímetros"
      ],
      "2o-ano": [
        "Trigonometria no Triângulo Retângulo e Círculo Trigonométrico",
        "Geometria Espacial: Prismas, Pirâmides, Cilindros e Esferas",
        "Matrizes, Determinantes e Sistemas Lineares",
        "Sequências, Progressão Aritmética (PA) e Geométrica (PG)"
      ],
      "3o-ano": [
        "Estatística: Média, Moda, Mediana e Desvio Padrão",
        "Análise Combinatória e Probabilidade",
        "Geometria Analítica: Ponto, Reta e Circunferência",
        "Matemática Financeira: Juros Simples e Compostos no ENEM"
      ]
    },
    collegeCourses: ["Engenharias", "Ciência da Computação", "Matemática", "Economia", "Estatística", "Arquitetura"],
    technicalCourses: ["Técnico em Eletrotécnica", "Técnico em Desenvolvimento de Sistemas", "Técnico em Edificações", "Técnico em Finanças"]
  },
  {
    slug: "portugues",
    name: "Português e Literatura",
    category: "Linguagens",
    iconName: "BookOpen",
    description: "Gramática, Interpretação de Texto, Redação ENEM e Literatura Brasileira.",
    topics: ["Interpretação de Texto", "Redação Nota 1000", "Sintaxe e Pontuação", "Escolas Literárias (Modernismo, Romantismo)", "Figuras de Linguagem"],
    topicsByYear: {
      "1o-ano": [
        "Fonética, Ortografia e Classes de Palavras",
        "Elementos da Comunicação e Funções da Linguagem",
        "Trovadorismo, Humanismo e Quinhentismo",
        "Barroco e Arcadismo na Literatura"
      ],
      "2o-ano": [
        "Sintaxe da Oração e do Período Composto",
        "Concordância, Regência e Crase",
        "Romantismo: Poesia e Prosa",
        "Realismo, Naturalismo e Parnasianismo"
      ],
      "3o-ano": [
        "Simbolismo e Pré-Modernismo",
        "Modernismo Brasileiro (1ª, 2ª e 3ª Gerações)",
        "Técnicas de Redação ENEM (Dissertativa-Argumentativa)",
        "Interpretação de Texto, Coesão e Coerência para Vestibulares"
      ]
    },
    collegeCourses: ["Letras", "Jornalismo", "Direito", "Publicidade e Propaganda", "Pedagogia", "Cinema"],
    technicalCourses: ["Técnico em Redes Sociais/Marketing Digital", "Técnico em Produção de Conteúdo", "Técnico em Vendas/Comunicação"]
  },
  {
    slug: "biologia",
    name: "Biologia",
    category: "Biológicas",
    iconName: "Dna",
    description: "Ecologia, Genética, Citologia, Fisiologia Humana e Evolução.",
    topics: ["Ecologia e Meio Ambiente", "Genética e DNA", "Citologia e Membrana Celular", "Fisiologia Humana", "Biotecnologia"],
    topicsByYear: {
      "1o-ano": [
        "Bioquímica Celular: Água, Sais, Carboidratos e Proteínas",
        "Citologia: Organelas, Membrana Celular e Transporte",
        "Divisão Celular: Mitose e Meiose",
        "Níveis de Organização dos Seres Vivos e Taxonomia"
      ],
      "2o-ano": [
        "Reino Vegetal (Botânica): Briófitas a Angiospermas",
        "Reino Animal (Zoologia): Invertebrados e Vertebrados",
        "Fisiologia Humana: Digestão, Respiração e Circulação",
        "Sistemas Nervoso, Endócrino e Imunológico"
      ],
      "3o-ano": [
        "Genética Mendeliana e Grupos Sanguíneos (ABO / Rh)",
        "DNA, RNA e Engenharia Genética / Biotecnologia",
        "Evolução e Teorias Evolutivas (Lamarckismo vs Darwinismo)",
        "Ecologia: Cadeias Alimentares, Biomas e Impactos Ambientais no ENEM"
      ]
    },
    collegeCourses: ["Medicina", "Enfermagem", "Medicina Veterinária", "Biomedicina", "Odontologia", "Fisioterapia", "Nutrição", "Agronomia"],
    technicalCourses: ["Técnico em Enfermagem", "Técnico em Análises Clínicas", "Técnico em Meio Ambiente", "Técnico em Farmácia"]
  },
  {
    slug: "quimica",
    name: "Química",
    category: "Exatas",
    iconName: "FlaskConical",
    description: "Química Geral, Físico-Química, Química Orgânica e Tabela Periódica.",
    topics: ["Tabela Periódica e Ligações", "Estequiometria", "Química Orgânica", "Soluções e Concentração", "Termoquímica e Eletroquímica"],
    topicsByYear: {
      "1o-ano": [
        "Modelos Atômicos, Estrutura do Átomo e Tabela Periódica",
        "Ligações Químicas (Iônica, Covalente e Metálica)",
        "Funções Inorgânicas: Ácidos, Bases, Sais e Óxidos",
        "Reações Químicas e Leis Ponderais"
      ],
      "2o-ano": [
        "Cálculo Estequiométrico e Mol",
        "Soluções e Concentrações (g/L, mol/L e Título)",
        "Termoquímica (Entalpia e Reações Endotérmicas/Exotérmicas)",
        "Cinética Química e Equilíbrio Químico"
      ],
      "3o-ano": [
        "Introdução à Química Orgânica: Cadeias Carbônicas",
        "Funções Orgânicas (Álcoois, Cetonas, Ácidos Carboxílicos, Ésteres)",
        "Isomeria Plana e Espacial (Óptica)",
        "Eletroquímica: Pilhas, Baterias e Eletrolise no ENEM"
      ]
    },
    collegeCourses: ["Química", "Engenharia Química", "Farmácia", "Biomedicina", "Engenharia de Alimentos", "Engenharia de Materiais"],
    technicalCourses: ["Técnico em Química", "Técnico em Alimentos", "Técnico em Petróleo e Gás", "Técnico em Meio Ambiente"]
  },
  {
    slug: "fisica",
    name: "Física",
    category: "Exatas",
    iconName: "Zap",
    description: "Mecânica, Termologia, Óptica, Ondulatória e Eletromagnetismo.",
    topics: ["Mecânica e Leis de Newton", "Eletricidade e Circuitos", "Ondas e Acústica", "Termodinâmica", "Óptica e Espelhos"],
    topicsByYear: {
      "1o-ano": [
        "Cinemática: MRU, MRUV e Queda Livre",
        "Vetores e Movimento Circular Uniforme (MCU)",
        "Leis de Newton e Forças de Atrito/Peso/Tração",
        "Trabalho, Potência, Energia Mecânica e Conservação"
      ],
      "2o-ano": [
        "Termometria, Dilatação Térmica e Calorimetria",
        "Gases Perfeitos e Leis da Termodinâmica",
        "Óptica Geométrica: Reflexão, Refração, Espelhos e Lentes",
        "Ondulatória: Movimento Harmônico Simples (MHS), Frequência e Fenômenos Ondulatórios"
      ],
      "3o-ano": [
        "Eletrostática: Carga Elétrica, Campo Elétrico e Potencial",
        "Eletrodinâmica: Corrente, Resistores, Leis de Ohm e Potência Elétrica",
        "Circuitos Elétricos e Consumo de Energia no ENEM",
        "Eletromagnetismo: Campo Magnético, Indução e Física Moderna"
      ]
    },
    collegeCourses: ["Física", "Engenharia Elétrica", "Engenharia Mecânica", "Ciência da Computação", "Aeronáutica"],
    technicalCourses: ["Técnico em Eletrotécnica", "Técnico em Mecatrônica", "Técnico em Manutenção Aeronáutica", "Técnico em Automação Industrial"]
  },
  {
    slug: "historia",
    name: "História",
    category: "Humanas",
    iconName: "Landmark",
    description: "História do Brasil, História Geral, Idade Média, Guerras e Era Contemporânea.",
    topics: ["Brasil Colônia e Império", "Era Vargas e Ditadura Militar", "Revolução Industrial e Francesa", "Primeira e Segunda Guerra Mundial", "Guerra Fria"],
    topicsByYear: {
      "1o-ano": [
        "Pré-História, Antiguidade Oriental (Egito, Mesopotâmia) e Clássica (Grécia e Roma)",
        "Idade Média: Feudalismo, Cruzadas e Império Bizantino",
        "Renascimento Cultural e Reforma Protestante",
        "Povos Originários da América e Expansão Marítima Europeia"
      ],
      "2o-ano": [
        "Brasil Colônia: Ciclos do Açúcar, Ouro e Trabalho Escravo",
        "Iluminismo, Independência dos EUA e Revolução Francesa",
        "Revolução Industrial e o Surgimento do Capitalismo",
        "Brasil Império (1º Reinado, Período Regencial e 2º Reinado)"
      ],
      "3o-ano": [
        "República Velha, Era Vargas e Populismo no Brasil",
        "Primeira Guerra Mundial, Crise de 1929 e Nazifascismo",
        "Segunda Guerra Mundial e Guerra Fria",
        "Ditadura Militar Brasileira e Processo de Redemocratização (Diretas Já)"
      ]
    },
    collegeCourses: ["História", "Direito", "Relações Internacionais", "Ciências Sociais", "Arquivologia", "Filosofia"],
    technicalCourses: ["Técnico em Guia de Turismo", "Técnico em Gestão Pública", "Técnico em Museologia/Patrimônio"]
  },
  {
    slug: "geografia",
    name: "Geografia",
    category: "Humanas",
    iconName: "Globe",
    description: "Geografia Física, Geopolítica, Cartografia, Meio Ambiente e Demografia.",
    topics: ["Geopolítica Global", "Clima, Relevo e Domínios Morfoclimáticos", "Urbanização e Industrialização", "Demografia e Migrações", "Globalização e Blocos Econômicos"],
    topicsByYear: {
      "1o-ano": [
        "Cartografia: Coordenadas, Escalas e Fusos Horários",
        "Geologia e Relevo Terrestre: Tectônica de Placas e Solos",
        "Climatologia e Hidrografia: Climas do Brasil e do Mundo",
        "Biomas Mundiais e Domínios Morfoclimáticos Brasileiros"
      ],
      "2o-ano": [
        "Demografia: Crescimento Populacional, Pirâmides Etárias e Migrações",
        "Urbanização Brasileira e Problemas Socioambientais Urbanos",
        "Industrialização Brasileira e Espaço Agrário (Agronegócio vs Agricultura Familiar)",
        "Recursos Energéticos e Matriz Energética (Renovável vs Fóssil)"
      ],
      "3o-ano": [
        "Globalização, Redes de Comunicação e Blocos Econômicos",
        "Geopolítica Mundial Contemporânea: Conflitos e Organizações Internacionais (ONU, OTAN, BRICS)",
        "Questões Ambientais Globais: Aquecimento Global, Desmatamento e Sustentabilidade",
        "Geografia Econômica do Brasil no ENEM"
      ]
    },
    collegeCourses: ["Geografia", "Engenharia de Agrimensura/Cartográfica", "Gestão Ambiental", "Relações Internacionais", "Turismo", "Sociologia"],
    technicalCourses: ["Técnico em Meio Ambiente", "Técnico em Geoprocessamento", "Técnico em Agronegócio", "Técnico em Logística"]
  },
  {
    slug: "filosofia-sociologia",
    name: "Filosofia e Sociologia",
    category: "Humanas",
    iconName: "Brain",
    description: "Pensadores Clássicos, Ética, Cidadania, Cultura, Trabalho e Sociedade.",
    topics: ["Filosofia Grega (Sócrates, Platão, Aristóteles)", "Contratualistas (Hobbes, Locke, Rousseau)", "Clássicos da Sociologia (Marx, Durkheim, Weber)", "Cultura, Indústria Cultural e Mídia", "Direitos Humanos e Cidadania"],
    topicsByYear: {
      "1o-ano": [
        "Mito vs Filosofia: O Nascimento do Pensamento Racional na Grécia",
        "Pré-Socráticos, Sócrates, Platão e Aristóteles",
        "Surgimento da Sociologia e o Conceito de Fato Social (Durkheim)",
        "Cultura, Identidade, Diversidade e Etnocentrismo"
      ],
      "2o-ano": [
        "Filosofia Medieval (Santo Agostinho e São Tomás de Aquino) e Renascentista (Maquiavel)",
        "Racionalismo (Descartes) e Empirismo (Bacon e Locke)",
        "Karl Marx: Luta de Classes, Mais-Valia e Alienação",
        "Max Weber: Ação Social, Época Protestante e Burocracia"
      ],
      "3o-ano": [
        "Filosofia Política Contratualista (Hobbes, Locke e Rousseau) e Kant",
        "Escola de Frankfurt: Indústria Cultural, Adorno e Horkheimer",
        "Sociologia Brasileira: Gilberto Freyre, Sérgio Buarque de Holanda e Darcy Ribeiro",
        "Cidadania, Direitos Humanos, Movimentos Sociais e Política no ENEM"
      ]
    },
    collegeCourses: ["Filosofia", "Sociologia", "Direito", "Ciências Sociais", "Psicologia", "Jornalismo", "Pedagogia"],
    technicalCourses: ["Técnico em Serviços Jurídicos", "Técnico em Recursos Humanos", "Técnico em Assistência Social"]
  },
  {
    slug: "ingles",
    name: "Inglês",
    category: "Linguagens",
    iconName: "Languages",
    description: "Leitura Instrumental, Gramática Aplicada, Falsos Cognatos e Vocabulário ENEM.",
    topics: ["Técnicas de Leitura (Skimming e Scanning)", "Falsos Cognatos (False Friends)", "Conectivos e Linking Words", "Tempos Verbais Aplicados a Textos", "Interpretação de Cartuns e Notícias"],
    topicsByYear: {
      "1o-ano": [
        "Vocabulário Fundamental e Falsos Amigos (False Cognates)",
        "Técnicas de Leitura Instrumental: Skimming e Scanning",
        "Present Simple, Present Continuous e Pronomes",
        "Leitura de Textos Curtos e Anúncios Publicitários"
      ],
      "2o-ano": [
        "Past Simple, Past Continuous e Present Perfect",
        "Modal Verbs (Can, Could, Should, Must)",
        "Conectivos e Coesão Textual (Linking Words / Transition Words)",
        "Interpretação de Tirinhas, Cartuns e Memes em Inglês"
      ],
      "3o-ano": [
        "Conditionals (Zero, First, Second, Third) e Voz Passiva",
        "Leitura Avançada de Artigos Jornalísticos e Científicos em Inglês",
        "Vocabulário Técnico e Corporativo de Trabalho",
        "Resolução de Questões de Inglês do ENEM"
      ]
    },
    collegeCourses: ["Letras - Inglês", "Tradução e Interpretação", "Relações Internacionais", "Comércio Exterior", "Turismo"],
    technicalCourses: ["Técnico em Comércio Exterior", "Técnico em Secretariado Executivo", "Técnico em Hotelaria/Turismo"]
  }
];

export function getSubjectBySlug(slug: string): SubjectMetadata | undefined {
  return HIGH_SCHOOL_SUBJECTS.find((s) => s.slug === slug);
}

export function getTopicsByYear(subject: SubjectMetadata, selectedYear: YearId): Array<{ topic: string; yearId: "1o-ano" | "2o-ano" | "3o-ano"; yearLabel: string }> {
  if (selectedYear === "1o-ano") {
    return subject.topicsByYear["1o-ano"].map(t => ({ topic: t, yearId: "1o-ano", yearLabel: "1º Ano" }));
  }
  if (selectedYear === "2o-ano") {
    return subject.topicsByYear["2o-ano"].map(t => ({ topic: t, yearId: "2o-ano", yearLabel: "2º Ano" }));
  }
  if (selectedYear === "3o-ano") {
    return subject.topicsByYear["3o-ano"].map(t => ({ topic: t, yearId: "3o-ano", yearLabel: "3º Ano & ENEM" }));
  }

  return [
    ...subject.topicsByYear["1o-ano"].map(t => ({ topic: t, yearId: "1o-ano" as const, yearLabel: "1º Ano" })),
    ...subject.topicsByYear["2o-ano"].map(t => ({ topic: t, yearId: "2o-ano" as const, yearLabel: "2º Ano" })),
    ...subject.topicsByYear["3o-ano"].map(t => ({ topic: t, yearId: "3o-ano" as const, yearLabel: "3º Ano & ENEM" })),
  ];
}

export interface EnsinoMedioGeneratedContent {
  subjectName: string;
  topic: string;
  summary: {
    title: string;
    introduction: string;
    keyPoints: string[];
    enemTip: string;
  };
  careerGuidance: {
    collegePaths: Array<{ name: string; why: string }>;
    technicalPaths: Array<{ name: string; why: string }>;
    marketOutlook: string;
  };
  quiz: Array<{
    id: number;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  }>;
  flashcards: Array<{
    id: number;
    front: string;
    back: string;
  }>;
  trueOrFalse: Array<{
    id: number;
    statement: string;
    isTrue: boolean;
    explanation: string;
  }>;
}
