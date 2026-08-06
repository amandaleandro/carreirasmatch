import type { CareerSegment } from "@/lib/career-segments";

export type ObjectiveShortcut = { title: string; description: string; href: string };

export type OnboardingObjective = {
  value: string;
  label: string;
  /** Ação recomendada mostrada na etapa de resultado do onboarding. */
  cta: { label: string; href: string };
  /** Atalhos específicos para este objetivo, mostrados no dashboard com prioridade
   * sobre os atalhos genéricos por segmento (toolsForSegment). */
  shortcuts: ObjectiveShortcut[];
};

/** Objetivos possíveis por momento profissional (etapa 2 do onboarding), cada um já
 * apontando para a ação recomendada exibida na etapa de resultado (etapa 6). */
export const OBJECTIVE_OPTIONS_BY_SEGMENT: Record<CareerSegment, OnboardingObjective[]> = {
  apprentice: [
    {
      value: "first_apprentice_job",
      label: "Conseguir minha primeira vaga de aprendiz",
      cta: { label: "Criar meu currículo", href: "/curriculo-sem-experiencia" },
      shortcuts: [
        { title: "Criar meu currículo", description: "Currículo do zero para quem ainda não tem experiência.", href: "/curriculo-sem-experiencia" },
        { title: "Empresas que contratam aprendizes", description: "Lista de empresas com programas ativos de Jovem Aprendiz.", href: "/tools/apprentice-companies" },
        { title: "Ver vagas de estágio e aprendiz", description: "Oportunidades compatíveis com o seu perfil.", href: "/todas-as-vagas" },
      ],
    },
    {
      value: "understand_apprentice_journey",
      label: "Entender como funciona a jornada de aprendiz",
      cta: { label: "Ver guia do Jovem Aprendiz", href: "/tools/apprentice-guide" },
      shortcuts: [
        { title: "Guia do Jovem Aprendiz", description: "Direitos, deveres e como funciona o contrato de aprendizagem.", href: "/tools/apprentice-guide" },
        { title: "Áreas para começar", description: "Áreas mais comuns para o primeiro contato com o mercado.", href: "/tools/apprentice-areas" },
      ],
    },
  ],
  first_job: [
    {
      value: "build_first_resume",
      label: "Criar meu primeiro currículo",
      cta: { label: "Montar meu currículo", href: "/curriculo-sem-experiencia" },
      shortcuts: [
        { title: "Montar meu currículo", description: "Currículo do zero, sem precisar de experiência formal.", href: "/curriculo-sem-experiencia" },
        { title: "Guia do primeiro emprego", description: "Como se apresentar mesmo sem carteira assinada.", href: "/tools/first-job-guide" },
        { title: "Transformar projetos em experiência", description: "Projetos pessoais e da escola contam como experiência.", href: "/tools/project-to-experience" },
      ],
    },
    {
      value: "analyze_for_job",
      label: "Já tenho currículo, quero analisar para uma vaga",
      cta: { label: "Analisar currículo e vaga", href: "/analise" },
      shortcuts: [
        { title: "Analisar currículo e vaga", description: "Veja sua aderência real à vaga desejada.", href: "/analise" },
        { title: "Verificar ATS", description: "Confira se seu currículo passa pelos filtros automáticos.", href: "/verificador-ats" },
      ],
    },
  ],
  internship: [
    {
      value: "find_internships",
      label: "Encontrar vagas de estágio",
      cta: { label: "Ver vagas de estágio", href: "/todas-as-vagas" },
      shortcuts: [
        { title: "Ver vagas de estágio", description: "Oportunidades de estágio compatíveis com seu curso.", href: "/todas-as-vagas" },
        { title: "Checklist de estágio", description: "O que preparar antes de se candidatar.", href: "/tools/internship-checklist" },
        { title: "Calculadora de bolsa-auxílio", description: "Estime valores e carga horária do estágio.", href: "/tools/internship-calculator" },
      ],
    },
    {
      value: "adjust_resume_internship",
      label: "Ajustar meu currículo para estágio",
      cta: { label: "Ajustar meu currículo", href: "/curriculo-sem-experiencia" },
      shortcuts: [
        { title: "Ajustar meu currículo", description: "Destaque projetos acadêmicos como experiência prática.", href: "/curriculo-sem-experiencia" },
        { title: "Guia de estágio", description: "Como se destacar em um processo seletivo de estágio.", href: "/tools/internship-guide" },
      ],
    },
    {
      value: "study_for_university",
      label: "Estudar as disciplinas da minha faculdade",
      cta: { label: "Ir para Minha Faculdade", href: "/universidade" },
      shortcuts: [
        { title: "Minhas disciplinas", description: "Veja como cada disciplina do seu curso se conecta com sua carreira e treine com exercícios.", href: "/universidade" },
      ],
    },
  ],
  student: [
    {
      value: "choose_profession",
      label: "Escolher uma profissão",
      cta: { label: "Fazer teste vocacional", href: "/tools/vocation-test" },
      shortcuts: [
        { title: "Teste vocacional", description: "Descubra áreas com mais aderência ao seu perfil.", href: "/tools/vocation-test" },
        { title: "Descobrir profissões", description: "Explore profissões por área de interesse.", href: "/tools/vocation-test/discover" },
        { title: "Faculdade ou técnico", description: "Compare os dois caminhos para decidir o seu.", href: "/descobrir" },
      ],
    },
    {
      value: "organize_studies",
      label: "Organizar meus estudos",
      cta: { label: "Ir para o Ensino Médio", href: "/ensino-medio" },
      shortcuts: [
        { title: "Cronograma de estudos", description: "Organize sua semana de estudos.", href: "/ensino-medio/cronograma" },
        { title: "Questão do dia", description: "Prática rápida e diária de várias matérias.", href: "/ensino-medio/questao-do-dia" },
        { title: "Simulado", description: "Treine com questões no estilo ENEM/vestibular.", href: "/ensino-medio/simulado" },
      ],
    },
    {
      value: "organize_university",
      label: "Organizar minhas disciplinas da faculdade",
      cta: { label: "Ir para Universidade", href: "/universidade" },
      shortcuts: [
        { title: "Minhas disciplinas", description: "Veja como cada disciplina do seu curso se conecta com sua carreira.", href: "/universidade" },
      ],
    },
    {
      value: "faculdade_ou_tecnico",
      label: "Decidir entre faculdade e curso técnico",
      cta: { label: "Comparar faculdade e técnico", href: "/descobrir" },
      shortcuts: [
        { title: "Comparar faculdade e técnico", description: "Prós, contras e tempo de formação de cada caminho.", href: "/descobrir" },
        { title: "Comparar cursos", description: "Veja o mercado de trabalho por curso.", href: "/tools/vocation-test/college" },
      ],
    },
  ],
  career_change: [
    {
      value: "leverage_experience",
      label: "Descobrir o que já posso aproveitar da minha experiência",
      cta: { label: "Ver minha transição de carreira", href: "/tools/matriz-de-skills" },
      shortcuts: [
        { title: "Minha transição de carreira", description: "Habilidades transferíveis para a nova área.", href: "/tools/matriz-de-skills" },
        { title: "Guia de transição de carreira", description: "Passo a passo para migrar de área com segurança.", href: "/tools/career-change-guide" },
      ],
    },
    {
      value: "resume_for_new_area",
      label: "Criar currículo para a nova área",
      cta: { label: "Montar meu currículo", href: "/resume" },
      shortcuts: [
        { title: "Montar meu currículo", description: "Currículo reposicionado para a área de destino.", href: "/resume" },
        { title: "Carta de apresentação", description: "Explique sua mudança de carreira ao recrutador.", href: "/tools/cover-letter" },
      ],
    },
  ],
  career_pro: [
    {
      value: "improve_applications",
      label: "Melhorar minhas candidaturas",
      cta: { label: "Analisar currículo e vaga", href: "/analise" },
      shortcuts: [
        { title: "Analisar currículo e vaga", description: "Veja sua aderência real à vaga desejada.", href: "/analise" },
        { title: "Comparar vagas", description: "Compare oportunidades lado a lado antes de decidir.", href: "/tools/comparador-vagas" },
        { title: "Guia de recolocação", description: "Estratégia para voltar ao mercado com mais força.", href: "/tools/reemployment-guide" },
      ],
    },
    {
      value: "find_better_matches",
      label: "Buscar vagas com mais aderência",
      cta: { label: "Ver meu feed de vagas", href: "/feed" },
      shortcuts: [
        { title: "Ver meu feed de vagas", description: "Vagas ordenadas pela sua aderência.", href: "/feed" },
        { title: "Todas as vagas", description: "Busca completa sem curadoria de Match.", href: "/todas-as-vagas" },
      ],
    },
    {
      value: "prepare_interviews",
      label: "Me preparar para entrevistas",
      cta: { label: "Treinar entrevista com IA", href: "/tools/interview-simulator" },
      shortcuts: [
        { title: "Treinar entrevista com IA", description: "Simulador de entrevista com feedback.", href: "/tools/interview-simulator" },
        { title: "Perguntas de entrevista", description: "Perguntas mais comuns e como respondê-las.", href: "/tools/interview-questions" },
        { title: "Calculadora salarial", description: "Prepare-se para negociar sua próxima proposta.", href: "/tools/salary-calculator" },
      ],
    },
    {
      value: "grow_in_current_job",
      label: "Crescer na minha empresa atual",
      cta: { label: "Montar meu plano de evolução", href: "/evolucao" },
      shortcuts: [
        { title: "Plano de evolução profissional", description: "Gaps, plano de desenvolvimento e argumentos de promoção.", href: "/evolucao" },
        { title: "Guia de crescimento de carreira", description: "Como construir o caso para a próxima promoção.", href: "/tools/career-growth-guide" },
        { title: "Calculadora salarial", description: "Confira seu pacote antes de negociar.", href: "/tools/salary-calculator" },
      ],
    },
  ],
  concurseiro: [
    {
      value: "organize_by_edital",
      label: "Organizar meus estudos pelo edital",
      cta: { label: "Ler e organizar meu edital", href: "/tools/leitor-edital" },
      shortcuts: [
        { title: "Ler e organizar meu edital", description: "Transforme o edital em um plano de estudo.", href: "/tools/leitor-edital" },
        { title: "Plano de estudo", description: "Cronograma por disciplina até a prova.", href: "/tools/concurso/plano-de-estudo" },
      ],
    },
    {
      value: "practice_mock_exams",
      label: "Treinar com simulados",
      cta: { label: "Ir para Concursos", href: "/tools/concurso" },
      shortcuts: [
        { title: "Simulado de concurso", description: "Questões no estilo da banca escolhida.", href: "/tools/concurso/simulado" },
        { title: "Nota de corte", description: "Estimativa de nota de corte para o cargo.", href: "/tools/concurso/nota-de-corte" },
      ],
    },
  ],
  oab: [
    {
      value: "prepare_first_phase",
      label: "Me preparar para a 1ª fase",
      cta: { label: "Ir para a preparação OAB", href: "/tools/oab" },
      shortcuts: [
        { title: "Preparação OAB", description: "Trilha de estudo para a 1ª fase do exame.", href: "/tools/oab" },
      ],
    },
    {
      value: "practice_second_phase",
      label: "Praticar a 2ª fase (peças)",
      cta: { label: "Praticar peça da 2ª fase", href: "/tools/oab/segunda-fase" },
      shortcuts: [
        { title: "Praticar peça da 2ª fase", description: "Correção de peças práticas com feedback.", href: "/tools/oab/segunda-fase" },
      ],
    },
  ],
};

export const OBJECTIVE_DEADLINE_OPTIONS: { value: string; label: string }[] = [
  { value: "30_days", label: "Nos próximos 30 dias" },
  { value: "90_days", label: "Nos próximos três meses" },
  { value: "180_days", label: "Nos próximos seis meses" },
  { value: "exploring", label: "Ainda estou explorando" },
];

/** Objetivo de freelancer não é exclusivo de um momento profissional (um profissional
 * em recolocação ou um estudante podem igualmente querer trabalhar por conta própria),
 * por isso fica fora do CareerSegment e é oferecido em todos os momentos. */
const FREELANCE_OBJECTIVE: OnboardingObjective = {
  value: "work_as_freelancer",
  label: "Quero trabalhar como freelancer",
  cta: { label: "Criar meu perfil freelancer", href: "/freelancer" },
  shortcuts: [
    { title: "Criar meu perfil freelancer", description: "Monte seu perfil para ser encontrado por clientes.", href: "/freelancer" },
    { title: "Encontrar projetos", description: "Veja projetos abertos compatíveis com suas habilidades.", href: "/projetos" },
    { title: "Minhas propostas", description: "Acompanhe as propostas que você já enviou.", href: "/freelancer/propostas" },
  ],
};

export function objectivesForSegment(segment: CareerSegment | null | undefined): OnboardingObjective[] {
  const base = !segment || !(segment in OBJECTIVE_OPTIONS_BY_SEGMENT)
    ? OBJECTIVE_OPTIONS_BY_SEGMENT.career_pro
    : OBJECTIVE_OPTIONS_BY_SEGMENT[segment];
  return [...base, FREELANCE_OBJECTIVE];
}

export function findObjective(segment: CareerSegment | null | undefined, value: string): OnboardingObjective | null {
  return objectivesForSegment(segment).find((o) => o.value === value) ?? null;
}
