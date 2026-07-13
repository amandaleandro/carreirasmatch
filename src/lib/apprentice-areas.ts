export type ApprenticeAreaCourse = {
  title: string;
  provider: string;
};

export type ApprenticeArea = {
  key: string;
  label: string;
  description: string;
  courses: ApprenticeAreaCourse[];
};

export const APPRENTICE_AREAS: ApprenticeArea[] = [
  {
    key: "administrativo",
    label: "Administrativo / escritório",
    description:
      "Apoio em rotinas de escritório: arquivamento, atendimento interno, organização de documentos, planilhas simples e suporte a outras áreas. É uma das áreas que mais recebe aprendizes por não exigir experiência prévia.",
    courses: [
      { title: "Excel, Word e Pacote Office", provider: "Fundação Bradesco" },
      { title: "Fundamentos de Administração", provider: "Fundação Bradesco" },
      { title: "Comunicação, cidadania e tecnologia básica", provider: "Escola Virtual Gov" },
    ],
  },
  {
    key: "atendimento_comercio",
    label: "Atendimento e comércio",
    description:
      "Funções em lojas, recepção e atendimento ao cliente presencial ou por telefone/chat. Costuma ser a porta de entrada em redes de varejo, bancos e comércio local.",
    courses: [
      { title: "Atendimento ao Cliente", provider: "Sebrae" },
      { title: "Postura profissional e atendimento", provider: "Fundação Bradesco" },
      { title: "Vendas e negociação básica", provider: "Sebrae" },
    ],
  },
  {
    key: "logistica",
    label: "Logística e estoque",
    description:
      "Apoio em conferência de estoque, organização de almoxarifado, separação de pedidos e suporte a operações de armazém, presente em indústrias, varejo e e-commerce.",
    courses: [
      { title: "Noções de Logística e Entregas", provider: "Sebrae" },
      { title: "Fundamentos de Administração", provider: "Fundação Bradesco" },
    ],
  },
  {
    key: "tecnologia_suporte",
    label: "Tecnologia e suporte",
    description:
      "Suporte técnico básico, apoio em cadastro de sistemas e primeiro contato com rotinas de tecnologia, uma área em crescimento para programas de aprendizagem em empresas maiores.",
    courses: [
      { title: "Fundamentos de tecnologia e produtividade", provider: "Microsoft Learn" },
      { title: "Comunicação, cidadania e tecnologia básica", provider: "Escola Virtual Gov" },
    ],
  },
  {
    key: "saude_apoio",
    label: "Saúde, apoio administrativo",
    description:
      "Funções de apoio administrativo em clínicas, hospitais e laboratórios: recepção de pacientes, organização de prontuários e agendamento, não envolve procedimentos de saúde, apenas rotina administrativa.",
    courses: [
      { title: "Atendimento ao Cliente", provider: "Sebrae" },
      { title: "Excel, Word e Pacote Office", provider: "Fundação Bradesco" },
    ],
  },
  {
    key: "industria_producao",
    label: "Indústria e produção",
    description:
      "Apoio em linhas de produção e processos industriais, geralmente com contrato via IEL/SENAI, incluindo noções básicas de segurança do trabalho e qualidade.",
    courses: [
      { title: "Alvenaria e Acabamento em Construção Civil", provider: "SENAI" },
      { title: "Fundamentos de Administração", provider: "Fundação Bradesco" },
    ],
  },
];

export const APPRENTICE_AREA_BY_KEY = Object.fromEntries(
  APPRENTICE_AREAS.map((a) => [a.key, a])
) as Record<string, ApprenticeArea>;
