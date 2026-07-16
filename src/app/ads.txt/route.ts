import { adsensePublisherId } from "@/lib/adsense";

// Certificação do Google para o campo TAGID do ads.txt - valor fixo e público,
// igual para todos os publishers do AdSense.
const GOOGLE_CERTIFICATION_AUTHORITY_ID = "f08c47fec0942fa0";

/**
 * Serve /ads.txt a partir do publisher id configurado, em vez de um arquivo
 * estático em public/, para não haver risco de o arquivo apontar para uma conta
 * diferente da que está no NEXT_PUBLIC_ADSENSE_CLIENT do ambiente.
 *
 * O Google exige esse arquivo para autorizar a venda do inventário do domínio;
 * sem ele os anúncios ficam limitados ou não são exibidos.
 */
export function GET() {
  const publisherId = adsensePublisherId();

  // Sem AdSense configurado não existe ads.txt legítimo para servir - 404 é o
  // que o crawler do Google espera nesse caso.
  if (!publisherId) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(
    `google.com, ${publisherId}, DIRECT, ${GOOGLE_CERTIFICATION_AUTHORITY_ID}\n`,
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
