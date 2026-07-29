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

function isDevelopmentOrLocalhost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".local") ||
    process.env.NODE_ENV === "development"
  );
}

type IdentifiedUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  accountType: "candidate" | "company" | "partner";
};

export function AccessTracker({ user }: { user: IdentifiedUser | null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!user) return;

    window.posthog?.identify(user.id, {
      email: user.email,
      name: user.name,
      account_type: user.accountType,
    });
  }, [user]);

  useEffect(() => {
    if (!pathname) return;

    // Ignora completamente o envio de estatisticas em ambiente local / desenvolvimento
    if (isDevelopmentOrLocalhost()) return;

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

    const rawSource = searchParams.get("utm_source") ?? "";
    const rawMedium = searchParams.get("utm_medium") ?? "";
    const rawCampaign = searchParams.get("utm_campaign") ?? "";
    const rawContent = searchParams.get("utm_content") ?? "";
    const rawTerm = searchParams.get("utm_term") ?? "";

    const currentSessionId = getSessionId();

    let previous: Record<string, string> = {};
    try {
      previous = JSON.parse(localStorage.getItem("cm_attribution") ?? "{}") as Record<string, string>;
    } catch {
      previous = {};
    }

    const attribution = {
      sessionId: currentSessionId,
      source: rawSource || previous.source || "",
      medium: rawMedium || previous.medium || "",
      campaign: rawCampaign || previous.campaign || "",
      content: rawContent || previous.content || "",
      term: rawTerm || previous.term || "",
    };

    try {
      localStorage.setItem("cm_attribution", JSON.stringify(attribution));
    } catch {
      // ignora indisponibilidade de storage
    }

    let externalReferrer = "";
    if (document.referrer) {
      try {
        const refUrl = new URL(document.referrer);
        const currentHost = window.location.hostname;
        if (
          refUrl.hostname !== currentHost &&
          !refUrl.hostname.endsWith("carreirasmatch.com.br") &&
          refUrl.hostname !== "localhost"
        ) {
          externalReferrer = document.referrer;
        }
      } catch {
        externalReferrer = "";
      }
    }

    const body = JSON.stringify({
      sessionId: currentSessionId,
      path: pathname,
      referrer: externalReferrer,
      source: attribution.source,
      medium: attribution.medium,
      campaign: attribution.campaign,
      content: attribution.content,
      term: attribution.term,
    });

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
