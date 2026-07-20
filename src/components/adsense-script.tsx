import { ADSENSE_CLIENT } from "@/lib/adsense";

/**
 * Snippet do Google AdSense, carregado só quando NEXT_PUBLIC_ADSENSE_CLIENT
 * está definido. Fica no <head> do layout raiz porque o Google precisa
 * encontrar a tag em todo o site para verificar a propriedade do domínio; as
 * unidades de anúncio em si só aparecem nas páginas públicas (ad-slot.tsx).
 *
 * É uma tag `<script>` crua, e não `next/script`: com a estratégia
 * afterInteractive o Next deixa no HTML só um <link rel="preload"> e injeta o
 * <script> via JS depois da hidratação, então o snippet não aparece no HTML
 * servido - que é onde a verificação do AdSense procura. `async` mantém o
 * carregamento fora do caminho crítico, igual ao snippet oficial.
 */
export function AdsenseScript() {
  if (!ADSENSE_CLIENT) return null;

  return (
    <script
      id="adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}
