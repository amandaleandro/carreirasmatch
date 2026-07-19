"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SESSION_KEY = "cm_analytics_session";
const OPT_OUT_KEY = "cm_analytics_opt_out";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function isOptedOut() {
  try {
    return localStorage.getItem(OPT_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

function getSessionId() {
  const now = Date.now();
  try {
    const stored = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null") as {
      id?: string;
      lastSeen?: number;
    } | null;
    const id =
      stored?.id && stored.lastSeen && now - stored.lastSeen < SESSION_TIMEOUT_MS
        ? stored.id
        : crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id, lastSeen: now }));
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function AccessTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    // Ao acessar o painel admin (so o dono acessa), marca este navegador para
    // nunca mais entrar na contagem de visitas.
    if (pathname.startsWith("/admin")) {
      try {
        localStorage.setItem(OPT_OUT_KEY, "1");
      } catch {
        // ignora indisponibilidade de storage
      }
      return;
    }

    // Navegadores marcados (dono/equipe) nao contam.
    if (isOptedOut()) return;

    const body = JSON.stringify({
      sessionId: getSessionId(),
      path: pathname,
      referrer: document.referrer,
      source: searchParams.get("utm_source") ?? "",
      medium: searchParams.get("utm_medium") ?? "",
      campaign: searchParams.get("utm_campaign") ?? "",
      content: searchParams.get("utm_content") ?? "",
      term: searchParams.get("utm_term") ?? "",
    });

    const parsed = JSON.parse(body) as {
      sessionId: string; source: string; medium: string; campaign: string; content: string;
    };
    let previous: Record<string, string> = {};
    try {
      previous = JSON.parse(localStorage.getItem("cm_attribution") ?? "{}") as Record<string, string>;
    } catch {
      previous = {};
    }
    localStorage.setItem("cm_attribution", JSON.stringify({
      sessionId: parsed.sessionId,
      source: parsed.source || previous.source || "",
      medium: parsed.medium || previous.medium || "",
      campaign: parsed.campaign || previous.campaign || "",
      content: parsed.content || previous.content || "",
    }));

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/page-view", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/analytics/page-view", {
        method: "POST",
        body,
        headers: { "content-type": "application/json" },
        keepalive: true,
      });
    }
  }, [pathname, searchParams]);

  return null;
}
