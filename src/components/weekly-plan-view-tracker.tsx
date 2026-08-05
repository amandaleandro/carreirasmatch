"use client";

import { useEffect } from "react";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";

/** Dispara weekly_plan_viewed quando o bloco "Plano da semana" do dashboard é renderizado.
 * Componente sem UI própria — só existe para acionar o track() em um Client Component,
 * já que a página do dashboard é Server Component. */
export function WeeklyPlanViewTracker({ variant }: { variant: "applications" | "study" }) {
  useEffect(() => {
    track(ANALYTICS_EVENTS.WEEKLY_PLAN_VIEWED, { variant });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
