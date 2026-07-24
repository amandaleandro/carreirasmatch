import { runJsonAcrossProviders } from "@/lib/ai-providers";

export interface SubjectMetadata {
  slug: string;
  name: string;
  category: "Exatas" | "Humanas" | "Biológicas" | "Linguagens";
  iconName: string;
  description: string;
  topics: string[];
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
    collegeCourses: ["Medicina", "Enfermagem", "Biomedicina", "Biotecnologia", "Agronomia", "Veterinária"],
    technicalCourses: ["Técnico em Enfermagem", "Técnico em Análises Clínicas", "Técnico em Meio Ambiente", "Técnico em Farmácia"]
  },
  {
    slug: "fisica",
    name: "Física",
    category: "Exatas",
    iconName: "Zap",
    description: "Mecânica, Termodinâmica, Óptica, Eletricidade e Física Moderna.",
    topics: ["Leis de Newton e Cinemática", "Conservação de Energia", "Circuito Elétrico e Ohm", "Óptica e Ondas", "Termodinâmica"],
    collegeCourses: ["Física", "Engenharia Elétrica", "Engenharia Mecânica", "Aeronáutica", "Astronomia"],
    technicalCourses: ["Técnico em Mecatrônica", "Técnico em Eletroeletrônica", "Técnico em Manutenção de Aeronaves", "Técnico em Refrigeração"]
  },
  {
    slug: "quimica",
    name: "Química",
    category: "Exatas",
    iconName: "FlaskConical",
    description: "Química Orgânica, Tabela Periódica, Estequiometria e Soluções.",
    topics: ["Estequiometria e Cálculos", "Tabela Periódica e Ligações", "Química Orgânica", "Termoquímica e Cinética", "Reações Químicas"],
    collegeCourses: ["Engenharia Química", "Química Industrial", "Farmácia", "Engenharia de Alimentos", "Odontologia"],
    technicalCourses: ["Técnico em Química", "Técnico em Biocombustíveis", "Técnico em Alimentos", "Técnico em Petróleo e Gás"]
  },
  {
    slug: "historia",
    name: "História",
    category: "Humanas",
    iconName: "Landmark",
    description: "Brasil Colônia/Império/República, Guerras Mundiais e História Geral.",
    topics: ["Brasil República e Ditadura", "Revolução Industrial", "Primeira e Segunda Guerra Mundial", "Brasil Colônia e Ouro", "Antiguidade e Feudalismo"],
    collegeCourses: ["História", "Relações Internacionais", "Direito", "Ciências Sociais", "Museologia", "Arqueologia"],
    technicalCourses: ["Técnico em Guia de Turismo", "Técnico em Eventos", "Técnico em Gestão Pública"]
  },
  {
    slug: "geografia",
    name: "Geografia",
    category: "Humanas",
    iconName: "Globe",
    description: "Geografia Física, Geopolítica, Urbanização, Demografia e Cartografia.",
    topics: ["Geopolítica Global", "Demografia e Urbanização no Brasil", "Clima e Relevo", "Agropecuária e Indústria", "Meio Ambiente e Globalização"],
    collegeCourses: ["Geografia", "Geologia", "Engenharia Ambiental", "Urbanismo", "Gestão de Políticas Públicas"],
    technicalCourses: ["Técnico em Geoprocessamento", "Técnico em Agronegócio", "Técnico em Meio Ambiente"]
  },
  {
    slug: "filosofia-sociologia",
    name: "Filosofia e Sociologia",
    category: "Humanas",
    iconName: "Brain",
    description: "Pensadores Clássicos, Ética, Cidadania, Cultura e Sociedade Contemporânea.",
    topics: ["Ética e Justiça (Aristóteles, Kant)", "Sociologia do Trabalho", "Cultura e Indústria Cultural", "Direitos Humanos e Cidadania", "Filosofia Política"],
    collegeCourses: ["Filosofia", "Sociologia", "Direito", "Psicologia", "Serviço Social", "Pedagogia"],
    technicalCourses: ["Técnico em Recursos Humanos", "Técnico em Serviços Públicos", "Técnico em Orientação Comunitária"]
  },
];

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

export function getSubjectBySlug(slug: string): SubjectMetadata | undefined {
  return HIGH_SCHOOL_SUBJECTS.find((s) => s.slug === slug);
}

export async function generateEnsinoMedioMaterial(
  subjectSlug: string,
  topic: string
): Promise<EnsinoMedioGeneratedContent> {
  const subject = getSubjectBySlug(subjectSlug);
  const subjectName = subject ? subject.name : subjectSlug;

  const systemPrompt = `Você é um tutor especialista em Ensino Médio, ENEM e Orientação Vocacional para jovens no Brasil.
Seu objetivo é gerar um material de estudo completo, educativo, envolvente e focado na prática para a matéria de "${subjectName}" sobre o tópico "${topic}".

IMPORTANTE: O estudante também quer entender como este conhecimento se aplica no mercado de trabalho e quais opções de cursos superiores (Faculdade/Graduação) ou Cursos Técnicos se conectam com esse assunto.

Retorne EXATAMENTE um objeto JSON válido seguindo a estrutura:
{
  "subjectName": "${subjectName}",
  "topic": "${topic}",
  "summary": {
    "title": "Título chamativo do resumo",
    "introduction": "Explicação clara e didática de 2-3 parágrafos",
    "keyPoints": ["Ponto chave 1", "Ponto chave 2", "Ponto chave 3", "Ponto chave 4"],
    "enemTip": "Dica prática de como esse assunto costuma ser cobrado no ENEM ou vestibulares"
  },
  "careerGuidance": {
    "collegePaths": [
      { "name": "Nome da Faculdade/Curso", "why": "Como esta matéria se aplica nesta profissão" },
      { "name": "Nome da Faculdade/Curso", "why": "Como esta matéria se aplica nesta profissão" }
    ],
    "technicalPaths": [
      { "name": "Nome do Curso Técnico", "why": "Como este curso técnico aplica o assunto rapidamente no mercado" },
      { "name": "Nome do Curso Técnico", "why": "Como este curso técnico aplica o assunto rapidamente no mercado" }
    ],
    "marketOutlook": "Visão geral sobre oportunidades de carreira e salários para quem gosta desta área"
  },
  "quiz": [
    {
      "id": 1,
      "question": "Pergunta do quiz?",
      "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
      "correctAnswerIndex": 0,
      "explanation": "Explicação por que a resposta está correta"
    }
  ],
  "flashcards": [
    { "id": 1, "front": "Conceito ou pergunta rápida", "back": "Resposta direta e fácil de memorizar" }
  ],
  "trueOrFalse": [
    { "id": 1, "statement": "Afirmação sobre o conteúdo", "isTrue": true, "explanation": "Explicação do motivo" }
  ]
}`;

  const userMessage = `Gere o material de estudo e jogos interativos para a matéria "${subjectName}" sobre o tópico "${topic}". Seja didático, encorajador e preciso.`;

  const rawJson = await runJsonAcrossProviders(
    systemPrompt,
    userMessage,
    0.7,
    4000,
    "llama-3.3-70b-versatile",
    undefined,
    "ensino_medio_generation",
    "gemini"
  );

  const parsed = JSON.parse(rawJson) as EnsinoMedioGeneratedContent;
  return parsed;
}
