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
