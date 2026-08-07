import { ArrowRight } from "lucide-react";
import { JOURNEYS, type JourneyKey } from "@/lib/journeys";
import { JourneyCtaLink } from "@/components/journey-cta-link";

// Conecta uma ferramenta solta (ATS checker, teste vocacional, etc.) de volta
// à oferta maior da jornada, em vez de deixar a ferramenta como um fim em si
// mesma (arquitetura de ofertas, secao 13).
export function JourneyUpsellBanner({
  journey,
  tier = "oneOff",
  title,
  description,
}: {
  journey: JourneyKey;
  tier?: "oneOff" | "subscription";
  title: string;
  description: string;
}) {
  const data = JOURNEYS[journey];
  const cta = tier === "subscription" ? data.subscription : data.oneOff;
  if (!cta) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 text-center dark:border-blue-950/60 dark:bg-blue-950/20">
        <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>
        <JourneyCtaLink
          href={cta.href}
          journey={journey}
          tier={tier}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all"
        >
          {cta.label}
          <ArrowRight className="h-4 w-4" />
        </JourneyCtaLink>
      </div>
    </div>
  );
}
