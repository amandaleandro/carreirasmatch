const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  "#39": "'",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (match, code: string) => {
    if (code[0] === "#") {
      const codePoint =
        code[1] === "x" || code[1] === "X"
          ? Number.parseInt(code.slice(2), 16)
          : Number.parseInt(code.slice(1), 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    const named = NAMED_ENTITIES[code.toLowerCase()];
    return named ?? match;
  });
}

/**
 * Turns a raw job description (which may contain HTML markup and entities)
 * into a clean plain-text snippet suitable for a card preview.
 */
export function cleanJobSnippet(text: string, maxLength = 220): string {
  const plain = decodeEntities(
    text
      // Drop tags entirely, but keep a space so words don't run together.
      .replace(/<[^>]*>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
  return plain.slice(0, maxLength);
}
