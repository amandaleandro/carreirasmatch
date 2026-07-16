/**
 * A resposta da IA passa por `JSON.parse(...) as T` (src/lib/groq.ts), que é um
 * cast — o tipo é uma promessa, não uma garantia. Em JSON-mode a resposta vem
 * sintaticamente válida mesmo quando cortada por `max_tokens`, então um campo
 * pode simplesmente não existir e o `as T` não percebe. Sem estas coerções, um
 * `.map()` num array ausente derruba a página inteira no meio da ferramenta.
 */

export function asStringArray(value: unknown, maxItems = 20): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems);
}

export function asText(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

/** Nota numérica dentro de uma faixa; qualquer coisa fora vira `fallback`. */
export function asScore(value: unknown, min: number, max: number, fallback = min): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

/** Texto opcional: devolve `null` em vez de string vazia quando não veio nada. */
export function asOptionalText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
