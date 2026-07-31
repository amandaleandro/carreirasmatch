export type MoodKey = "great" | "good" | "neutral" | "low" | "rough";

export const MOOD_OPTIONS: Record<MoodKey, { label: string; emoji: string }> = {
  great: { label: "Ótimo(a)", emoji: "🤩" },
  good: { label: "Bem", emoji: "🙂" },
  neutral: { label: "Na média", emoji: "😐" },
  low: { label: "Cansado(a)", emoji: "😔" },
  rough: { label: "Difícil", emoji: "😞" },
};

export const MOOD_ORDER: MoodKey[] = ["great", "good", "neutral", "low", "rough"];

// "YYYY-MM-DD" no fuso local de quem chama, usado como chave única de check-in diário.
export function getMoodDayKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isMoodKey(value: string): value is MoodKey {
  return value in MOOD_OPTIONS;
}

export function isLowMood(mood?: string | null): boolean {
  return mood === "low" || mood === "rough";
}
