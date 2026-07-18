export type CareerSegment =
  | "apprentice"
  | "first_job"
  | "internship"
  | "student"
  | "career_change"
  | "career_pro"
  | "concurseiro"
  | "oab";

export const CAREER_SEGMENT_OPTIONS: { value: CareerSegment; label: string }[] = [
  { value: "apprentice", label: "Busco Jovem Aprendiz" },
  { value: "first_job", label: "Busco Primeiro Emprego" },
  { value: "internship", label: "Busco Estágio" },
  { value: "student", label: "Quero escolher faculdade ou técnico" },
  { value: "career_change", label: "Quero mudar de carreira" },
  { value: "career_pro", label: "Quero recolocação ou vaga melhor" },
  { value: "concurseiro", label: "Estudo para concurso público" },
  { value: "oab", label: "Estudo para a OAB" },
];

export const CAREER_SEGMENT_LABELS: Record<CareerSegment, string> = Object.fromEntries(
  CAREER_SEGMENT_OPTIONS.map((o) => [o.value, o.label])
) as Record<CareerSegment, string>;

const LEGACY_CAREER_SEGMENT_MAP: Record<string, CareerSegment> = {
  reemployment: "career_pro",
  better_job: "career_pro",
  growth: "career_pro",
};

export function isCareerSegment(value: string): value is CareerSegment {
  return CAREER_SEGMENT_OPTIONS.some((o) => o.value === value);
}

export function normalizeCareerSegment(
  value: string | CareerSegment | null | undefined
): CareerSegment | null {
  if (!value) return null;
  if (isCareerSegment(value)) return value;
  return LEGACY_CAREER_SEGMENT_MAP[value] ?? null;
}

/** Orientação, por momento profissional, de como as sugestões de melhoria devem ser
 * calibradas (tom, prioridade e tipo de item). Alimenta o prompt de generateProfileSuggestions
 * para que aprendiz e profissional em recolocação não recebam a mesma receita. */
const SEGMENT_SUGGESTION_GUIDANCE: Record<CareerSegment, string> = {
  apprentice:
    "Jovem aprendiz (primeiro contato com o mundo do trabalho). Priorize cursos gratuitos, curtos e introdutórios, com certificado. Foque comportamento profissional, informática básica e a área de atuação. Evite certificações caras ou que exijam experiência.",
  first_job:
    "Buscando o primeiro emprego. Priorize itens gratuitos ou baratos que gerem provas rápidas de competência (certificado, portfólio). Foque fundamentos da área e habilidades de entrada. Nada que pressuponha anos de experiência.",
  internship:
    "Buscando estágio (ainda estudando). Priorize cursos que complementem a formação e diferenciem numa seleção de estágio: ferramentas do dia a dia da área, projetos práticos. Prefira gratuitos/baratos e compatíveis com a rotina de estudos.",
  student:
    "Estudante decidindo faculdade/técnico. Priorize itens exploratórios que ajudem a confirmar a vocação e construir base na área escolhida, sem exigir pré-requisitos.",
  career_change:
    "Em transição de carreira. Priorize cursos que constroem a base da NOVA área e criam um cargo-ponte, aproveitando experiência anterior. Certificações reconhecidas ajudam a dar credibilidade a quem vem de fora.",
  career_pro:
    "Profissional em recolocação ou buscando vaga melhor. Priorize certificações reconhecidas pelo mercado e cursos de aprofundamento/especialização que elevem senioridade. Pode incluir itens pagos de maior impacto; evite conteúdo introdutório.",
  concurseiro:
    "Estudando para concurso público. Priorize cursos/materiais focados em banca, disciplinas do edital, redação e resolução de questões. Prefira preparatórios e livros de referência; evite conteúdo genérico de mercado privado.",
  oab:
    "Estudando para o Exame da OAB. Priorize preparatórios de 1ª e 2ª fase, revisões por disciplina jurídica, prática de peças e livros/vade-mécum de referência. Evite cursos genéricos fora do escopo do exame.",
};

export function suggestionGuidanceForSegment(
  segment: string | CareerSegment | null | undefined,
): string | null {
  const normalized = normalizeCareerSegment(segment);
  if (!normalized) return null;
  return SEGMENT_SUGGESTION_GUIDANCE[normalized];
}

/** Segments whose analysis "momento profissional" (CareerTrack) is unambiguous, so it can be
 * pre-selected on the analyzer form. "career_pro" and "student" are intentionally omitted:
 * career_pro splits into "reemployment"/"growth" and student has no dedicated track. */
const SEGMENT_TO_DEFAULT_TRACK: Partial<Record<CareerSegment, string>> = {
  apprentice: "apprentice",
  internship: "internship",
  first_job: "internship",
  career_change: "career_change",
};

export function defaultTrackForSegment(
  segment: string | CareerSegment | null | undefined
): string | null {
  const normalized = normalizeCareerSegment(segment);
  if (!normalized) return null;
  return SEGMENT_TO_DEFAULT_TRACK[normalized] ?? null;
}

/** All CareerTrack values compatible with a given segment. Used to keep the "momento
 * profissional" used in a resume analysis consistent with what the user set on their profile.
 * "student" has no dedicated track and is intentionally omitted (null = unrestricted). */
const SEGMENT_TO_TRACKS: Partial<Record<CareerSegment, string[]>> = {
  apprentice: ["apprentice"],
  internship: ["internship"],
  first_job: ["internship"],
  career_change: ["career_change"],
  career_pro: ["reemployment", "growth"],
};

/** Returns the CareerTrack values allowed for a segment, or null when the segment doesn't
 * constrain the track (segment missing/unknown, or "student"). */
export function tracksForSegment(
  segment: string | CareerSegment | null | undefined
): string[] | null {
  const normalized = normalizeCareerSegment(segment);
  if (!normalized) return null;
  return SEGMENT_TO_TRACKS[normalized] ?? null;
}
