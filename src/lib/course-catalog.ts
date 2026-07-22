export type CourseCatalogEntry = {
  title: string;
  provider: string;
  free: boolean;
  areas: string[];
};

function normalizeArea(area: string): string {
  return area
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export const COURSE_CATALOG: CourseCatalogEntry[] = [
  // Elétrica / construção / manutenção
  { title: "Instalações Elétricas Residenciais", provider: "SENAI", free: false, areas: ["eletricista", "eletrica"] },
  { title: "Eletricista Instalador Predial e Residencial", provider: "SENAI", free: false, areas: ["eletricista", "eletrica"] },
  { title: "Instalação Hidráulica Residencial", provider: "SENAI", free: false, areas: ["encanador", "hidraulica"] },
  { title: "Alvenaria e Acabamento em Construção Civil", provider: "SENAI", free: false, areas: ["pedreiro", "construcao civil", "pintor"] },
  { title: "Pintura Predial", provider: "SENAI", free: false, areas: ["pintor", "construcao civil"] },
  { title: "Marcenaria Básica", provider: "SENAI", free: false, areas: ["marceneiro", "carpinteiro"] },

  // Beleza e estética
  { title: "Cabeleireiro(a) Profissional", provider: "SENAC", free: false, areas: ["cabeleireiro", "cabeleireira", "beleza"] },
  { title: "Manicure e Pedicure", provider: "SENAC", free: false, areas: ["manicure", "pedicure", "beleza"] },
  { title: "Barbeiro Profissional", provider: "SENAC", free: false, areas: ["barbeiro", "beleza"] },
  { title: "Design de Sobrancelhas", provider: "SENAC", free: false, areas: ["esteticista", "beleza"] },
  { title: "Maquiagem Profissional", provider: "SENAC", free: false, areas: ["maquiador", "maquiadora", "beleza"] },

  // Cuidados e serviços domésticos
  { title: "Cuidador de Idosos", provider: "Fundação Bradesco", free: true, areas: ["cuidador de idosos", "cuidadora", "cuidados"] },
  { title: "Técnicas de Limpeza e Organização Residencial", provider: "Sebrae", free: true, areas: ["diarista", "faxineira", "limpeza"] },
  { title: "Noções de Primeiros Socorros", provider: "Cruz Vermelha Brasileira", free: false, areas: ["cuidador de idosos", "baba", "cuidados"] },
  { title: "Babá Profissional", provider: "SENAC", free: false, areas: ["baba"] },

  // Culinária
  { title: "Culinária Básica e Boas Práticas de Higiene", provider: "SENAC", free: false, areas: ["cozinheiro", "cozinheira", "culinaria"] },
  { title: "Confeitaria Básica", provider: "SENAC", free: false, areas: ["confeiteiro", "confeiteira", "culinaria"] },
  { title: "Panificação e Confeitaria", provider: "SENAI", free: false, areas: ["padeiro", "confeiteiro", "confeiteira"] },

  // Costura e moda
  { title: "Costura Industrial Básica", provider: "SENAI", free: false, areas: ["costureira", "costureiro", "moda"] },
  { title: "Corte e Costura", provider: "SENAC", free: false, areas: ["costureira", "costureiro", "moda"] },

  // Motorista / logística
  { title: "Direção Defensiva", provider: "Detran", free: false, areas: ["motorista", "entregador"] },
  { title: "Noções de Logística e Entregas", provider: "Sebrae", free: true, areas: ["motorista", "entregador", "logistica"] },

  // Jardinagem / paisagismo
  { title: "Jardinagem e Paisagismo Básico", provider: "SENAI", free: false, areas: ["jardineiro", "jardinagem", "paisagismo"] },

  // Vendas / atendimento / administrativo (áreas com ou sem diploma)
  { title: "Atendimento ao Cliente", provider: "Sebrae", free: true, areas: ["vendedor", "vendedora", "atendimento", "recepcionista"] },
  { title: "Educação Financeira para Autônomos", provider: "Sebrae", free: true, areas: ["diarista", "vendedor", "autonomo", "mei"] },
  { title: "Como Formalizar o MEI", provider: "Sebrae", free: true, areas: ["autonomo", "mei", "empreendedorismo"] },
  { title: "Excel, Word e Pacote Office", provider: "Fundação Bradesco", free: true, areas: ["administrativo", "recepcionista", "escritorio"] },
  { title: "Fundamentos de Administração", provider: "Fundação Bradesco", free: true, areas: ["administrativo", "escritorio"] },

  // Tecnologia / digital
  { title: "Fundamentos de Tecnologia e Produtividade", provider: "Microsoft Learn", free: true, areas: ["tecnologia", "ti", "programador", "programadora"] },
  { title: "Marketing Digital", provider: "Google Ateliê Digital", free: true, areas: ["marketing digital", "vendedor", "tecnologia", "social media"] },
  { title: "Comunicação, Cidadania e Tecnologia Básica", provider: "Escola Virtual Gov", free: true, areas: ["tecnologia", "administrativo"] },

  // Áreas de nível superior (ensino/vestibular vocacional) — complementa as trilhas
  // acima, que eram focadas em ofícios e Jovem Aprendiz.
  { title: "Programação para Iniciantes", provider: "Coursera", free: true, areas: ["ti", "tecnologia da informacao"] },
  { title: "Fundamentos de Cloud Computing", provider: "Microsoft Learn", free: true, areas: ["ti", "tecnologia da informacao"] },

  { title: "Suporte Básico de Vida (BLS)", provider: "Cruz Vermelha Brasileira", free: false, areas: ["medicina"] },
  { title: "Preparatório para Residência Médica", provider: "Sanar Medicina", free: false, areas: ["medicina"] },

  { title: "Preparatório para o Exame da OAB", provider: "Estratégia OAB", free: false, areas: ["direito"] },
  { title: "Introdução ao Direito Digital", provider: "FGV Online", free: true, areas: ["direito"] },

  { title: "Introdução à Engenharia de Produção", provider: "Coursera", free: true, areas: ["engenharia"] },
  { title: "AutoCAD Básico", provider: "SENAI", free: false, areas: ["engenharia", "arquitetura"] },

  { title: "Metodologias Ativas em Sala de Aula", provider: "Nova Escola", free: true, areas: ["educacao"] },
  { title: "Gestão Escolar na Prática", provider: "Fundação Bradesco", free: true, areas: ["educacao"] },

  { title: "Marketing Digital para Negócios", provider: "Google Ateliê Digital", free: true, areas: ["marketing"] },
  { title: "Fundamentos de Growth e Performance", provider: "Coursera", free: true, areas: ["marketing"] },

  { title: "Introdução ao UX/UI Design", provider: "Coursera", free: true, areas: ["design"] },
  { title: "Figma na Prática", provider: "Alura", free: false, areas: ["design"] },

  { title: "Fundamentos de Administração", provider: "Fundação Bradesco", free: true, areas: ["administracao"] },
  { title: "Gestão de Projetos na Prática", provider: "FGV Online", free: true, areas: ["administracao"] },

  { title: "Excel Avançado para Finanças", provider: "Fundação Bradesco", free: true, areas: ["financas"] },
  { title: "Preparatório para o Exame de Suficiência (CFC)", provider: "Gran Cursos Online", free: false, areas: ["financas"] },

  { title: "Redação Jornalística na Prática", provider: "Coursera", free: true, areas: ["comunicacao"] },
  { title: "Produção de Conteúdo Digital", provider: "Google Ateliê Digital", free: true, areas: ["comunicacao"] },

  { title: "Técnico em Enfermagem", provider: "SENAC", free: false, areas: ["enfermagem"] },
  { title: "Atualização em Procedimentos de Enfermagem", provider: "Sanar Enfermagem", free: false, areas: ["enfermagem"] },

  { title: "Atualização em Odontologia Estética", provider: "Sanar Odontologia", free: false, areas: ["odontologia"] },

  { title: "Farmácia Clínica na Prática", provider: "Sanar Farmácia", free: false, areas: ["farmacia"] },

  { title: "Fisioterapia Baseada em Evidências", provider: "Sanar Fisioterapia", free: false, areas: ["fisioterapia"] },

  { title: "Nutrição Esportiva na Prática", provider: "Sanar Nutrição", free: false, areas: ["nutricao"] },

  { title: "Introdução à Terapia Cognitivo-Comportamental", provider: "Coursera", free: true, areas: ["psicologia"] },
  { title: "Psicologia Organizacional na Prática", provider: "FGV Online", free: true, areas: ["psicologia"] },

  { title: "Manejo Clínico de Pequenos Animais", provider: "Sanar Veterinária", free: false, areas: ["veterinaria"] },

  { title: "Prescrição de Treino e Avaliação Física", provider: "SENAC", free: false, areas: ["educacao fisica"] },

  { title: "Revit para Arquitetura", provider: "SENAI", free: false, areas: ["arquitetura"] },
  { title: "Introdução ao Urbanismo", provider: "Coursera", free: true, areas: ["arquitetura"] },

  { title: "Introdução à Bioinformática", provider: "Coursera", free: true, areas: ["biologicas", "ciencias biologicas"] },

  { title: "Boas Práticas Agrícolas", provider: "SENAR", free: false, areas: ["agronomia"] },

  { title: "Estatística Aplicada com Excel", provider: "Fundação Bradesco", free: true, areas: ["exatas"] },
  { title: "Preparatório para Concursos de Exatas", provider: "Gran Cursos Online", free: false, areas: ["exatas"] },

  { title: "Tradução e Versão de Textos", provider: "Coursera", free: true, areas: ["letras"] },
  { title: "Revisão de Texto na Prática", provider: "Alura", free: false, areas: ["letras"] },

  { title: "Geoprocessamento e Cartografia Básica", provider: "Coursera", free: true, areas: ["humanas"] },
  { title: "Preparatório para Concursos de Humanas", provider: "Gran Cursos Online", free: false, areas: ["humanas"] },

  { title: "Políticas Públicas Sociais", provider: "FGV Online", free: true, areas: ["servico social", "relacoes internacionais"] },
  { title: "Preparatório para o Instituto Rio Branco", provider: "Estratégia Diplomacia", free: false, areas: ["relacoes internacionais"] },

  { title: "Produção Cultural na Prática", provider: "Coursera", free: true, areas: ["artes"] },

  { title: "Modelagem e Costura para Estilismo", provider: "SENAI", free: false, areas: ["moda"] },

  { title: "Gestão de Restaurantes e Bares", provider: "SENAC", free: false, areas: ["gastronomia", "turismo", "hotelaria"] },
  { title: "Guia de Turismo: Cadastur na Prática", provider: "Sebrae", free: true, areas: ["turismo"] },

  { title: "Edição de Vídeo na Prática", provider: "Alura", free: false, areas: ["audiovisual"] },
  { title: "Roteiro para Audiovisual", provider: "Coursera", free: true, areas: ["audiovisual"] },

  { title: "Preparatório para Concursos de Segurança Pública", provider: "Gran Cursos Online", free: false, areas: ["seguranca publica"] },
];

export function getCoursesForArea(area: string | null | undefined): CourseCatalogEntry[] {
  if (!area || !area.trim()) return [];
  const normalized = normalizeArea(area);
  return COURSE_CATALOG.filter((entry) =>
    entry.areas.some((a) => normalized.includes(a) || a.includes(normalized))
  );
}

export const COMMON_PROFESSIONAL_AREAS: string[] = [
  "Eletricista",
  "Encanador(a)",
  "Pedreiro/Pintor",
  "Marceneiro(a)/Carpinteiro(a)",
  "Cabeleireiro(a)/Barbeiro(a)",
  "Manicure/Pedicure",
  "Maquiador(a)/Esteticista",
  "Diarista/Faxineira",
  "Cuidador(a) de idosos",
  "Babá",
  "Cozinheiro(a)/Confeiteiro(a)",
  "Costureira/Costureiro",
  "Motorista/Entregador",
  "Jardineiro(a)",
  "Vendedor(a)",
  "Recepcionista/Administrativo",
  "Tecnologia",
  "Outra área",
];
