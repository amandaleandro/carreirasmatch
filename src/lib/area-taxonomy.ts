import { VOCATION_AREAS, matchAreaSlug, type VocationAreaConfig } from "@/lib/vocation-areas";
import { tokenize } from "@/lib/course-match";

/**
 * Classificação em dois níveis (área geral + subárea), reaproveitada em todo
 * o sistema (cursos, vagas, oportunidades públicas, vídeos de carreira e o
 * texto livre de área do perfil do usuário). Sem isso, uma fonte como a DIO
 * — que é só uma área geral ("Tecnologia") com dezenas de frentes reais
 * (back-end, dados, IA, cloud...) — vira um bloco genérico único, pouco útil
 * pra recomendar/filtrar o item certo.
 *
 * As áreas gerais e suas subáreas são as mesmas de VOCATION_AREAS
 * (vocation-areas.ts), a mesma lista usada no teste vocacional — assim
 * cobrimos as ~30 áreas de uma vez, sem duplicar catálogos, e mantemos o
 * vocabulário consistente em todo o app.
 */

// TI é a exceção: título/texto de tecnologia cita ferramenta/linguagem
// ("Curso de React", "Desenvolvedor Python"), não o nome da subárea em si
// ("Desenvolvimento Front-end"). Por isso usa regex dedicado em vez do
// casamento genérico por sobreposição de tokens usado pras demais áreas.
type SubareaRule = { label: string; terms: RegExp };
const TI_SUBAREA_RULES: SubareaRule[] = [
  {
    label: "Inteligência Artificial",
    terms: /intelig[eê]ncia artificial|\bia\b|machine learning|llm\b|chatgpt|crewai|n8n|agente[s]? de ia/i,
  },
  { label: "Dados/Analytics", terms: /\bdados\b|data science|analytics|\bsql\b|power bi|nosql|banco de dados/i },
  { label: "Desenvolvimento Back-end", terms: /back-?end|\bjava\b|python|\.net\b|golang|\bgo\b|node/i },
  { label: "Desenvolvimento Front-end", terms: /front-?end|react|angular|javascript|typescript|\bhtml\b|\bcss\b/i },
  { label: "Mobile", terms: /\bmobile\b|flutter|\bandroid\b|\bios\b|kotlin|swift/i },
  { label: "Cloud", terms: /\bcloud\b|\baws\b|\bazure\b|google cloud|\bgcp\b/i },
  { label: "DevOps/SRE", terms: /devops|docker|kubernetes|\bsre\b|ci\/cd/i },
  { label: "QA/Testes", terms: /\bqa\b|quality assurance|teste de software|testes automatizados/i },
  { label: "Segurança da Informação", terms: /seguran[cç]a da informa[cç][aã]o|cybersecurity|ciberseguran[cç]a/i },
  { label: "UX/UI", terms: /ux\/?ui|design de produto|\bfigma\b|usabilidade/i },
  { label: "Blockchain", terms: /blockchain|web3|solidity/i },
];

function matchTiSubarea(text: string): string {
  return TI_SUBAREA_RULES.find((rule) => rule.terms.test(text))?.label ?? "";
}

/**
 * Acha, dentro das subáreas de uma área vocacional, a que tem mais tokens em
 * comum com o texto (ex. "Preparatório para Cardiologia" casa com a subárea
 * "Cardiologia" de Medicina). Funciona bem quando o texto já cita a
 * especialidade por extenso, o que é comum fora de TI (saúde, direito,
 * engenharia, design...).
 *
 * Ignora os tokens do próprio label da área geral (ex. "direito", "engenharia")
 * na pontuação: como esse token se repete em quase toda subárea da área
 * ("Direito Civil", "Direito Penal"...), um texto que só cite a área em
 * geral casaria por acaso com a primeira subárea da lista.
 */
function matchGenericSubarea(text: string, area: VocationAreaConfig): string {
  const textTokens = new Set(tokenize(text));
  const genericTokens = new Set(tokenize(area.label));
  let best: { label: string; score: number } | undefined;
  for (const subarea of area.subareas) {
    const score = tokenize(subarea).filter((token) => !genericTokens.has(token) && textTokens.has(token)).length;
    if (score > 0 && (!best || score > best.score)) best = { label: subarea, score };
  }
  return best?.label ?? "";
}

/**
 * Classifica um texto (título de curso, vaga, vídeo...) em { area, subarea }.
 * TI usa regex dedicado (ver acima); as demais ~30 áreas usam as subáreas já
 * cadastradas em VOCATION_AREAS. `fallbackArea` é o rótulo que já vinha da
 * fonte (ex. categoria do MEC, tag de vaga) — usado pra achar a área
 * vocacional quando o texto sozinho não é suficiente; sem nenhum sinal, é
 * preservado como estava antes.
 */
export function classifyArea(text: string, fallbackArea?: string | null): { area: string; subarea: string } {
  const tiSubarea = matchTiSubarea(text);
  if (tiSubarea) return { area: "Tecnologia da Informação", subarea: tiSubarea };

  const slug = matchAreaSlug(fallbackArea || text);
  const vocationArea = slug ? VOCATION_AREAS.find((a) => a.slug === slug) : undefined;
  if (vocationArea) {
    return { area: vocationArea.label, subarea: matchGenericSubarea(text, vocationArea) };
  }

  return { area: fallbackArea ?? "", subarea: "" };
}

/**
 * Resolve um texto livre curto (ex. `User.professionalArea` digitado pelo
 * usuário: "Advogado trabalhista", "Desenvolvedor back-end") em
 * { areaSlug, areaLabel, subarea }. Diferente de `classifyArea`, não tem
 * `fallbackArea` — o texto é a única pista disponível. Retorna `null` quando
 * não há nenhum sinal confiável, pra quem consome isso (prompts de IA,
 * matching de vaga) poder cair num fallback em vez de arriscar um match errado.
 */
export function resolveFreeText(
  text: string | null | undefined,
): { areaSlug: string; areaLabel: string; subarea: string } | null {
  if (!text || !text.trim()) return null;

  const tiSubarea = matchTiSubarea(text);
  if (tiSubarea) return { areaSlug: "ti", areaLabel: "Tecnologia da Informação", subarea: tiSubarea };

  const slug = matchAreaSlug(text);
  const vocationArea = slug ? VOCATION_AREAS.find((a) => a.slug === slug) : undefined;
  if (!vocationArea) return null;

  return {
    areaSlug: vocationArea.slug,
    areaLabel: vocationArea.label,
    subarea: matchGenericSubarea(text, vocationArea),
  };
}
