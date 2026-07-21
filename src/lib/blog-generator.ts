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
1. Escolha UM tema específico e prático dentro da área informada, focado num problema/dúvida concreto de quem está entrando ou crescendo nela. Nunca escreva um artigo genérico "sobre a área".
2. VARIE o ângulo do artigo. Não use sempre o mesmo formato: alterne entre, por exemplo, como se preparar para entrevista, erros comuns e como evitá-los, o dia a dia real da função, como decidir entre subáreas, tendências e habilidades em alta, transição de outra área, primeiros 90 dias no cargo, como negociar salário/proposta, o que estudar e por onde começar, mitos da profissão. NÃO escreva mais um artigo de "como montar portfólio/currículo" a menos que o tema realmente peça — esse formato já está saturado no blog.
3. Não repita nenhum dos temas nem o formato dos títulos listados em TEMAS_JA_PUBLICADOS. Se todos os títulos recentes começam com o mesmo padrão ("Como montar...", "Descubra..."), use uma abertura diferente.
4. Profundidade real: cada seção deve trazer informação concreta, exemplos práticos e passos acionáveis — não frases genéricas. Evite abertura formulaica; comece pelo problema real do leitor, não por "No mundo de hoje..." ou "O mercado está em constante mudança".
5. Tom direto, encorajador e sem enrolação. Sem clichês vazios.
6. Conteúdo 100% em português do Brasil, factualmente cauteloso: não invente estatísticas, salários exatos, datas ou nomes de empresas específicas.
7. Estruture em 5 a 8 blocos com corpo substancial (mire ~600-900 palavras no total): parágrafo de abertura que fisga pelo problema, headings organizando seções, e ao menos uma lista com passos/dicas/erros concretos.
8. "excerpt": resumo de 1-2 frases, gancho para quem está navegando o blog, sem repetir o título literalmente.
9. "coverEmoji": um único emoji temático relevante ao artigo.`;

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

  // Temperatura um pouco mais alta e mais tokens: variedade de ângulo e corpo
  // mais longo (~600-900 palavras) pedem folga em relação ao artigo curto antigo.
  // Gemini como preferencial: geração de blog é interna/não urgente, então usa
  // uma cota gratuita separada da do Groq (análise) e da do Cerebras (ferramentas).
  return runJsonPrompt<GeneratedPost>(
    SYSTEM_PROMPT, userMessage, 0.7, 4000, undefined, undefined, "blog_generation", "gemini"
  );
}
