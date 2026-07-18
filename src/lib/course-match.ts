/**
 * Relevância entre um curso (área/título) e o perfil do candidato (área de atuação
 * + lacunas de skill mais frequentes nas análises). Substitui o antigo filtro por
 * `String.includes`, que só casava substrings exatas e ignorava as lacunas.
 *
 * A pontuação é intencionalmente simples e determinística (sobreposição de tokens):
 * é usada para ordenar/curar candidatos antes de mandar pra IA, não para exibir número.
 */

const STOPWORDS = new Set([
  "de", "da", "do", "das", "dos", "e", "em", "para", "por", "com", "sem", "a", "o", "as", "os",
  "um", "uma", "no", "na", "nos", "nas", "ao", "aos", "à", "ou", "the", "of", "and", "for",
  "curso", "cursos", "livre", "basico", "basica", "profissional", "profissionalizante",
]);

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Tokens significativos (>= 3 chars, sem acento, sem stopwords). */
export function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(/[^a-z0-9+#]+/)
    .filter((token) => (token.length >= 3 || /[+#]/.test(token)) && !STOPWORDS.has(token));
}

export type MatchableCourse = {
  title: string;
  area: string;
  free?: boolean;
  certificate?: boolean;
  modality?: string;
};

/**
 * Pontua um curso contra a área do candidato e suas lacunas. Maior = mais relevante.
 * - lacunas casadas valem mais que a área (é o que o candidato precisa aprender);
 * - gratuito e certificado dão um leve empurrão (mais acionável pra quem busca emprego).
 */
export function scoreCourse(
  course: MatchableCourse,
  profile: { area?: string | null; skillGaps?: string[] },
): number {
  const haystack = new Set([...tokenize(course.title), ...tokenize(course.area)]);
  if (haystack.size === 0) return 0;

  let score = 0;

  const areaTokens = tokenize(profile.area ?? "");
  for (const token of areaTokens) {
    if (haystack.has(token)) score += 2;
  }

  for (const gap of profile.skillGaps ?? []) {
    const gapTokens = tokenize(gap);
    // conta a lacuna como casada se qualquer token dela aparecer no curso
    if (gapTokens.some((token) => haystack.has(token))) score += 3;
  }

  if (score === 0) return 0;
  if (course.free) score += 0.5;
  if (course.certificate) score += 0.5;
  return score;
}

/**
 * Ordena cursos por relevância ao perfil, descartando os sem nenhuma sobreposição.
 * Empate: mantém a ordem de entrada (que costuma vir por `lastSeenAt` desc).
 */
export function rankCourses<T extends MatchableCourse>(
  courses: T[],
  profile: { area?: string | null; skillGaps?: string[] },
): T[] {
  return courses
    .map((course, index) => ({ course, index, score: scoreCourse(course, profile) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.course);
}
