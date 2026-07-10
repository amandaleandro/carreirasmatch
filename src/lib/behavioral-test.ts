export type SoftSkillDimension =
  | "comunicacao"
  | "trabalho_em_equipe"
  | "proatividade"
  | "adaptabilidade"
  | "resolucao_problemas";

export type PersonalityTrait = "dominancia" | "influencia" | "estabilidade" | "conformidade";

export type BehavioralQuestion =
  | { id: string; text: string; kind: "skill"; dimension: SoftSkillDimension }
  | { id: string; text: string; kind: "trait"; trait: PersonalityTrait };

export const SOFT_SKILL_LABELS: Record<SoftSkillDimension, string> = {
  comunicacao: "Comunicação",
  trabalho_em_equipe: "Trabalho em equipe",
  proatividade: "Proatividade",
  adaptabilidade: "Adaptabilidade",
  resolucao_problemas: "Resolução de problemas",
};

export const PERSONALITY_TRAIT_LABELS: Record<PersonalityTrait, string> = {
  dominancia: "Direto(a) e orientado(a) a resultados",
  influencia: "Comunicativo(a) e entusiasmado(a)",
  estabilidade: "Paciente e colaborativo(a)",
  conformidade: "Analítico(a) e cuidadoso(a)",
};

export const PERSONALITY_TRAIT_DESCRIPTIONS: Record<PersonalityTrait, string> = {
  dominancia:
    "Você tende a ser decidido(a), gosta de assumir controle de situações e busca resultados rápidos. Em entrevistas, destaque conquistas concretas e decisões que tomou.",
  influencia:
    "Você tende a se conectar bem com pessoas, comunicar ideias com entusiasmo e motivar quem está ao redor. Em entrevistas, destaque exemplos de colaboração e comunicação.",
  estabilidade:
    "Você tende a ser paciente, confiável e um bom ouvinte, preferindo ambientes previsíveis e trabalho em equipe consistente. Em entrevistas, destaque exemplos de constância e suporte a colegas.",
  conformidade:
    "Você tende a ser detalhista, analítico(a) e cuidadoso(a) com regras e qualidade. Em entrevistas, destaque atenção a detalhes e organização em processos que seguiu.",
};

export const BEHAVIORAL_QUESTIONS: BehavioralQuestion[] = [
  { id: "q1", kind: "skill", dimension: "comunicacao", text: "Sinto facilidade em explicar uma ideia para alguém que não conhece o assunto." },
  { id: "q2", kind: "skill", dimension: "comunicacao", text: "Costumo ouvir até o fim antes de responder, mesmo quando discordo." },
  { id: "q3", kind: "skill", dimension: "comunicacao", text: "Consigo escrever mensagens claras e objetivas, sem gerar confusão." },
  { id: "q4", kind: "skill", dimension: "trabalho_em_equipe", text: "Prefiro dividir tarefas e responsabilidades a fazer tudo sozinho(a)." },
  { id: "q5", kind: "skill", dimension: "trabalho_em_equipe", text: "Consigo dar e receber feedback sem levar para o lado pessoal." },
  { id: "q6", kind: "skill", dimension: "trabalho_em_equipe", text: "Ajudo colegas mesmo quando a tarefa não é minha responsabilidade direta." },
  { id: "q7", kind: "skill", dimension: "proatividade", text: "Costumo antecipar problemas antes que alguém peça para eu resolver." },
  { id: "q8", kind: "skill", dimension: "proatividade", text: "Prefiro perguntar e agir do que esperar instruções detalhadas." },
  { id: "q9", kind: "skill", dimension: "proatividade", text: "Busco aprender coisas novas por conta própria, sem esperar um curso formal." },
  { id: "q10", kind: "skill", dimension: "adaptabilidade", text: "Me adapto bem quando um plano muda de última hora." },
  { id: "q11", kind: "skill", dimension: "adaptabilidade", text: "Fico confortável em situações novas, mesmo sem ter todas as informações." },
  { id: "q12", kind: "skill", dimension: "adaptabilidade", text: "Consigo manter a calma quando algo não sai como esperado." },
  { id: "q13", kind: "skill", dimension: "resolucao_problemas", text: "Quando surge um problema, procuro entender a causa antes de agir." },
  { id: "q14", kind: "skill", dimension: "resolucao_problemas", text: "Costumo pensar em mais de uma solução antes de escolher a melhor." },
  { id: "q15", kind: "skill", dimension: "resolucao_problemas", text: "Não desisto no primeiro obstáculo ao tentar resolver algo difícil." },
  { id: "q16", kind: "trait", trait: "dominancia", text: "Gosto de tomar decisões rápidas e assumir a liderança de uma tarefa." },
  { id: "q17", kind: "trait", trait: "dominancia", text: "Prefiro focar em resultados mais do que em como o processo é feito." },
  { id: "q18", kind: "trait", trait: "dominancia", text: "Não me incomodo em discordar publicamente quando acho que estou certo(a)." },
  { id: "q19", kind: "trait", trait: "influencia", text: "Puxo conversa com facilidade, mesmo com pessoas que não conheço." },
  { id: "q20", kind: "trait", trait: "influencia", text: "Gosto de estar em ambientes com bastante interação social." },
  { id: "q21", kind: "trait", trait: "influencia", text: "Costumo animar o grupo quando o clima está baixo." },
  { id: "q22", kind: "trait", trait: "estabilidade", text: "Prefiro rotinas previsíveis a ambientes que mudam o tempo todo." },
  { id: "q23", kind: "trait", trait: "estabilidade", text: "Sou paciente com pessoas que demoram mais para entender algo." },
  { id: "q24", kind: "trait", trait: "estabilidade", text: "Prefiro manter a harmonia do grupo a insistir no meu ponto de vista." },
  { id: "q25", kind: "trait", trait: "conformidade", text: "Gosto de seguir processos e regras bem definidos." },
  { id: "q26", kind: "trait", trait: "conformidade", text: "Reviso meu trabalho com cuidado antes de considerar pronto." },
  { id: "q27", kind: "trait", trait: "conformidade", text: "Prefiro ter dados e evidências antes de tomar uma decisão." },
];

export type BehavioralAnswers = Record<string, number>;

export type BehavioralScores = {
  skillScores: Record<SoftSkillDimension, number>;
  personalityScores: Record<PersonalityTrait, number>;
  dominantTrait: PersonalityTrait;
};

const SOFT_SKILL_DIMENSIONS: SoftSkillDimension[] = [
  "comunicacao",
  "trabalho_em_equipe",
  "proatividade",
  "adaptabilidade",
  "resolucao_problemas",
];

const PERSONALITY_TRAITS: PersonalityTrait[] = [
  "dominancia",
  "influencia",
  "estabilidade",
  "conformidade",
];

export function computeBehavioralScores(answers: BehavioralAnswers): BehavioralScores {
  const skillScores = {} as Record<SoftSkillDimension, number>;
  for (const dimension of SOFT_SKILL_DIMENSIONS) {
    const questions = BEHAVIORAL_QUESTIONS.filter(
      (q): q is Extract<BehavioralQuestion, { kind: "skill" }> =>
        q.kind === "skill" && q.dimension === dimension
    );
    const values = questions.map((q) => answers[q.id] ?? 3);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    skillScores[dimension] = Math.round(((avg - 1) / 4) * 100);
  }

  const personalityScores = {} as Record<PersonalityTrait, number>;
  for (const trait of PERSONALITY_TRAITS) {
    const questions = BEHAVIORAL_QUESTIONS.filter(
      (q): q is Extract<BehavioralQuestion, { kind: "trait" }> =>
        q.kind === "trait" && q.trait === trait
    );
    const values = questions.map((q) => answers[q.id] ?? 3);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    personalityScores[trait] = Math.round(((avg - 1) / 4) * 100);
  }

  const dominantTrait = PERSONALITY_TRAITS.reduce((best, trait) =>
    personalityScores[trait] > personalityScores[best] ? trait : best
  , PERSONALITY_TRAITS[0]);

  return { skillScores, personalityScores, dominantTrait };
}
