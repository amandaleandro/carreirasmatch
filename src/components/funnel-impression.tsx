"use client";

import { useEffect } from "react";
import { ANALYTICS_EVENTS, track, type AnalyticsEvent } from "@/lib/analytics";

export function FunnelImpression({
  event,
  analysisId,
  segment,
}: {
  event: AnalyticsEvent;
  analysisId?: string;
  segment?: string;
}) {
  useEffect(() => {
    track(event, {
      ...(analysisId ? { analysisId } : {}),
      ...(segment ? { segment } : {}),
    });
  }, [event, analysisId, segment]);
  return null;
}

export const TEASER_VIEWED_EVENT = ANALYTICS_EVENTS.DIAGNOSTIC_TEASER_VIEWED;
