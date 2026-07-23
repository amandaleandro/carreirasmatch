import type { StructuredResume } from "@/lib/groq";

/**
 * Verificação determinística das palavras-chave da análise (estilo Jobscan):
 * a IA propõe keywordsFound/keywordsMissing, mas o veredito final de "presente
 * no currículo" vem de um match literal normalizado sobre o texto do currículo
 * + sinais estruturados. Corrige alucinação ("encontrou" termo que não existe)
 * e cegueira ("não achou" termo que está lá escrito).
 */

/** minúsculas, sem acento, espaços colapsados — para comparar PT-BR sem depender de grafia. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Um termo "está" no haystack quando aparece com fronteira de palavra dos dois
 * lados (evita "R" casar dentro de qualquer palavra, "Java" casar "JavaScript")
 * e tolerando plural simples ("relatório" casa "relatórios").
 */
function termPresent(normalizedHaystack: string, term: string): boolean {
  const normalizedTerm = normalize(term);
  if (!normalizedTerm) return false;
  // Fronteira manual: regex \b não funciona bem com termos com pontuação (C++, node.js).
  const pattern = new RegExp(
    `(^|[^a-z0-9])${escapeRegex(normalizedTerm)}(s|es)?($|[^a-z0-9])`,
    "i"
  );
  return pattern.test(normalizedHaystack);
}

/**
 * Só reclassificamos termos "simples": curtos e sem número. Termos compostos
 * longos ("3 anos de experiência com vendas") ou com dígitos quase nunca
 * aparecem literalmente mesmo quando o requisito é atendido — nesses casos o
 * julgamento da IA fica valendo.
 */
function isVerifiableTerm(term: string): boolean {
  const words = term.trim().split(/\s+/);
  return words.length <= 3 && !/\d/.test(term);
}

export type KeywordVerification = {
  keywordsFound: string[];
  keywordsMissing: string[];
  /** Termos que a IA deu como encontrados mas não existem literalmente no currículo. */
  demotedToMissing: string[];
  /** Termos que a IA deu como ausentes mas estão escritos no currículo. */
  promotedToFound: string[];
};

export function verifyKeywords(
  aiFound: string[],
  aiMissing: string[],
  resumeText: string,
  resumeStructured?: StructuredResume | null
): KeywordVerification {
  // Haystack = texto cru + sinais estruturados (skills/certificações/idiomas
  // extraídos), para cobrir currículos onde o parse do PDF quebra palavras.
  const structuredSignals = resumeStructured
    ? [
        ...resumeStructured.skills,
        ...resumeStructured.certifications,
        ...resumeStructured.languages.map((l) => `${l.language} ${l.level}`),
        ...resumeStructured.experiences.map((e) => `${e.role} ${e.description}`),
      ].join("\n")
    : "";
  const haystack = normalize(`${resumeText}\n${structuredSignals}`);

  const demotedToMissing: string[] = [];
  const promotedToFound: string[] = [];
  const found: string[] = [];
  const missing: string[] = [];

  for (const term of aiFound) {
    if (isVerifiableTerm(term) && !termPresent(haystack, term)) {
      demotedToMissing.push(term);
      missing.push(term);
    } else {
      found.push(term);
    }
  }

  for (const term of aiMissing) {
    if (isVerifiableTerm(term) && termPresent(haystack, term)) {
      promotedToFound.push(term);
      found.push(term);
    } else {
      missing.push(term);
    }
  }

  // Dedup preservando ordem (a IA às vezes repete o termo nas duas listas).
  const dedupe = (list: string[]) => {
    const seen = new Set<string>();
    return list.filter((t) => {
      const key = normalize(t);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const finalFound = dedupe(found);
  const foundKeys = new Set(finalFound.map((t) => normalize(t)));
  const finalMissing = dedupe(missing).filter((t) => !foundKeys.has(normalize(t)));

  return {
    keywordsFound: finalFound,
    keywordsMissing: finalMissing,
    demotedToMissing,
    promotedToFound,
  };
}
