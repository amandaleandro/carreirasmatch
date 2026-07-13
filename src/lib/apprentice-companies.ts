export type ApprenticeOrganization = {
  name: string;
  category: "Agente de integração / entidade formadora" | "Setor que mais contrata" | "Estágio para estudante de ensino médio";
  description: string;
  howToApply: string;
};

export const APPRENTICE_ORGANIZATIONS: ApprenticeOrganization[] = [
  {
    name: "CIEE, Centro de Integração Empresa-Escola",
    category: "Agente de integração / entidade formadora",
    description:
      "Um dos maiores agentes de integração do país, conecta jovens a empresas parceiras em todo o Brasil e oferece a formação teórica exigida por lei.",
    howToApply: "Cadastre-se gratuitamente no site do CIEE e mantenha o perfil atualizado, empresas buscam candidatos direto na base.",
  },
  {
    name: "IEL, Instituto Euvaldo Lodi",
    category: "Agente de integração / entidade formadora",
    description:
      "Ligado ao sistema da indústria (FIEP/CNI), conecta jovens a vagas de aprendizagem principalmente em empresas industriais e do setor produtivo.",
    howToApply: "Faça o cadastro pelo site do IEL da sua região e acompanhe os processos seletivos abertos por estado.",
  },
  {
    name: "SENAI / SENAC",
    category: "Agente de integração / entidade formadora",
    description:
      "Além de oferecerem os cursos teóricos obrigatórios da aprendizagem, muitas unidades também divulgam vagas de empresas parceiras da região.",
    howToApply: "Verifique se a unidade SENAI/SENAC mais próxima tem programa de aprendizagem ativo e faça a matrícula no curso correspondente.",
  },
  {
    name: "Instituto Ayrton Senna e ONGs habilitadas",
    category: "Agente de integração / entidade formadora",
    description:
      "Diversas ONGs certificadas pelo Ministério do Trabalho atuam como entidades formadoras em programas sociais voltados a jovens de comunidades específicas.",
    howToApply: "Pesquise se existe uma entidade habilitada na sua cidade, muitas priorizam jovens de escolas públicas e baixa renda.",
  },
  {
    name: "SINE / Sistema Nacional de Emprego",
    category: "Agente de integração / entidade formadora",
    description:
      "Órgão público que também divulga vagas de aprendizagem, geralmente sem custo e com atendimento presencial para tirar dúvidas.",
    howToApply: "Procure a unidade do SINE mais próxima com RG, CPF e comprovante de matrícula escolar.",
  },
  {
    name: "Bancos (Bradesco, Itaú, Santander, Banco do Brasil, Caixa)",
    category: "Setor que mais contrata",
    description:
      "Grandes bancos têm programas próprios e recorrentes de jovem aprendiz, geralmente para funções administrativas e de atendimento em agências.",
    howToApply: "Acompanhe as páginas de \"carreiras\" e \"programas de aprendizagem\" de cada banco, as inscrições costumam abrir em datas fixas do ano.",
  },
  {
    name: "Redes de varejo (Magazine Luiza, Carrefour, Renner, Riachuelo)",
    category: "Setor que mais contrata",
    description:
      "O varejo é um dos setores que mais contrata aprendizes, geralmente para funções de atendimento, estoque e apoio administrativo em lojas físicas.",
    howToApply: "Vagas costumam ser divulgadas direto pela loja física ou pelos agentes de integração parceiros (CIEE, IEL) da região.",
  },
  {
    name: "Indústrias e montadoras",
    category: "Setor que mais contrata",
    description:
      "Empresas industriais contratam aprendizes com frequência via IEL e SENAI, geralmente para áreas técnicas, administrativas e de produção.",
    howToApply: "Verifique se há polo industrial na sua região e cadastre-se no IEL local, muitas vagas nem chegam a ser divulgadas fora dessa base.",
  },
  {
    name: "CIEE, Programa de Estágio para Ensino Médio",
    category: "Estágio para estudante de ensino médio",
    description:
      "Além do jovem aprendiz, o CIEE também intermedia vagas de estágio (Lei 11.788/2008) para quem cursa o ensino médio técnico/profissionalizante, com carga horária reduzida compatível com a escola.",
    howToApply: "Cadastre-se no site do CIEE informando que está cursando o ensino médio técnico, o sistema já filtra as vagas de estágio compatíveis com essa etapa.",
  },
  {
    name: "NUBE",
    category: "Estágio para estudante de ensino médio",
    description:
      "Plataforma de estágios que reúne vagas de diversas empresas parceiras, incluindo oportunidades para estudantes de ensino médio técnico em áreas administrativas e de tecnologia.",
    howToApply: "Crie um perfil gratuito na NUBE, complete o currículo e ative alertas para vagas compatíveis com estudantes de ensino médio.",
  },
  {
    name: "Estágio.com / Cia de Estágios",
    category: "Estágio para estudante de ensino médio",
    description:
      "Plataformas especializadas em conectar estudantes (incluindo ensino médio técnico) a empresas que abrem vagas de estágio com carga horária reduzida.",
    howToApply: "Cadastre currículo e filtre as buscas por \"ensino médio\" ou \"técnico\" para ver só as vagas compatíveis com sua etapa escolar.",
  },
  {
    name: "Escolas técnicas estaduais e institutos federais (IFs)",
    category: "Estágio para estudante de ensino médio",
    description:
      "Quem estuda em escola técnica ou instituto federal (curso técnico integrado ou concomitante) costuma ter uma coordenação de estágios própria, com parcerias diretas com empresas da região.",
    howToApply: "Procure a coordenação de estágios ou o setor de relações empresariais da sua escola técnica/IF, muitas vagas circulam só internamente, sem passar por plataforma nenhuma.",
  },
];

export const HIGH_SCHOOL_INTERNSHIP_NOTE =
  "Estágio (Lei 11.788/2008) é diferente de Jovem Aprendiz (CLT). Quem cursa o ensino médio técnico/profissionalizante (integrado, concomitante ou no IF) pode fazer estágio não obrigatório desde os 16 anos. Já quem está no ensino médio regular, sem curso técnico, normalmente só se qualifica para estágio depois que entrar na faculdade, antes disso, o caminho mais comum é o programa de Jovem Aprendiz.";

export type FindApprenticeJobTip = {
  title: string;
  description: string;
};

export const FIND_APPRENTICE_JOBS_TIPS: FindApprenticeJobTip[] = [
  {
    title: "Cadastre-se em mais de um agente de integração",
    description: "CIEE, IEL e SINE têm bases diferentes de empresas parceiras, estar em mais de um aumenta suas chances.",
  },
  {
    title: "Siga as páginas oficiais das empresas que você quer",
    description: "Muitos programas de aprendizagem anunciam abertura de inscrições primeiro nas redes sociais e páginas de carreira.",
  },
  {
    title: "Peça para a escola indicar parcerias",
    description: "Escolas e coordenações pedagógicas às vezes têm parcerias diretas com entidades formadoras da região.",
  },
  {
    title: "Use o feed de vagas para achar oportunidades reais agora",
    description: "Veja vagas de jovem aprendiz filtradas para o seu perfil direto na plataforma.",
  },
];
