import { prisma } from "@/lib/prisma";
import { getMarketInsights } from "@/lib/market-insights";
import { gradientIndexForSlug, type ContentBlock } from "@/lib/blog-generator";

// Cópia local dos rótulos de trilha: este módulo roda no scheduler (fora da
// árvore React), então não deve importar de um arquivo "use client".
const TRACK_LABELS: Record<string, string> = {
  internship: "Estágio, trainee ou primeiro emprego",
  career_change: "Transição de carreira",
  reemployment: "Recolocação",
  growth: "Vaga melhor / crescimento profissional",
  apprentice: "Jovem aprendiz",
};

/**
 * Post mensal do "Termômetro do Currículo": conteúdo de autoridade gerado
 * DETERMINISTICAMENTE dos agregados anônimos do banco (sem IA, sem custo de
 * tokens, sem risco de alucinação de número). Publica 1x por mês, no dia 1º
 * ou no primeiro tick depois dele — o slug com ano-mês faz a deduplicação.
 */

const MONTHS_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export async function publishMonthlyInsightsPost(now = new Date()): Promise<void> {
  const year = now.getFullYear();
  const month = now.getMonth();
  const slug = `termometro-do-curriculo-${year}-${String(month + 1).padStart(2, "0")}`;

  const exists = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
  if (exists) return;

  const insights = await getMarketInsights();
  // Sem volume mínimo o post sai vazio/ridículo — melhor não publicar.
  if (insights.totalAnalyses < 100 || insights.topMissingKeywords.length < 5) return;

  const monthLabel = `${MONTHS_PT[month]} de ${year}`;
  const top10 = insights.topMissingKeywords.slice(0, 10);

  const blocks: ContentBlock[] = [
    {
      type: "paragraph",
      text: `O Termômetro do Currículo é o levantamento mensal do CarreirasMatch com dados agregados e anônimos de ${insights.totalAnalyses.toLocaleString("pt-BR")} análises de currículo contra vagas reais. Nenhum dado pessoal é exposto: os números abaixo são estatísticas do conjunto.`,
    },
    { type: "heading", text: `As habilidades que mais faltaram nos currículos em ${monthLabel}` },
    {
      type: "paragraph",
      text: "Estes são os termos mais exigidos pelas vagas e ausentes nos currículos analisados recentemente — em outras palavras, as lacunas mais comuns entre o que o mercado pede e o que os candidatos apresentam:",
    },
    {
      type: "list",
      items: top10.map((k, i) => `${i + 1}. ${k.term} — ausente em ${k.count} análises`),
    },
    { type: "heading", text: "Qual é a nota média dos candidatos?" },
    {
      type: "paragraph",
      text: `A nota média de aderência currículo × vaga na plataforma é ${insights.averageScore}/100, e apenas ${insights.applyNowPercent}% das análises resultam em "pronto para aplicar" de primeira. Ou seja: a grande maioria dos currículos precisa de ajustes direcionados antes da candidatura — geralmente incluir as palavras-chave da vaga e quantificar resultados.`,
    },
    { type: "heading", text: "Nota média por momento profissional" },
    {
      type: "list",
      items: insights.scoreByTrack.map(
        (t) => `${TRACK_LABELS[t.track] ?? t.track}: ${t.averageScore}/100`
      ),
    },
    { type: "heading", text: "O que fazer com esses dados" },
    {
      type: "paragraph",
      text: "Se as habilidades da lista acima aparecem nas vagas da sua área, elas são o melhor investimento de estudo do mês. E antes de se candidatar, compare seu currículo com a vaga real: a análise mostra exatamente quais desses termos faltam no seu caso.",
    },
    {
      type: "paragraph",
      text: "Dados completos e sempre atualizados na página do Termômetro do Currículo: carreirasmatch.com.br/insights — ao citar este levantamento, referencie o CarreirasMatch com link.",
    },
  ];

  await prisma.post.create({
    data: {
      slug,
      title: `Termômetro do Currículo — ${monthLabel}: as ${top10.length} habilidades que mais faltam nos currículos`,
      excerpt: `Dados de ${insights.totalAnalyses.toLocaleString("pt-BR")} análises: nota média ${insights.averageScore}/100 e as habilidades mais ausentes nos currículos brasileiros em ${monthLabel}.`,
      areaSlug: "",
      areaLabel: "Mercado de Trabalho",
      coverEmoji: "🌡️",
      gradientIdx: gradientIndexForSlug(slug),
      contentJson: JSON.stringify(blocks),
    },
  });
}
