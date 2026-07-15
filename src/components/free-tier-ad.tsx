import { auth } from "@/auth";
import { hasActiveSubscriptionAccess } from "@/lib/entitlements";
import { isAdsEnabled, type AdSlotName } from "@/lib/adsense";
import { AdSlot } from "@/components/ad-slot";

/**
 * Anúncio para visitante anônimo e para usuário logado sem assinatura. Quem tem
 * assinatura ativa não vê anúncio — é parte do que ele está pagando.
 *
 * Use este componente (e não o AdSlot direto) em qualquer página que um
 * assinante possa abrir. AdSlot puro só faz sentido onde assinante nunca chega.
 *
 * É um Server Component: a checagem de assinatura fica no servidor, então o
 * bundle do cliente não recebe nada sobre o plano do usuário.
 */
export async function FreeTierAd({
  name,
  className,
  format,
}: {
  name: AdSlotName;
  className?: string;
  format?: "auto" | "fluid";
}) {
  // Evita o custo de auth()/consulta ao banco quando o AdSense nem está ligado.
  if (!isAdsEnabled()) return null;

  const session = await auth();
  if (session?.user?.id && (await hasActiveSubscriptionAccess(session.user.id))) {
    return null;
  }

  return <AdSlot name={name} className={className} format={format} />;
}
