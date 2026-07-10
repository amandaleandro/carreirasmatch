export type CareerSegment =
  | "apprentice"
  | "first_job"
  | "internship"
  | "student"
  | "career_change"
  | "career_pro";

export const CAREER_SEGMENT_OPTIONS: { value: CareerSegment; label: string }[] = [
  { value: "apprentice", label: "Busco Jovem Aprendiz" },
  { value: "first_job", label: "Busco Primeiro Emprego" },
  { value: "internship", label: "Busco Estagio" },
  { value: "student", label: "Quero escolher faculdade ou tecnico" },
  { value: "career_change", label: "Quero mudar de carreira" },
  { value: "career_pro", label: "Quero recolocacao ou vaga melhor" },
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
