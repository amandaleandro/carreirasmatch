"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import type { JourneyKey } from "@/lib/journeys";

// Client leaf usado dentro de landing pages server-rendered (plano-de-candidatura,
// estudos, empresas/diagnostico) só para instrumentar clique de CTA sem precisar
// converter a página inteira em client component.
export function JourneyCtaLink({
  href,
  journey,
  tier,
  className,
  children,
}: {
  href: string;
  journey: JourneyKey;
  tier: "free" | "oneOff" | "subscription";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => track(ANALYTICS_EVENTS.LANDING_CTA_CLICKED, { journey, tier })}
    >
      {children}
    </Link>
  );
}
