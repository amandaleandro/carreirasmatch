import { runJsonPrompt } from "@/lib/groq";
import type { VocationAreaConfig } from "@/lib/vocation-areas";

export type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export type GeneratedPost = {
  title: string;
  excerpt: string;
  coverEmoji: string;
  contentBlocks: ContentBlock[];
};

/** Curated gradient pairs for post covers, picked deterministically per slug so covers stay varied but stable across renders. */
export const COVER_GRADIENTS = [
  "from-blue-600 to-cyan-500",
  "from-violet-600 to-fuchsia-500",
  "from-emerald-600 to-teal-500",
  "from-orange-600 to-amber-500",
  "from-rose-600 to-pink-500",
  "from-indigo-600 to-blue-500",
  "from-teal-600 to-lime-500",
  "from-purple-600 to-indigo-500",
];

export function gradientIndexForSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash += slug.charCodeAt(i);
  return hash % COVER_GRADIENTS.length;
}

const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SYSTEM_PROMPT = `Você é um redator de conteúdo de carreira brasileiro, experiente, direto e prático. Escreve artigos de blog para pessoas buscando vaga, decidindo carreira ou se preparando profissionalmente na área indicada.

REGRAS:
1. Escolha UM tema específico e prático dentro da área informada (ex: como se preparar para entrevista, como montar currículo, erros comuns, tendências do mercado, como decidir entre subáreas, primeiros passos na carreira). Nunca escreva um artigo genérico "sobre a área", foque em um problema/dúvida concreto de quem está entrando ou crescendo nela.
2. Não repita nenhum dos temas listados em TEMAS_JA_PUBLICADOS.
3. Tom direto, encorajador e sem enrolação. Sem clichês vazios tipo "o mercado está em constante mudança".
4. Conteúdo 100% em português do Brasil, factualmente cauteloso, não invente estatísticas, salários exatos ou nomes de empresas específicas.
5. Estruture em 4 a 7 blocos: comece com um parágrafo de abertura, use headings para organizar seções, use ao menos uma lista quando fizer sentido (passos, dicas, erros comuns).
6. "excerpt": resumo de 1-2 frases, gancho para quem está navegando o blog, sem repetir o título literalmente.
7. "coverEmoji": um único emoji temático relevante ao artigo.`;

export async function generateBlogPost(
  area: VocationAreaConfig,
  recentTitles: string[]
): Promise<GeneratedPost> {
  const recentBlock =
    recentTitles.length > 0
      ? `\n\nTEMAS_JA_PUBLICADOS (não repetir nenhum destes):\n- ${recentTitles.join("\n- ")}`
      : "";

  const userMessage = `ÁREA: ${area.label}\nDESCRIÇÃO DA ÁREA: ${area.description}\nSUBÁREAS: ${area.subareas.join(", ")}${recentBlock}

Responda SOMENTE com um objeto JSON válido, sem texto antes ou depois, seguindo exatamente este formato:
{
  "title": string (título chamativo e específico, sem aspas),
  "excerpt": string,
  "coverEmoji": string (um único emoji),
  "contentBlocks": [
    { "type": "paragraph", "text": string } |
    { "type": "heading", "text": string } |
    { "type": "list", "items": string[] }
  ]
}`;

  return runJsonPrompt<GeneratedPost>(
    SYSTEM_PROMPT, userMessage, 0.5, 3000, undefined, undefined, "blog_generation"
  );
}
