"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SESSION_KEY = "cm_analytics_session";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

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
    if (!pathname || pathname.startsWith("/admin")) return;

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
