"use client";

import { useState } from "react";
import { X } from "lucide-react";

type CandidateStatus = "none" | "favorite" | "approved" | "rejected";

export type ScreeningCandidate = {
  id: string;
  candidateName: string;
  fileName: string;
  fitScore: number;
  reason: string;
  status: CandidateStatus;
  note: string;
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
  const header = ["Posição", "Candidato", "Arquivo", "Aderência", "Status", "Justificativa", "Anotação"];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = candidates.map((c, i) =>
    [
      String(i + 1),
      c.candidateName || "",
      c.fileName,
      String(c.fitScore),
      c.status === "none" ? "" : STATUS_META[c.status].label,
      c.reason.replace(/\r?\n/g, " "),
      (c.note ?? "").replace(/\r?\n/g, " "),
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
  const [filter, setFilter] = useState<"all" | "favorite" | "approved" | "rejected">("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const MAX_COMPARE = 3;
  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= MAX_COMPARE ? prev : [...prev, id]
    );
  }
  const compareList = selected
    .map((id) => candidates.find((c) => c.id === id))
    .filter((c): c is ScreeningCandidate => Boolean(c));

  const counts = {
    all: candidates.length,
    favorite: candidates.filter((c) => c.status === "favorite").length,
    approved: candidates.filter((c) => c.status === "approved").length,
    rejected: candidates.filter((c) => c.status === "rejected").length,
  };
  const visible = filter === "all" ? candidates : candidates.filter((c) => c.status === filter);

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

  function updateNoteLocal(id: string, note: string) {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, note } : c)));
  }

  async function saveNote(id: string, note: string) {
    try {
      await fetch("/api/empresa/triagem/candidato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: id, note }),
      });
    } catch {
      // Silencioso: a nota fica no estado local; nova tentativa no próximo blur.
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {([
            ["all", "Todos"],
            ["favorite", "★ Favoritos"],
            ["approved", "Aprovados"],
            ["rejected", "Reprovados"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === key
                  ? "bg-blue-600 text-white"
                  : "border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              }`}
            >
              {label} ({counts[key]})
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="shrink-0 rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
        >
          Exportar CSV
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-neutral-500 py-6 text-center">Nenhum candidato nesse filtro.</p>
      ) : (
      <ol className="space-y-3">
        {visible.map((c) => {
          const rank = candidates.findIndex((x) => x.id === c.id) + 1;
          return (
          <li key={c.id} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-neutral-400">#{rank}</span>
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
              <label
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                  selected.includes(c.id)
                    ? "border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300"
                    : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(c.id)}
                  onChange={() => toggleSelect(c.id)}
                  disabled={!selected.includes(c.id) && selected.length >= MAX_COMPARE}
                  className="accent-blue-600"
                />
                Comparar
              </label>
              <button
                type="button"
                onClick={() => setExpanded((cur) => (cur === c.id ? null : c.id))}
                className="ml-auto rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                {expanded === c.id ? "Ocultar currículo" : "Ver currículo"}
              </button>
            </div>

            <textarea
              value={c.note}
              onChange={(e) => updateNoteLocal(c.id, e.target.value)}
              onBlur={(e) => saveNote(c.id, e.target.value)}
              rows={1}
              placeholder="Anotação interna (salva ao sair do campo)..."
              className="mt-3 w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-y"
            />

            {expanded === c.id && (
              <div className="mt-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 p-4 max-h-96 overflow-y-auto">
                <p className="text-xs text-neutral-500 mb-2">{c.fileName}</p>
                <pre className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {c.rawText || "Texto do currículo indisponível."}
                </pre>
              </div>
            )}
          </li>
          );
        })}
      </ol>
      )}

      {selected.length > 0 && (
        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-900/95 backdrop-blur px-4 py-3 shadow-lg">
          <span className="text-sm font-medium">
            {selected.length} selecionado{selected.length > 1 ? "s" : ""} (máx. {MAX_COMPARE})
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelected([])}
              className="rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={() => setCompareOpen(true)}
              disabled={selected.length < 2}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Comparar
            </button>
          </div>
        </div>
      )}

      {compareOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-950/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
          onClick={() => setCompareOpen(false)}
        >
          <div
            className="w-full max-w-4xl my-8 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 p-4">
              <h3 className="font-semibold">Comparar candidatos</h3>
              <button type="button" onClick={() => setCompareOpen(false)} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
            <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${compareList.length}, minmax(0, 1fr))` }}>
              {compareList.map((c) => (
                <div key={c.id} className="space-y-3 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-sm font-bold ${scoreColor(c.fitScore)}`}>{c.fitScore}</span>
                    {c.status !== "none" && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_META[c.status].badge}`}>
                        {STATUS_META[c.status].label}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold break-words">{c.candidateName || c.fileName}</h4>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 mb-1">Aderência</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{c.reason || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 mb-1">Anotação</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">{c.note || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
