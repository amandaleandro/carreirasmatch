export type VocationAreaConfig = {
  slug: string;
  label: string;
  description: string;
  subareas: string[];
  enjoysOptions: string[];
  priorExperienceOptions: string[];
  /**
   * Mecânica real de carreira no Brasil (conselho profissional, exame de
   * ordem, concurso, residência etc.). Usado para ancorar o blog em fatos
   * concretos da profissão em vez de conselhos genéricos "estilo tech"
   * (portfólio, stack, sprint) que não se aplicam fora de TI/design/marketing.
   */
  careerNotes?: string;
};

export const VOCATION_PEOPLE_OR_PROCESS_OPTIONS = [
  "Mais com pessoas",
  "Mais com processos, dados ou sistemas",
  "Um equilíbrio entre os dois",
];

export const VOCATION_WORK_STYLE_OPTIONS = [
  "Sozinho(a) e focado(a)",
  "Em equipe, colaborando bastante",
  "Com rotina fixa e previsível",
  "Com desafios variados e imprevisíveis",
];

export const EXAM_TYPE_OPTIONS: { value: "enem" | "vestibular" | "ambos"; label: string }[] = [
  { value: "enem", label: "ENEM" },
  { value: "vestibular", label: "Vestibular tradicional" },
  { value: "ambos", label: "Os dois" },
];

export const EXAM_TIME_UNTIL_OPTIONS = [
  "Menos de 3 meses",
  "3 a 6 meses",
  "6 a 12 meses",
  "Mais de 12 meses",
];

export const EXAM_WEEKLY_HOURS_OPTIONS = [
  "Menos de 5 horas",
  "5 a 10 horas",
  "10 a 20 horas",
  "Mais de 20 horas",
];

export const EDUCATION_PREFERENCE_OPTIONS = ["Faculdade", "Curso técnico", "Ainda não decidi"];

export const DISCOVERY_ENJOYS_OPTIONS = [
  "Resolver problemas técnicos e lógicos",
  "Cuidar diretamente de pessoas",
  "Argumentar, negociar ou defender posições",
  "Projetar e construir coisas (estruturas, sistemas, produtos)",
  "Ensinar e explicar conceitos para outras pessoas",
  "Criar conteúdos visuais ou criativos",
  "Analisar dados, números ou relatórios",
  "Planejar estratégias e gerenciar projetos",
  "Escrever, apurar ou comunicar informações",
  "Organizar processos, rotinas e prazos",
];

export const EXAM_SUBJECT_OPTIONS = [
  "Matemática",
  "Português/Redação",
  "Física",
  "Química",
  "Biologia",
  "História",
  "Geografia",
  "Filosofia/Sociologia",
  "Inglês",
];

export const VOCATION_AREAS: VocationAreaConfig[] = [
  {
    slug: "ti",
    label: "Tecnologia da Informação",
    description: "Descubra qual caminho de TI mais combina com você.",
    subareas: [
      "Suporte Técnico",
      "Infraestrutura",
      "DevOps/SRE",
      "Cloud",
      "Desenvolvimento Front-end",
      "Desenvolvimento Back-end",
      "Dados/Analytics",
      "QA/Testes",
      "Segurança da Informação",
      "Produto",
      "UX/UI",
    ],
    enjoysOptions: [
      "Resolver problemas técnicos / bugs",
      "Organizar processos e informações",
      "Criar interfaces e experiências visuais",
      "Analisar dados e encontrar padrões",
      "Ajudar e explicar coisas para outras pessoas",
      "Construir e testar sistemas/automações",
    ],
    priorExperienceOptions: [
      "Atendimento ao cliente",
      "Cursos de programação/TI",
      "Projetos pessoais ou acadêmicos",
      "Estágio ou trabalho em TI",
      "Trabalho em outra área (não-TI)",
      "Nenhuma experiência ainda",
    ],
    careerNotes:
      "Não há conselho profissional obrigatório. Portfólio (GitHub, projetos próprios), certificações técnicas e desafios práticos costumam pesar mais que o diploma na contratação.",
  },
  {
    slug: "medicina",
    label: "Medicina",
    description: "Descubra qual especialidade médica mais combina com você.",
    subareas: [
      "Clínica Médica",
      "Cirurgia",
      "Pediatria",
      "Ginecologia e Obstetrícia",
      "Psiquiatria",
      "Cardiologia",
      "Medicina de Família",
      "Medicina do Trabalho",
      "Radiologia",
      "Anestesiologia",
      "Emergência/Urgência",
    ],
    enjoysOptions: [
      "Cuidar diretamente de pacientes",
      "Investigar causas de sintomas e diagnosticar",
      "Realizar procedimentos manuais/cirúrgicos",
      "Acompanhar pacientes a longo prazo",
      "Lidar com emergências e decisões rápidas",
      "Pesquisar e estudar casos complexos",
    ],
    priorExperienceOptions: [
      "Estágios em hospital/clínica",
      "Iniciação científica/pesquisa",
      "Monitoria em disciplina da faculdade",
      "Plantões ou voluntariado em saúde",
      "Vivência pessoal/familiar com a área da saúde",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Exige registro no CRM após a graduação (Revalida para formados no exterior). A especialização padrão é via residência médica, com prova concorrida por vaga; sem residência formal, o médico pode atuar como generalista mas fica de fora de títulos de especialista.",
  },
  {
    slug: "direito",
    label: "Direito",
    description: "Descubra qual área jurídica mais combina com você.",
    subareas: [
      "Direito Civil",
      "Direito Penal",
      "Direito Trabalhista",
      "Direito Tributário",
      "Direito Empresarial",
      "Direito de Família",
      "Direito Ambiental",
      "Direito Digital",
      "Advocacia Contenciosa",
      "Consultivo/Assessoria Jurídica",
      "Carreira Pública (Magistratura/MP/Procuradorias)",
    ],
    enjoysOptions: [
      "Argumentar e defender posições",
      "Analisar contratos e documentos com atenção a detalhes",
      "Negociar e mediar conflitos",
      "Estudar leis e jurisprudência a fundo",
      "Falar em público / audiências",
      "Organizar processos e prazos",
    ],
    priorExperienceOptions: [
      "Estágio em escritório de advocacia",
      "Estágio em órgão público/tribunal",
      "Participação em júri simulado/competições jurídicas",
      "Monitoria ou pesquisa acadêmica",
      "Trabalho anterior em área administrativa/atendimento",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Exige aprovação no Exame da OAB para atuar como advogado(a). Carreiras públicas (magistratura, MP, procuradorias, delegacia) são um caminho concorrido e separado da advocacia privada, com concurso próprio em vez do exame da Ordem.",
  },
  {
    slug: "engenharia",
    label: "Engenharia",
    description: "Descubra qual ramo da engenharia mais combina com você.",
    subareas: [
      "Engenharia Civil",
      "Engenharia Mecânica",
      "Engenharia Elétrica",
      "Engenharia de Produção",
      "Engenharia Química",
      "Engenharia Ambiental",
      "Engenharia de Software/Computação",
      "Engenharia de Controle e Automação",
      "Engenharia de Alimentos",
      "Engenharia de Segurança do Trabalho",
    ],
    enjoysOptions: [
      "Projetar e calcular estruturas/sistemas",
      "Resolver problemas técnicos práticos",
      "Trabalhar em obra/campo/planta industrial",
      "Programar e automatizar processos",
      "Planejar e gerenciar projetos",
      "Pesquisar e desenvolver novos materiais/processos",
    ],
    priorExperienceOptions: [
      "Estágio técnico ou em obra/fábrica",
      "Projetos acadêmicos ou de extensão",
      "Iniciação científica",
      "Cursos técnicos complementares",
      "Trabalho manual/técnico em outra área",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Exige registro no CREA (Conselho Regional de Engenharia e Agronomia) e ART (Anotação de Responsabilidade Técnica) para assinar projetos. Engenharia de Software/Computação é a exceção: mercado trata como cargo de TI, sem exigir CREA na prática.",
  },
  {
    slug: "educacao",
    label: "Educação",
    description: "Descubra qual caminho na educação mais combina com você.",
    subareas: [
      "Docência na Educação Básica",
      "Docência no Ensino Superior",
      "Coordenação Pedagógica",
      "Gestão Escolar",
      "Educação Especial/Inclusiva",
      "Educação Infantil",
      "Design Educacional/Tecnologia Educacional",
      "Educação de Jovens e Adultos",
    ],
    enjoysOptions: [
      "Explicar e ensinar conceitos para outras pessoas",
      "Planejar aulas e conteúdos",
      "Lidar com crianças/adolescentes no dia a dia",
      "Criar materiais e recursos didáticos",
      "Gerir pessoas e rotinas de uma escola",
      "Pesquisar métodos de ensino",
    ],
    priorExperienceOptions: [
      "Estágio em sala de aula",
      "Monitoria/aulas particulares",
      "Trabalho com crianças/jovens (não formal)",
      "Produção de conteúdo educacional",
      "Experiência em coordenação/gestão de grupos",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Docência exige licenciatura na disciplina. Concursos públicos estaduais/municipais são a porta de entrada mais estável e concorrida; escolas privadas contratam via processo seletivo próprio, geralmente menos formal.",
  },
  {
    slug: "marketing",
    label: "Marketing",
    description: "Descubra qual frente de marketing mais combina com você.",
    subareas: [
      "Marketing Digital",
      "Growth/Performance",
      "Branding",
      "Conteúdo/Redação",
      "Mídias Sociais",
      "SEO",
      "Product Marketing",
      "Trade Marketing",
      "Eventos",
      "Marketing de Dados/Analytics",
    ],
    enjoysOptions: [
      "Criar campanhas e conteúdos criativos",
      "Analisar métricas e dados de performance",
      "Escrever e contar histórias",
      "Planejar estratégias de marca a longo prazo",
      "Gerenciar redes sociais no dia a dia",
      "Organizar eventos e ativações",
    ],
    priorExperienceOptions: [
      "Estágio em marketing/agência",
      "Gestão de redes sociais própria/de terceiros",
      "Projetos freelance de conteúdo/design",
      "Cursos de marketing digital",
      "Empreendedorismo/negócio próprio",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Não há conselho regulador. Portfólio de campanhas/cases, certificações de plataforma (Google, Meta, RD Station etc.) e resultados mensuráveis pesam mais que o diploma.",
  },
  {
    slug: "design",
    label: "Design",
    description: "Descubra qual área do design mais combina com você.",
    subareas: [
      "UX/UI Design",
      "Design Gráfico",
      "Design de Produto",
      "Design de Moda",
      "Design de Interiores",
      "Motion Design/Animação",
      "Design Industrial",
      "Branding/Identidade Visual",
    ],
    enjoysOptions: [
      "Desenhar e criar peças visuais",
      "Resolver problemas de usabilidade/experiência",
      "Pesquisar tendências e referências",
      "Prototipar e testar ideias com usuários",
      "Trabalhar com ferramentas de edição/3D",
      "Apresentar e defender conceitos criativos",
    ],
    priorExperienceOptions: [
      "Projetos pessoais de design/portfólio",
      "Estágio em agência/estúdio",
      "Freelances para clientes",
      "Cursos livres de design/ferramentas",
      "Produção de conteúdo visual nas redes",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Não há conselho regulador. Portfólio é o principal ativo de carreira e mais decisivo na contratação do que o diploma.",
  },
  {
    slug: "administracao",
    label: "Administração e Negócios",
    description: "Descubra qual frente de gestão mais combina com você.",
    subareas: [
      "Gestão de Pessoas/RH",
      "Finanças Corporativas",
      "Operações/Processos",
      "Marketing e Vendas",
      "Empreendedorismo",
      "Logística/Supply Chain",
      "Consultoria",
      "Gestão de Projetos",
      "Controladoria",
    ],
    enjoysOptions: [
      "Organizar processos e rotinas",
      "Liderar e gerenciar pessoas",
      "Analisar números e relatórios financeiros",
      "Planejar estratégias de negócio",
      "Negociar e vender",
      "Resolver problemas operacionais do dia a dia",
    ],
    priorExperienceOptions: [
      "Estágio administrativo/financeiro",
      "Experiência com vendas/atendimento",
      "Participação em empresa júnior",
      "Negócio próprio ou informal",
      "Cursos de gestão/Excel/Office",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Registro no CRA (Conselho Regional de Administração) é opcional/recomendado, não exigido para a maioria dos cargos. Concursos públicos em áreas de gestão (analista administrativo) também são caminho comum.",
  },
  {
    slug: "financas",
    label: "Finanças e Contabilidade",
    description: "Descubra qual caminho em finanças mais combina com você.",
    subareas: [
      "Contabilidade Geral",
      "Auditoria",
      "Controladoria",
      "Finanças Corporativas",
      "Investimentos/Mercado de Capitais",
      "Planejamento Tributário",
      "Perícia Contábil",
      "Consultoria Financeira",
    ],
    enjoysOptions: [
      "Trabalhar com números e planilhas",
      "Analisar riscos e tomar decisões financeiras",
      "Garantir conformidade com normas e leis",
      "Investigar inconsistências/fraudes",
      "Planejar orçamentos e investimentos",
      "Explicar finanças para quem não é da área",
    ],
    priorExperienceOptions: [
      "Estágio em contabilidade/finanças",
      "Cursos de Excel financeiro/investimentos",
      "Participação em empresa júnior de finanças",
      "Controle de finanças pessoais/negócio próprio",
      "Trabalho anterior em área administrativa",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Contador exige registro no CRC e aprovação no Exame de Suficiência do CFC. Áreas de investimentos/mercado de capitais valorizam certificações como CPA-10/20 e CFP mais do que o registro contábil.",
  },
  {
    slug: "comunicacao",
    label: "Comunicação e Jornalismo",
    description: "Descubra qual frente de comunicação mais combina com você.",
    subareas: [
      "Jornalismo (redação/reportagem)",
      "Assessoria de Imprensa",
      "Relações Públicas",
      "Produção de Conteúdo Digital",
      "Rádio/TV/Audiovisual",
      "Comunicação Corporativa/Interna",
      "Redator Publicitário",
      "Podcast/Novas Mídias",
    ],
    enjoysOptions: [
      "Escrever e apurar informações",
      "Entrevistar e conversar com pessoas",
      "Produzir vídeos/áudio/conteúdo multimídia",
      "Planejar estratégias de comunicação",
      "Trabalhar sob prazo apertado (deadline)",
      "Editar e revisar textos de outras pessoas",
    ],
    priorExperienceOptions: [
      "Estágio em redação/assessoria",
      "Blog/canal/podcast próprio",
      "Participação em jornal/rádio universitário",
      "Freelances de redação/conteúdo",
      "Produção de conteúdo nas redes sociais",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Jornalismo não exige mais diploma obrigatório desde decisão do STF em 2009, mas o mercado ainda valoriza formação e, principalmente, clipping/portfólio de matérias publicadas.",
  },
  {
    slug: "enfermagem",
    label: "Enfermagem",
    description: "Descubra qual frente da enfermagem mais combina com você.",
    subareas: [
      "Enfermagem Hospitalar",
      "UTI/Emergência",
      "Enfermagem Obstétrica",
      "Enfermagem Pediátrica",
      "Saúde da Família/Atenção Básica",
      "Enfermagem do Trabalho",
      "Gestão em Enfermagem",
      "Enfermagem Home Care",
    ],
    enjoysOptions: [
      "Cuidar diretamente de pacientes",
      "Trabalhar em equipe multiprofissional",
      "Lidar com emergências e decisões rápidas",
      "Realizar procedimentos técnicos (curativos, medicação)",
      "Orientar pacientes e famílias",
      "Organizar rotinas e protocolos de cuidado",
    ],
    priorExperienceOptions: [
      "Estágio em hospital/UBS",
      "Curso técnico em enfermagem",
      "Voluntariado em saúde",
      "Cuidado familiar de doente/idoso",
      "Socorrista/brigadista",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Exige registro no COREN (Conselho Regional de Enfermagem). Especializações costumam vir de pós-graduação lato sensu ou residência multiprofissional, não de um exame de ordem único.",
  },
  {
    slug: "odontologia",
    label: "Odontologia",
    description: "Descubra qual especialidade odontológica mais combina com você.",
    subareas: [
      "Clínica Geral",
      "Ortodontia",
      "Endodontia",
      "Odontopediatria",
      "Cirurgia Bucomaxilofacial",
      "Implantodontia",
      "Estética/Prótese Dentária",
      "Saúde Coletiva/Odontologia Social",
    ],
    enjoysOptions: [
      "Realizar procedimentos manuais de precisão",
      "Cuidar diretamente de pacientes",
      "Resolver problemas estéticos e funcionais",
      "Explicar tratamentos para pacientes ansiosos",
      "Trabalhar com tecnologia e equipamentos",
      "Gerir um consultório/negócio próprio",
    ],
    priorExperienceOptions: [
      "Estágio em clínica/consultório",
      "Curso técnico em saúde bucal",
      "Monitoria em disciplina da faculdade",
      "Iniciação científica",
      "Trabalho de atendimento ao público",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Exige registro no CRO (Conselho Regional de Odontologia). Especialidades exigem título de especialista via curso reconhecido pelo CFO ou residência.",
  },
  {
    slug: "farmacia",
    label: "Farmácia",
    description: "Descubra qual caminho da farmácia mais combina com você.",
    subareas: [
      "Farmácia Clínica/Hospitalar",
      "Farmácia Comunitária",
      "Indústria Farmacêutica",
      "Análises Clínicas",
      "Manipulação/Farmácia Magistral",
      "Vigilância Sanitária",
      "Pesquisa e Desenvolvimento",
    ],
    enjoysOptions: [
      "Trabalhar com química e precisão técnica",
      "Orientar pacientes sobre medicamentos",
      "Analisar exames e resultados laboratoriais",
      "Pesquisar e desenvolver novos produtos",
      "Garantir conformidade com normas sanitárias",
      "Atender e explicar informações ao público",
    ],
    priorExperienceOptions: [
      "Estágio em farmácia/drogaria",
      "Estágio em laboratório de análises",
      "Iniciação científica",
      "Curso técnico em química/farmácia",
      "Trabalho de atendimento ao público",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Exige registro no CRF (Conselho Regional de Farmácia). Indústria farmacêutica e análises clínicas costumam valorizar pós-graduação/especialização além do registro básico.",
  },
  {
    slug: "fisioterapia",
    label: "Fisioterapia",
    description: "Descubra qual área da fisioterapia mais combina com você.",
    subareas: [
      "Ortopedia/Traumatologia",
      "Neurologia",
      "Fisioterapia Esportiva",
      "Fisioterapia Respiratória",
      "Pediatria",
      "Geriatria",
      "Estética",
    ],
    enjoysOptions: [
      "Cuidar diretamente de pacientes",
      "Trabalhar com movimento e reabilitação do corpo",
      "Acompanhar evolução de tratamentos a longo prazo",
      "Atuar com esporte e performance física",
      "Explicar exercícios e cuidados para pacientes",
      "Realizar procedimentos manuais/técnicos",
    ],
    priorExperienceOptions: [
      "Estágio em clínica/hospital",
      "Prática esportiva relevante",
      "Voluntariado com idosos/PCD",
      "Iniciação científica",
      "Trabalho como cuidador",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Exige registro no CREFITO (Conselho Regional de Fisioterapia e Terapia Ocupacional). Especialidades como esportiva costumam pedir vivência prática/estágio em clubes além do registro.",
  },
  {
    slug: "nutricao",
    label: "Nutrição",
    description: "Descubra qual frente da nutrição mais combina com você.",
    subareas: [
      "Nutrição Clínica",
      "Nutrição Esportiva",
      "Nutrição Materno-Infantil",
      "Gestão de Unidades de Alimentação",
      "Saúde Coletiva/Políticas Públicas",
      "Indústria de Alimentos",
      "Nutrição Estética",
    ],
    enjoysOptions: [
      "Orientar pessoas sobre hábitos e saúde",
      "Analisar exames e montar planos individuais",
      "Trabalhar com esporte e performance",
      "Pesquisar sobre alimentos e nutrientes",
      "Gerir cozinhas/refeitórios institucionais",
      "Explicar conceitos técnicos de forma simples",
    ],
    priorExperienceOptions: [
      "Estágio em clínica/hospital",
      "Estágio em unidade de alimentação",
      "Interesse pessoal por alimentação/esporte",
      "Iniciação científica",
      "Curso livre de nutrição/gastronomia",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Exige registro no CRN (Conselho Regional de Nutricionistas). Nutrição esportiva e estética costumam exigir especialização além da graduação.",
  },
  {
    slug: "psicologia",
    label: "Psicologia",
    description: "Descubra qual área da psicologia mais combina com você.",
    subareas: [
      "Clínica/Psicoterapia",
      "Psicologia Organizacional/RH",
      "Psicologia Escolar",
      "Psicologia Hospitalar",
      "Neuropsicologia",
      "Psicologia Social/Comunitária",
      "Psicologia Jurídica",
    ],
    enjoysOptions: [
      "Escutar e acolher pessoas",
      "Investigar comportamentos e processos mentais",
      "Trabalhar em ambiente corporativo com pessoas",
      "Lidar com crianças/adolescentes",
      "Pesquisar e estudar casos complexos",
      "Mediar conflitos e relações",
    ],
    priorExperienceOptions: [
      "Estágio em clínica/consultório",
      "Estágio em RH/organizações",
      "Voluntariado em apoio emocional",
      "Monitoria/iniciação científica",
      "Experiência com educação infantil",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Exige registro no CRP (Conselho Regional de Psicologia). Clínica exige título de psicoterapeuta reconhecido; psicologia organizacional costuma dialogar diretamente com RH.",
  },
  {
    slug: "veterinaria",
    label: "Medicina Veterinária",
    description: "Descubra qual área da veterinária mais combina com você.",
    subareas: [
      "Clínica de Pequenos Animais",
      "Clínica de Grandes Animais/Agropecuária",
      "Cirurgia Veterinária",
      "Saúde Pública/Vigilância Sanitária",
      "Pesquisa/Zootecnia",
      "Vida Selvagem/Zoológicos",
      "Nutrição Animal",
    ],
    enjoysOptions: [
      "Cuidar diretamente de animais",
      "Realizar procedimentos manuais/cirúrgicos",
      "Investigar causas de doenças e diagnosticar",
      "Trabalhar em campo/fazenda",
      "Pesquisar e estudar casos complexos",
      "Orientar tutores/produtores rurais",
    ],
    priorExperienceOptions: [
      "Estágio em clínica veterinária",
      "Vivência em propriedade rural/produção animal",
      "Voluntariado com animais/ONGs",
      "Iniciação científica",
      "Trabalho com pets (pet shop, adestramento)",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Exige registro no CRMV (Conselho Regional de Medicina Veterinária). Grandes animais/agropecuária costuma dialogar com engenharia agronômica e zootecnia no dia a dia de campo.",
  },
  {
    slug: "educacao-fisica",
    label: "Educação Física",
    description: "Descubra qual caminho da educação física mais combina com você.",
    subareas: [
      "Personal Trainer/Academia",
      "Educação Física Escolar",
      "Treinamento Esportivo",
      "Fisiologia do Exercício/Performance",
      "Lazer e Recreação",
      "Reabilitação Física",
      "Gestão Esportiva",
    ],
    enjoysOptions: [
      "Praticar e ensinar atividades físicas",
      "Acompanhar evolução de treinos e resultados",
      "Trabalhar com crianças/adolescentes em movimento",
      "Planejar treinos e estratégias esportivas",
      "Cuidar da saúde e prevenção de lesões",
      "Organizar eventos e atividades em grupo",
    ],
    priorExperienceOptions: [
      "Prática esportiva relevante/atleta",
      "Estágio em academia/clube",
      "Monitoria em aula de educação física",
      "Curso de instrutor/personal",
      "Voluntariado em projetos esportivos sociais",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Exige registro no CREF (Conselho Regional de Educação Física). Personal trainer autônomo e docência escolar têm caminhos de contratação bem diferentes, mas ambos passam pelo registro.",
  },
  {
    slug: "arquitetura",
    label: "Arquitetura e Urbanismo",
    description: "Descubra qual frente da arquitetura mais combina com você.",
    subareas: [
      "Arquitetura Residencial/Comercial",
      "Urbanismo/Planejamento Urbano",
      "Paisagismo",
      "Design de Interiores",
      "Arquitetura de Restauro/Patrimônio",
      "Gestão de Obras",
      "Sustentabilidade/Arquitetura Verde",
    ],
    enjoysOptions: [
      "Projetar e desenhar espaços",
      "Trabalhar com softwares de projeto/3D",
      "Visitar e acompanhar obras em campo",
      "Resolver problemas técnicos e estruturais",
      "Apresentar e defender projetos para clientes",
      "Pensar em cidades e espaços coletivos",
    ],
    priorExperienceOptions: [
      "Estágio em escritório de arquitetura",
      "Projetos acadêmicos/maquetes",
      "Cursos de softwares de projeto (CAD, Revit, SketchUp)",
      "Experiência em obra/construção civil",
      "Portfólio pessoal de projetos",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Exige registro no CAU (Conselho de Arquitetura e Urbanismo) e ART/RRT para assinar projetos. Portfólio de projetos é decisivo na contratação, mesmo com o registro obrigatório.",
  },
  {
    slug: "biologicas",
    label: "Ciências Biológicas",
    description: "Descubra qual caminho das ciências biológicas mais combina com você.",
    subareas: [
      "Pesquisa/Academia",
      "Biotecnologia",
      "Meio Ambiente/Conservação",
      "Ensino de Biologia",
      "Biologia Marinha",
      "Genética",
      "Consultoria Ambiental",
    ],
    enjoysOptions: [
      "Pesquisar e estudar seres vivos e ecossistemas",
      "Trabalhar em laboratório",
      "Ir a campo (mata, praia, rio) para coleta de dados",
      "Ensinar e explicar conceitos científicos",
      "Analisar dados e resultados de experimentos",
      "Atuar em conservação e sustentabilidade",
    ],
    priorExperienceOptions: [
      "Iniciação científica",
      "Estágio em laboratório",
      "Voluntariado ambiental/ONG",
      "Monitoria em disciplina da faculdade",
      "Interesse pessoal por natureza/animais",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Exige registro no CRBio (Conselho Regional de Biologia) para atuar como biólogo(a). Pesquisa/academia costuma exigir mestrado/doutorado além do registro.",
  },
  {
    slug: "agronomia",
    label: "Agronomia e Ciências Agrárias",
    description: "Descubra qual frente do agro mais combina com você.",
    subareas: [
      "Produção Agrícola",
      "Zootecnia/Produção Animal",
      "Agronegócio/Gestão Rural",
      "Engenharia Florestal",
      "Solos e Fertilidade",
      "Defensivos/Fitossanidade",
      "Sustentabilidade e Agroecologia",
    ],
    enjoysOptions: [
      "Trabalhar em campo/propriedade rural",
      "Resolver problemas técnicos de produção",
      "Pesquisar e testar novas técnicas",
      "Cuidar de plantas ou animais",
      "Gerir negócios e processos produtivos",
      "Pensar em sustentabilidade e meio ambiente",
    ],
    priorExperienceOptions: [
      "Vivência em propriedade rural/família produtora",
      "Estágio em cooperativa/empresa do agro",
      "Iniciação científica",
      "Curso técnico agrícola",
      "Trabalho manual/técnico em outra área",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Exige registro no CREA como as demais engenharias. Agronegócio/gestão rural é a exceção que costuma valorizar mais resultado prático de campo do que o registro em si.",
  },
  {
    slug: "exatas",
    label: "Matemática, Estatística e Física",
    description: "Descubra qual caminho das ciências exatas mais combina com você.",
    subareas: [
      "Ensino de Matemática/Física",
      "Estatística/Ciência de Dados",
      "Pesquisa Acadêmica",
      "Física Aplicada/Instrumentação",
      "Atuária",
      "Modelagem Matemática/Finanças Quantitativas",
    ],
    enjoysOptions: [
      "Resolver problemas lógicos e abstratos",
      "Analisar dados e números a fundo",
      "Ensinar e explicar conceitos complexos",
      "Pesquisar e demonstrar teoremas/modelos",
      "Programar e modelar sistemas",
      "Trabalhar com previsões e cálculos de risco",
    ],
    priorExperienceOptions: [
      "Olimpíadas de matemática/ciências",
      "Monitoria em disciplina exata",
      "Iniciação científica",
      "Cursos de programação/estatística",
      "Aulas particulares dadas",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Sem conselho regulador geral. Docência exige licenciatura; carreiras quantitativas (atuária) valorizam certificação própria do IBA (Instituto Brasileiro de Atuária) além da graduação.",
  },
  {
    slug: "letras",
    label: "Letras, Tradução e Idiomas",
    description: "Descubra qual caminho de letras e idiomas mais combina com você.",
    subareas: [
      "Tradução/Interpretação",
      "Ensino de Idiomas",
      "Revisão e Editoração de Texto",
      "Linguística Aplicada",
      "Literatura/Crítica Literária",
      "Legendagem/Localização",
    ],
    enjoysOptions: [
      "Trabalhar com idiomas e tradução",
      "Ler e analisar textos a fundo",
      "Ensinar idiomas/gramática",
      "Escrever e revisar com precisão",
      "Pesquisar sobre linguagem e cultura",
      "Adaptar conteúdo entre línguas/culturas",
    ],
    priorExperienceOptions: [
      "Intercâmbio/vivência em outro idioma",
      "Aulas particulares de idioma dadas",
      "Freelances de tradução/revisão",
      "Monitoria em disciplina de línguas",
      "Certificações de proficiência",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Sem conselho regulador. Docência exige licenciatura; tradução juramentada exige aprovação em concurso público da Junta Comercial do estado, diferente da tradução livre.",
  },
  {
    slug: "humanas",
    label: "História, Geografia e Ciências Sociais",
    description: "Descubra qual caminho das humanidades mais combina com você.",
    subareas: [
      "Pesquisa Acadêmica",
      "Ensino de História/Geografia",
      "Patrimônio Histórico/Museus",
      "Geoprocessamento/Cartografia",
      "Antropologia/Sociologia Aplicada",
      "Políticas Públicas",
    ],
    enjoysOptions: [
      "Pesquisar sobre sociedade, cultura e território",
      "Ensinar e explicar conceitos para outras pessoas",
      "Analisar dados sociais e demográficos",
      "Trabalhar com mapas e geoprocessamento",
      "Preservar e estudar patrimônio histórico",
      "Debater e escrever sobre temas sociais",
    ],
    priorExperienceOptions: [
      "Iniciação científica/pesquisa",
      "Monitoria em disciplina de humanas",
      "Voluntariado em projeto social/cultural",
      "Produção de conteúdo sobre história/sociedade",
      "Estágio em museu/instituição cultural",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Sem conselho regulador. Docência exige licenciatura; pesquisa/museus/órgãos públicos costumam contratar via concurso público ou processo seletivo específico.",
  },
  {
    slug: "servico-social",
    label: "Serviço Social e Relações Internacionais",
    description: "Descubra qual caminho social/internacional mais combina com você.",
    subareas: [
      "Serviço Social em Saúde/Assistência",
      "Políticas Públicas Sociais",
      "ONGs e Terceiro Setor",
      "Relações Internacionais",
      "Diplomacia/Carreira Pública",
      "Comércio Exterior",
      "Direitos Humanos",
    ],
    enjoysOptions: [
      "Ajudar diretamente comunidades e pessoas vulneráveis",
      "Analisar políticas públicas e seus impactos",
      "Trabalhar com temas internacionais/geopolítica",
      "Mediar conflitos e negociar acordos",
      "Planejar e executar projetos sociais",
      "Debater e escrever sobre direitos e cidadania",
    ],
    priorExperienceOptions: [
      "Voluntariado social/ONG",
      "Estágio em assistência social/CRAS",
      "Participação em modelo de ONU/debates",
      "Intercâmbio ou vivência internacional",
      "Monitoria/iniciação científica",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Serviço Social exige registro no CRESS (Conselho Regional de Serviço Social). Diplomacia/carreira pública em Relações Internacionais passa pelo concurso do Instituto Rio Branco, um dos mais concorridos do país.",
  },
  {
    slug: "artes",
    label: "Artes Visuais, Cênicas e Música",
    description: "Descubra qual linguagem artística mais combina com você.",
    subareas: [
      "Artes Visuais/Plásticas",
      "Teatro/Artes Cênicas",
      "Música (Performance/Composição)",
      "Dança",
      "Produção Cultural",
      "Arte-Educação",
      "Curadoria/Gestão Cultural",
    ],
    enjoysOptions: [
      "Criar e se expressar artisticamente",
      "Se apresentar ou performar para um público",
      "Ensinar e compartilhar técnicas artísticas",
      "Produzir e organizar eventos culturais",
      "Pesquisar história da arte/referências",
      "Trabalhar em projetos colaborativos criativos",
    ],
    priorExperienceOptions: [
      "Prática artística própria (banda, peça, ateliê)",
      "Cursos livres de arte/música/teatro",
      "Participação em grupos/companhias",
      "Produção de eventos culturais",
      "Portfólio de trabalhos artísticos",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Sem conselho regulador geral. Portfólio, editais culturais (leis de incentivo) e participação em grupos/coletivos costumam pesar mais do que diploma formal.",
  },
  {
    slug: "moda",
    label: "Moda",
    description: "Descubra qual frente da moda mais combina com você.",
    subareas: [
      "Estilismo/Criação",
      "Modelagem e Costura",
      "Consultoria de Imagem",
      "Marketing de Moda",
      "Produção de Moda/Eventos",
      "Moda Sustentável",
    ],
    enjoysOptions: [
      "Criar e desenhar peças/coleções",
      "Trabalhar com tecidos e costura",
      "Acompanhar tendências e comportamento",
      "Produzir editoriais/desfiles",
      "Orientar pessoas sobre estilo pessoal",
      "Pensar em moda com responsabilidade ambiental",
    ],
    priorExperienceOptions: [
      "Projetos pessoais de costura/estilismo",
      "Estágio em ateliê/marca",
      "Cursos livres de moda",
      "Produção de conteúdo de moda nas redes",
      "Freelances de styling/consultoria",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Sem conselho regulador. Portfólio de peças/coleções é o principal ativo de carreira, tanto para marcas quanto para trabalho autônomo/freelance.",
  },
  {
    slug: "gastronomia-turismo",
    label: "Gastronomia, Hotelaria e Turismo",
    description: "Descubra qual frente de gastronomia e turismo mais combina com você.",
    subareas: [
      "Chef de Cozinha/Confeitaria",
      "Gestão de Restaurantes",
      "Hotelaria",
      "Guia/Operação Turística",
      "Eventos",
      "Enologia/Bebidas",
    ],
    enjoysOptions: [
      "Cozinhar e criar receitas",
      "Atender e cuidar da experiência do cliente",
      "Organizar eventos e roteiros",
      "Gerenciar equipe e operação de cozinha/hotel",
      "Viajar e conhecer novos lugares/culturas",
      "Trabalhar em ritmo acelerado (rush de serviço)",
    ],
    priorExperienceOptions: [
      "Estágio/trabalho em restaurante ou hotel",
      "Cursos livres de gastronomia",
      "Experiência em atendimento ao público",
      "Produção de conteúdo culinário/viagem",
      "Trabalho em eventos",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Sem conselho regulador amplo. Guias de turismo dependem de cadastro no Cadastur; chefs e gestores de restaurante/hotel são contratados principalmente por experiência prática, não por diploma.",
  },
  {
    slug: "audiovisual",
    label: "Cinema, TV e Audiovisual",
    description: "Descubra qual frente do audiovisual mais combina com você.",
    subareas: [
      "Direção/Roteiro",
      "Produção Audiovisual",
      "Edição e Pós-produção",
      "Fotografia/Cinematografia",
      "Animação",
      "Som/Trilha Sonora",
    ],
    enjoysOptions: [
      "Contar histórias em vídeo/imagem",
      "Editar e montar conteúdo audiovisual",
      "Organizar e produzir gravações",
      "Trabalhar com câmera e enquadramento",
      "Criar roteiros e narrativas",
      "Trabalhar com som e trilha sonora",
    ],
    priorExperienceOptions: [
      "Produção de vídeos/curtas próprios",
      "Canal ou perfil de conteúdo audiovisual",
      "Estágio em produtora",
      "Cursos livres de edição/produção",
      "Participação em produções acadêmicas",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Sem conselho regulador. Reel/portfólio de projetos é o principal critério de contratação, tanto em produtora quanto como freelancer.",
  },
  {
    slug: "seguranca-publica",
    label: "Segurança Pública e Carreiras Militares",
    description: "Descubra qual carreira de segurança pública mais combina com você.",
    subareas: [
      "Polícia Civil/Investigação",
      "Polícia Militar",
      "Bombeiros",
      "Forças Armadas",
      "Perícia Criminal",
      "Segurança Privada/Compliance",
    ],
    enjoysOptions: [
      "Agir sob pressão e em emergências",
      "Seguir disciplina e hierarquia",
      "Investigar e resolver casos",
      "Proteger e ajudar pessoas em risco",
      "Trabalhar em equipe com protocolos claros",
      "Manter boa condição física",
    ],
    priorExperienceOptions: [
      "Preparação física/esportiva",
      "Curso preparatório para concurso",
      "Experiência em brigada/defesa civil",
      "Vivência militar ou familiar na área",
      "Voluntariado em segurança comunitária",
      "Nenhuma experiência prática ainda",
    ],
    careerNotes:
      "Ingresso é majoritariamente via concurso público, com prova objetiva, teste físico, avaliação psicológica e formação em academia, diferente do processo seletivo de mercado privado das demais áreas.",
  },
];

export function getVocationArea(slug: string): VocationAreaConfig | undefined {
  return VOCATION_AREAS.find((a) => a.slug === slug);
}

/**
 * Tenta identificar a área vocacional a partir de um texto livre (ex: o campo
 * `professionalArea` do usuário, que não é um enum). Usa sobreposição de
 * tokens contra o slug/label/subáreas de cada área; retorna undefined quando
 * não há sinal confiável, em vez de arriscar um match errado.
 */
export function matchAreaSlug(text: string | null | undefined): string | undefined {
  if (!text) return undefined;

  const tokenize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length >= 3);

  const inputTokens = new Set(tokenize(text));
  if (inputTokens.size === 0) return undefined;

  let best: { slug: string; score: number } | undefined;
  for (const area of VOCATION_AREAS) {
    const areaTokens = tokenize(`${area.slug} ${area.label} ${area.subareas.join(" ")}`);
    const score = areaTokens.filter((token) => inputTokens.has(token)).length;
    if (score > 0 && (!best || score > best.score)) best = { slug: area.slug, score };
  }

  return best?.slug;
}
