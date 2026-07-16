/**
 * Configuração do Google AdSense. Tudo é opcional: sem
 * `NEXT_PUBLIC_ADSENSE_CLIENT` nada é carregado e os componentes de anúncio
 * viram no-op (dev fica limpo, igual ao Plausible em src/lib/analytics.ts).
 *
 * O client id é lido direto de `process.env` (e não via variável intermediária)
 * porque o Next só substitui `NEXT_PUBLIC_*` no bundle do cliente quando o
 * acesso é literal. Como são embutidas em build time, precisam estar presentes
 * como build args no Docker — ver Dockerfile e docs/ENV.md.
 */
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

/**
 * Slots de anúncio por posição. Cada um vem do painel do AdSense
 * (Anúncios > Por unidade de anúncio) e é um id numérico. Um slot sem env var
 * definida simplesmente não renderiza, então dá para ligar as posições aos
 * poucos.
 *
 * Só existe slot para blog e guias: é conteúdo escrito por nós. As listagens de
 * vagas não entram porque são agregadas de fontes externas, e anúncio sobre
 * conteúdo replicado é risco de suspensão da conta inteira — não só da página.
 */
export const ADSENSE_SLOTS = {
  /** Dentro do artigo do blog, entre o conteúdo e os posts relacionados. */
  blogArticle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_ARTICLE,
  /** Listagem do blog, abaixo da grade de posts. */
  blogList: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_LIST,
  /** Guias de conteúdo abertos (ferramentas com `free` no catálogo). */
  toolGuide: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL_GUIDE,
} as const;

export type AdSlotName = keyof typeof ADSENSE_SLOTS;

/** True quando o AdSense está configurado para rodar neste ambiente. */
export function isAdsEnabled(): boolean {
  return !!ADSENSE_CLIENT;
}

/**
 * Publisher id sem o prefixo `ca-`, no formato que o ads.txt do Google espera
 * (`pub-0000000000000000`). Null quando o client id não está configurado ou não
 * está no formato esperado.
 */
export function adsensePublisherId(): string | null {
  if (!ADSENSE_CLIENT) return null;
  const match = ADSENSE_CLIENT.match(/^ca-(pub-\d+)$/);
  return match ? match[1] : null;
}
