/** Motor de priorização do painel "Minha Rota" (spec seção 21).
 * Pesos maiores vencem; o primeiro item da lista ordenada é "Seu próximo passo",
 * os 3 primeiros alimentam o bloco "Para hoje". */

export type ApplicationForNextStep = {
  id: string;
  jobTitle: string;
  status: string;
  deadline: Date | null;
  interviewAt: Date | null;
  appliedAt: Date | null;
  responseAt: Date | null;
  analysisId: string | null;
};

export type NextStepInput = {
  applications: ApplicationForNextStep[];
  hasResume: boolean;
  hasLinkedinReview: boolean;
  hasBehavioralTest: boolean;
  now?: Date;
};

export type NextStepItem = {
  key: string;
  weight: number;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  minutes: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function computeNextSteps({
  applications,
  hasResume,
  hasLinkedinReview,
  hasBehavioralTest,
  now = new Date(),
}: NextStepInput): NextStepItem[] {
  const items: NextStepItem[] = [];

  const interviewSoon = applications.find(
    (a) => a.interviewAt && a.interviewAt.getTime() >= now.getTime() && a.interviewAt.getTime() - now.getTime() <= DAY_MS
  );
  if (interviewSoon) {
    items.push({
      key: "interview_soon",
      weight: 100,
      title: `Preparar entrevista: ${interviewSoon.jobTitle}`,
      description: "Sua entrevista é nas próximas 24h. Treine as perguntas mais prováveis.",
      href: `/interviews/${interviewSoon.id}`,
      ctaLabel: "Treinar agora",
      minutes: 10,
    });
  }

  const deadlineToday = applications.find(
    (a) => a.deadline && a.deadline.getTime() >= now.getTime() && a.deadline.getTime() - now.getTime() <= DAY_MS
  );
  if (deadlineToday) {
    items.push({
      key: "deadline_today",
      weight: 95,
      title: `Candidatura com prazo próximo: ${deadlineToday.jobTitle}`,
      description: "O prazo para essa candidatura vence em breve.",
      href: `/applications/${deadlineToday.id}`,
      ctaLabel: "Ver candidatura",
      minutes: 5,
    });
  }

  const savedNotAnalyzed = applications.find((a) => a.status === "saved" && !a.analysisId);
  if (savedNotAnalyzed) {
    items.push({
      key: "saved_not_analyzed",
      weight: 70,
      title: `Descobrir seu Match: ${savedNotAnalyzed.jobTitle}`,
      description: "Você salvou esta vaga mas ainda não descobriu sua aderência.",
      href: "/analise",
      ctaLabel: "Analisar esta vaga",
      minutes: 3,
    });
  }

  if (!hasResume) {
    items.push({
      key: "resume_missing",
      weight: 60,
      title: "Preparar seu currículo",
      description: "Você ainda não tem um currículo no sistema — é a base para tudo o mais.",
      href: "/curriculo-sem-experiencia",
      ctaLabel: "Criar meu currículo",
      minutes: 10,
    });
  }

  if (!hasLinkedinReview) {
    items.push({
      key: "linkedin_review",
      weight: 30,
      title: "Revisar seu perfil do LinkedIn",
      description: "Um perfil bem escrito aumenta as chances de ser encontrado por recrutadores.",
      href: "/tools/linkedin-review",
      ctaLabel: "Revisar meu LinkedIn",
      minutes: 5,
    });
  }

  if (!hasBehavioralTest) {
    items.push({
      key: "behavioral_test",
      weight: 10,
      title: "Fazer o teste comportamental",
      description: "Entenda seu perfil de soft skills para se posicionar melhor nas entrevistas.",
      href: "/tools/behavioral-test",
      ctaLabel: "Fazer teste",
      minutes: 5,
    });
  }

  return items.sort((a, b) => b.weight - a.weight);
}
