"use client";

import { useState } from "react";

type CandidateStatus = "none" | "favorite" | "approved" | "rejected";

export type ScreeningCandidate = {
  id: string;
  candidateName: string;
  fileName: string;
  fitScore: number;
  reason: string;
  status: CandidateStatus;
  rawText: string;
};

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900";
  if (score >= 40) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900";
  return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900";
}

const STATUS_META: Record<Exclude<CandidateStatus, "none">, { label: string; badge: string }> = {
  favorite: { label: "Favorito", badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" },
  approved: { label: "Aprovado", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" },
  rejected: { label: "Reprovado", badge: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300" },
};

function toCsv(jobTitle: string, candidates: ScreeningCandidate[]): string {
  const header = ["Posição", "Candidato", "Arquivo", "Nota", "Status", "Justificativa"];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = candidates.map((c, i) =>
    [
      String(i + 1),
      c.candidateName || "",
      c.fileName,
      String(c.fitScore),
      c.status === "none" ? "" : STATUS_META[c.status].label,
      c.reason.replace(/\r?\n/g, " "),
    ]
      .map(escape)
      .join(",")
  );
  return [`# ${jobTitle}`, header.map(escape).join(","), ...rows].join("\n");
}

export function ScreeningResults({
  jobTitle,
  candidates: initial,
}: {
  jobTitle: string;
  candidates: ScreeningCandidate[];
}) {
  const [candidates, setCandidates] = useState<ScreeningCandidate[]>(initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  async function setStatus(id: string, next: CandidateStatus) {
    const current = candidates.find((c) => c.id === id)?.status ?? "none";
    const target = current === next ? "none" : next; // clicar de novo desmarca
    setSaving(id);
    // Atualização otimista.
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, status: target } : c)));
    try {
      const res = await fetch("/api/empresa/triagem/candidato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: id, status: target }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Reverte se falhar.
      setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, status: current } : c)));
    } finally {
      setSaving(null);
    }
  }

  function exportCsv() {
    const csv = toCsv(jobTitle, candidates);
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `triagem-${jobTitle.replace(/[^\w-]+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const actionBtn = (id: string, kind: Exclude<CandidateStatus, "none">, current: CandidateStatus, label: string) => {
    const on = current === kind;
    const tone =
      kind === "favorite"
        ? on ? "bg-amber-500 text-white border-amber-500" : "border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40"
        : kind === "approved"
        ? on ? "bg-emerald-600 text-white border-emerald-600" : "border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
        : on ? "bg-red-600 text-white border-red-600" : "border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40";
    return (
      <button
        type="button"
        onClick={() => setStatus(id, kind)}
        disabled={saving === id}
        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${tone}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-neutral-500">
          {candidates.length} {candidates.length === 1 ? "candidato" : "candidatos"}
        </p>
        <button
          type="button"
          onClick={exportCsv}
          className="shrink-0 rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
        >
          Exportar CSV
        </button>
      </div>

      <ol className="space-y-3">
        {candidates.map((c, index) => (
          <li key={c.id} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-neutral-400">#{index + 1}</span>
                  <h3 className="font-semibold truncate">{c.candidateName || c.fileName}</h3>
                  {c.status !== "none" && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_META[c.status].badge}`}>
                      {STATUS_META[c.status].label}
                    </span>
                  )}
                </div>
                {c.reason && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">{c.reason}</p>
                )}
              </div>
              <span className={`shrink-0 rounded-full border px-3 py-1 text-sm font-bold ${scoreColor(c.fitScore)}`}>
                {c.fitScore}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2 flex-wrap border-t border-neutral-100 dark:border-neutral-900 pt-3">
              {actionBtn(c.id, "favorite", c.status, "★ Favorito")}
              {actionBtn(c.id, "approved", c.status, "Aprovar")}
              {actionBtn(c.id, "rejected", c.status, "Reprovar")}
              <button
                type="button"
                onClick={() => setExpanded((cur) => (cur === c.id ? null : c.id))}
                className="ml-auto rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                {expanded === c.id ? "Ocultar currículo" : "Ver currículo"}
              </button>
            </div>

            {expanded === c.id && (
              <div className="mt-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 p-4 max-h-96 overflow-y-auto">
                <p className="text-xs text-neutral-500 mb-2">{c.fileName}</p>
                <pre className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {c.rawText || "Texto do currículo indisponível."}
                </pre>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
