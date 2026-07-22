import { normalizeCareerSegment, type CareerSegment } from "@/lib/career-segments";

export type ToolIcon =
  | "sparkles"
  | "compass"
  | "filePlus"
  | "linkedin"
  | "github"
  | "scale"
  | "pen"
  | "mic";
export type ToolColor = "blue" | "amber" | "emerald" | "indigo" | "violet" | "rose";

export type ToolCatalogEntry = {
  href: string;
  title: string;
  description: string;
  segments: CareerSegment[];
  icon: ToolIcon;
  color: ToolColor;
  /**
   * Restringe a ferramenta a slugs de VOCATION_AREAS específicos (ex: ["ti", "exatas"]
   * para a Análise de GitHub). Omitido = relevante para qualquer área. Só filtra o
   * usuário para fora quando a área dele é conhecida e não bate com nenhum item da
   * lista; sem sinal de área, a ferramenta continua aparecendo (evita esconder por engano).
   */
  areas?: string[];
  /**
   * Ferramenta aberta: sem login e sem assinatura, indexável pelo Google e com
   * anúncio. Inclui guias e utilidades locais que não custam chamada de IA.
   *
   * Esta flag é a fonte única de verdade: alimenta as rotas públicas do
   * middleware (src/auth.config.ts), o sitemap e o selo "Grátis" no catálogo.
   */
  free?: true;
  accountFree?: true;
};

export const TOOLS_CATALOG: ToolCatalogEntry[] = [
  {
    href: "/tools/ats-checklist",
    title: "Checklist de currículo ATS",
    description: "Revise estrutura, palavras-chave e legibilidade antes de enviar seu currículo.",
    segments: ["first_job", "internship", "apprentice", "student", "career_change", "career_pro"],
    icon: "filePlus",
    color: "emerald",
    free: true,
  },
  {
    href: "/tools/salary-calculator",
    title: "Calculadora de salário e benefícios",
    description: "Compare o valor mensal da proposta, benefícios e valor estimado por hora.",
    segments: ["first_job", "internship", "apprentice", "student", "career_change", "career_pro"],
    icon: "scale",
    color: "amber",
    free: true,
  },
  {
    href: "/tools/interview-questions",
    title: "Perguntas de entrevista por cargo",
    description: "Treine perguntas comuns de entrevista com orientações para estruturar respostas.",
    segments: ["first_job", "internship", "apprentice", "student", "career_change", "career_pro"],
    icon: "mic",
    color: "blue",
    free: true,
  },
  {
    href: "/tools/resume-templates",
    title: "Modelos de currículo por perfil",
    description: "Veja estruturas recomendadas para primeiro emprego, estágio e profissionais experientes.",
    segments: ["first_job", "internship", "apprentice", "student", "career_change", "career_pro"],
    icon: "filePlus",
    color: "violet",
    free: true,
  },
  {
    href: "/tools/cover-letter",
    title: "Carta de apresentação",
    description: "Gere uma carta de apresentação a partir do seu currículo e da vaga.",
    segments: ["first_job", "internship", "apprentice", "student", "career_change", "career_pro"],
    icon: "pen",
    color: "blue",
    accountFree: true,
  },
  {
    href: "/tools/interview-guide",
    title: "Guia de entrevista: postura, portfólio e dress code",
    description: "Como funciona uma entrevista, como se portar, montar portfólio e se vestir.",
    segments: ["first_job", "internship", "apprentice", "student", "career_change", "career_pro"],
    icon: "compass",
    color: "indigo",
    free: true,
  },
  {
    href: "/tools/interview-simulator",
    title: "Simulador de entrevista",
    description: "Responda 5 perguntas reais do seu cargo e receba nota e feedback em cada uma.",
    segments: ["first_job", "internship", "apprentice", "student", "career_change", "career_pro"],
    icon: "mic",
    color: "rose",
    accountFree: true,
  },
  {
    href: "/tools/behavioral-test",
    title: "Teste de soft skills e personalidade",
    description: "Descubra seu perfil comportamental e como usá-lo a seu favor na entrevista.",
    segments: ["first_job", "internship", "apprentice", "student", "career_change", "career_pro"],
    icon: "sparkles",
    color: "violet",
    accountFree: true,
  },
  {
    href: "/tools/first-job-guide",
    title: "Guia completo de primeiro emprego",
    description: "Dicas aprofundadas e passo a passo, com ou sem formação.",
    segments: ["first_job"],
    icon: "compass",
    color: "amber",
    free: true,
  },
  {
    href: "/tools/project-to-experience",
    title: "Transformar projeto em experiência",
    description: "Vire projetos, TCC ou cursos em experiência de currículo.",
    segments: ["first_job", "internship", "student"],
    icon: "sparkles",
    color: "violet",
  },
  {
    href: "/tools/vocation-test",
    title: "Teste vocacional",
    description: "Descubra o caminho certo dentro da sua área, TI, Medicina, Direito e mais.",
    segments: ["student", "career_change", "internship"],
    icon: "compass",
    color: "amber",
  },
  {
    href: "/tools/resume-from-scratch",
    title: "Currículo do zero",
    description: "Ainda não tem currículo? Monte um rascunho completo do zero.",
    segments: ["apprentice", "first_job", "internship", "career_pro"],
    icon: "filePlus",
    color: "emerald",
  },
  {
    href: "/tools/linkedin-review",
    title: "Análise de LinkedIn",
    description: "Receba sugestões de headline e seção sobre.",
    segments: ["first_job", "internship", "career_change", "career_pro"],
    icon: "linkedin",
    color: "blue",
  },
  {
    href: "/tools/github-review",
    title: "Análise de GitHub",
    description: "Descubra quais repositórios destacar no currículo.",
    segments: ["first_job", "internship", "student", "career_change"],
    icon: "github",
    color: "indigo",
    areas: ["ti", "exatas"],
  },
  {
    href: "/tools/compare-jobs",
    title: "Comparador de vagas",
    description: "Compare 2 a 4 vagas e veja qual faz mais sentido aplicar agora.",
    segments: ["internship", "career_change", "career_pro"],
    icon: "scale",
    color: "rose",
  },
  {
    href: "/tools/schedule-conflict-checker",
    title: "Conflito de horário: aula x estágio",
    description: "Cruze sua grade de aulas com o horário do estágio antes de aceitar a proposta.",
    segments: ["internship", "student", "apprentice"],
    icon: "compass",
    color: "violet",
    accountFree: true,
  },
  {
    href: "/tools/internship-checklist",
    title: "Checklist de documentos de estágio",
    description: "Termo de compromisso, seguro obrigatório, carga horária e mais, direto da lei.",
    segments: ["internship", "apprentice"],
    icon: "filePlus",
    color: "amber",
    accountFree: true,
  },
  {
    href: "/tools/profile-from-scratch",
    title: "Monte seu perfil do zero",
    description: "Ainda não tem LinkedIn nem GitHub? Gere headline, sobre e bio prontos.",
    segments: ["internship", "student", "apprentice"],
    icon: "sparkles",
    color: "indigo",
  },
  {
    href: "/tools/internship-calculator",
    title: "Calculadora de bolsa-auxílio",
    description: "Compare propostas de estágio (bolsa + VT + VR) e veja o valor real por hora.",
    segments: ["internship", "student", "apprentice"],
    icon: "scale",
    color: "emerald",
    free: true,
  },
  {
    href: "/tools/essay-grader",
    title: "Corretor de redação",
    description: "Cole sua redação e receba nota estimada nas 5 competências do ENEM.",
    segments: ["student"],
    icon: "pen",
    color: "blue",
  },
  {
    href: "/tools/essay-showcase",
    title: "Mostra de redações nota 1000",
    description: "Redações modelo com nota comentada competência por competência.",
    segments: ["student"],
    icon: "pen",
    color: "rose",
    free: true,
  },
  {
    href: "/tools/career-guide",
    title: "Guia do estudante",
    description: "Rotina real, salário e habilidades técnicas e comportamentais por área.",
    segments: ["student"],
    icon: "compass",
    color: "indigo",
    free: true,
  },
  {
    href: "/tools/entrepreneurship-tips",
    title: "Dicas de empreendedorismo",
    description: "Da ideia ao primeiro cliente: valide, venda e formalize seu negócio.",
    segments: ["student", "first_job", "apprentice"],
    icon: "sparkles",
    color: "emerald",
    free: true,
  },
  {
    href: "/tools/internship-guide",
    title: "Guia completo do estágio",
    description: "Da primeira candidatura à efetivação, portfólio, LinkedIn, cursos e dinheiro.",
    segments: ["internship"],
    icon: "compass",
    color: "indigo",
    free: true,
  },
  {
    href: "/tools/apprentice-guide",
    title: "Guia do Jovem Aprendiz",
    description: "Direitos e deveres, comportamento, escola, dinheiro e efetivação.",
    segments: ["apprentice"],
    icon: "scale",
    color: "indigo",
    free: true,
  },
  {
    href: "/tools/apprentice-companies",
    title: "Empresas e vagas de Jovem Aprendiz",
    description: "Onde se cadastrar e quais setores mais contratam aprendizes.",
    segments: ["apprentice"],
    icon: "compass",
    color: "blue",
    free: true,
  },
  {
    href: "/tools/career-change-guide",
    title: "Guia completo de transição de carreira",
    description: "Do planejamento ao cargo-ponte certo, como trocar de área sem começar do zero.",
    segments: ["career_change"],
    icon: "compass",
    color: "amber",
    free: true,
  },
  {
    href: "/tools/apprentice-areas",
    title: "Áreas e cursos por área",
    description: "Onde um jovem aprendiz pode atuar e cursos gratuitos por área.",
    segments: ["apprentice"],
    icon: "filePlus",
    color: "amber",
    free: true,
  },
  {
    href: "/tools/reemployment-guide",
    title: "Guia completo de recolocação",
    description: "Do desligamento à próxima oferta, estratégia, rede e como sustentar a motivação na busca.",
    segments: ["career_pro"],
    icon: "compass",
    color: "rose",
    free: true,
  },
  {
    href: "/tools/career-growth-guide",
    title: "Guia completo de crescimento de carreira",
    description: "Promoção interna ou troca de empresa, como subir de senioridade com estratégia.",
    segments: ["career_pro"],
    icon: "compass",
    color: "emerald",
    free: true,
  },
  {
    href: "/tools/concurso/plano-de-estudo",
    title: "Plano de estudo por edital",
    description: "Cole o edital e receba um ciclo de estudos por peso das matérias, no estilo da sua banca.",
    segments: ["concurseiro", "oab"],
    icon: "compass",
    color: "indigo",
  },
  {
    href: "/tools/concurso/simulado",
    title: "Simulado por banca e disciplina",
    description: "Gere questões no formato da sua banca (CESPE, FGV, FCC) com gabarito comentado.",
    segments: ["concurseiro", "oab"],
    icon: "pen",
    color: "blue",
  },
  {
    href: "/tools/concurso/nota-de-corte",
    title: "Estimativa de nota de corte",
    description: "Uma referência realista de onde você precisa chegar para o seu cargo e concurso.",
    segments: ["concurseiro"],
    icon: "scale",
    color: "amber",
  },
  {
    href: "/tools/oab/segunda-fase",
    title: "Corretor de peça e discursivas (OAB 2ª fase)",
    description: "Cole sua peça prático-profissional e receba correção pelos critérios da FGV.",
    segments: ["oab"],
    icon: "pen",
    color: "violet",
  },
];

/** Rotas das ferramentas abertas (ver `free` em ToolCatalogEntry). */
export const FREE_TOOL_PATHS = TOOLS_CATALOG.filter((t) => t.free).map((t) => t.href);

/** Se a rota é de uma ferramenta aberta (sem login nem assinatura). */
export function isFreeTool(href: string): boolean {
  return TOOLS_CATALOG.some((t) => t.href === href && t.free);
}

export function toolsForSegment(
  segment: string | CareerSegment | null | undefined,
  userAreaSlug?: string | null
) {
  const areaFiltered = TOOLS_CATALOG.filter(
    (t) => !t.areas || !userAreaSlug || t.areas.includes(userAreaSlug)
  );
  const normalizedSegment = normalizeCareerSegment(segment);
  if (!normalizedSegment) return { recommended: [] as ToolCatalogEntry[], others: areaFiltered };
  return {
    recommended: areaFiltered.filter((t) => t.segments.includes(normalizedSegment)),
    others: areaFiltered.filter((t) => !t.segments.includes(normalizedSegment)),
  };
}
