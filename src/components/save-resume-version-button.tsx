"use client";

import { useState } from "react";

export function SaveResumeVersionButton({ applicationId, analysisId, summary, resumeStructured, approvedSuggestions }: { applicationId: string; analysisId?: string; summary: string; resumeStructured?: unknown; approvedSuggestions: unknown }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const response = await fetch(`/api/applications/${applicationId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: `Versão ${new Date().toLocaleDateString("pt-BR")}`, analysisId, summary, resumeStructured: resumeStructured ?? {}, approvedSuggestions }),
    });
    setSaving(false);
    if (response.ok) setSaved(true);
  }

  return <button type="button" onClick={() => void save()} disabled={saving} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:border-blue-400 hover:text-blue-600 disabled:opacity-60 dark:border-slate-800 dark:text-slate-200 dark:hover:border-blue-800">{saving ? "Salvando versão..." : saved ? "Versão salva" : "Salvar esta versão do currículo"}</button>;
}
