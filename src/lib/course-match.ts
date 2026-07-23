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
  subarea?: string;
  free?: boolean;
  certificate?: boolean;
  modality?: string;
  featured?: boolean;
  city?: string | null;
  state?: string | null;
};

/**
 * Pontua um curso contra a área do candidato e suas lacunas. Maior = mais relevante.
 * - lacunas casadas valem mais que a área (é o que o candidato precisa aprender);
 * - dentro de cada um desses dois critérios, casar contra a SUBárea (mais específica,
 *   ex. "Desenvolvimento Back-end") vale mais que casar só contra área/título em geral;
 * - gratuito e certificado dão um leve empurrão (mais acionável pra quem busca emprego);
 * - curso presencial na cidade/estado do candidato ganha um empurrão extra, já que um
 *   presencial longe da região dele é praticamente inacessível.
 */
export function scoreCourse(
  course: MatchableCourse,
  profile: { area?: string | null; skillGaps?: string[]; city?: string | null; state?: string | null },
): number {
  const subareaTokens = new Set(tokenize(course.subarea ?? ""));
  const haystack = new Set([...tokenize(course.title), ...tokenize(course.area), ...subareaTokens]);

  let score = 0;

  const areaTokens = tokenize(profile.area ?? "");
  for (const token of areaTokens) {
    if (subareaTokens.has(token)) score += 3;
    else if (haystack.has(token)) score += 2;
  }

  for (const gap of profile.skillGaps ?? []) {
    const gapTokens = tokenize(gap);
    // conta a lacuna como casada se qualquer token dela aparecer no curso
    if (gapTokens.some((token) => subareaTokens.has(token))) score += 4;
    else if (gapTokens.some((token) => haystack.has(token))) score += 3;
  }

  const isPresencial = (course.modality ?? "").toLowerCase() === "presencial";
  if (isPresencial && (course.city || course.state)) {
    const sameCity =
      !!course.city && !!profile.city && normalizeText(course.city) === normalizeText(profile.city);
    const sameState =
      !!course.state && !!profile.state && normalizeText(course.state) === normalizeText(profile.state);
    if (sameCity) score += 6;
    else if (sameState) score += 3;
  }

  if (score === 0) {
    // Se o curso for destacado (patrocinado), ele pontua mesmo sem matching explícito de texto
    if (course.featured) return 10;
    return 0;
  }
  if (course.free) score += 0.5;
  if (course.certificate) score += 0.5;
  if (course.featured) score += 10;
  return score;
}

/**
 * Ordena cursos por relevância ao perfil, descartando os sem nenhuma sobreposição.
 * Empate: mantém a ordem de entrada (que costuma vir por `lastSeenAt` desc).
 */
export function rankCourses<T extends MatchableCourse>(
  courses: T[],
  profile: { area?: string | null; skillGaps?: string[]; city?: string | null; state?: string | null },
): T[] {
  return courses
    .map((course, index) => ({ course, index, score: scoreCourse(course, profile) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.course);
}
