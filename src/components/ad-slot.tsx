"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ADSENSE_CLIENT, ADSENSE_SLOTS, type AdSlotName } from "@/lib/adsense";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Uma unidade de anúncio responsiva do AdSense. Renderiza null quando o
 * AdSense não está configurado ou quando a posição não tem slot definido, então
 * pode ser colocada nas páginas sem exigir que a conta já esteja aprovada.
 *
 * Só usar em páginas públicas de conteúdo. As políticas do AdSense proíbem
 * anúncios em telas sem conteúdo próprio (login, cadastro) e queremos manter as
 * áreas logadas e de pagamento livres de anúncio.
 */
export function AdSlot({
  name,
  className,
  format = "auto",
}: {
  name: AdSlotName;
  className?: string;
  /**
   * Precisa bater com o tipo da unidade criada no painel do AdSense, senão o
   * anúncio não preenche:
   * - "auto": unidade de display responsiva.
   * - "fluid": unidade "No artigo", que herda a tipografia do texto ao redor.
   * - "autorelaxed": unidade multiplex (grade de recomendações).
   */
  format?: "auto" | "fluid" | "autorelaxed";
}) {
  const slot = ADSENSE_SLOTS[name];
  const insRef = useRef<HTMLModElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot) return;

    const ins = insRef.current;
    // O loader marca o <ins> preenchido com data-adsbygoogle-status. Sem essa
    // checagem, o StrictMode (que roda o efeito duas vezes em dev) faria um
    // segundo push no mesmo elemento e o AdSense jogaria "already have ads".
    if (!ins || ins.getAttribute("data-adsbygoogle-status")) return;

    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // Anúncio é acessório: bloqueador ou falha no loader não pode quebrar a página.
    }
  }, [slot, pathname]);

  if (!ADSENSE_CLIENT || !slot) return null;

  return (
    <div className={`ad-slot ${className ?? ""}`} aria-label="Publicidade">
      {/* `key` força um <ins> novo a cada rota: o AdSense não repreenche um
          elemento já usado, e sem isso a navegação client-side deixaria o
          espaço do anúncio vazio. */}
      <ins
        key={pathname}
        ref={insRef}
        className="adsbygoogle block"
        style={format === "fluid" ? { display: "block", textAlign: "center" } : { display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        // Só a unidade "No artigo" leva layout; multiplex e display quebram se receberem.
        {...(format === "fluid" ? { "data-ad-layout": "in-article" } : {})}
        // O AdSense ignora full-width-responsive fora do display responsivo.
        {...(format === "auto" ? { "data-full-width-responsive": "true" } : {})}
      />
    </div>
  );
}
