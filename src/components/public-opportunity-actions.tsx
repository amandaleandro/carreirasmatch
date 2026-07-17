"use client";

import { useState } from "react";

export function PublicOpportunityActions({ id, url }: { id: string; url: string }) {
  const [reported, setReported] = useState(false);
  const [saved, setSaved] = useState(false);

  async function open() {
    const params = new URLSearchParams(window.location.search);
    await fetch(`/api/public-opportunities/${id}/click`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sessionId: localStorage.getItem("cm_session_id") ?? "",
        campaign: params.get("utm_campaign") ?? "",
      }),
      keepalive: true,
    }).catch(() => {});
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function report() {
    await fetch(`/api/public-opportunities/${id}/report`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason: "closed" }),
    });
    setReported(true);
  }

  async function save() {
    const response = await fetch(`/api/public-opportunities/${id}/save`, { method: "POST" });
    if (response.status === 401) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    if (response.ok) setSaved(true);
  }

  return (
    <div className="mt-4 flex items-center gap-3">
      <button type="button" onClick={open} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
        Ver na fonte oficial
      </button>
      <button type="button" onClick={save} disabled={saved} className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 disabled:opacity-60 dark:border-blue-900 dark:text-blue-300">
        {saved ? "Salva no kanban" : "Salvar candidatura"}
      </button>
      <button type="button" onClick={report} disabled={reported} className="text-xs text-neutral-500 hover:text-red-600 disabled:opacity-60">
        {reported ? "Aviso enviado" : "Informar vaga encerrada"}
      </button>
    </div>
  );
}
