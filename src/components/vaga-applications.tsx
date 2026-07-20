"use client";

import { useState } from "react";
import { APPLICATION_STATUSES, applicationStatusLabel } from "@/lib/vaga-fields";

export type VagaApplication = {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  city: string;
  state: string;
  message: string;
  status: string;
  note: string;
  createdAt: string;
};

const STATUS_TONE: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  reviewing: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  interview: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
};

function toCsv(apps: VagaApplication[]): string {
  const header = ["Nome", "E-mail", "Telefone", "Área", "Cidade", "UF", "Status", "Mensagem", "Anotação"];
  const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const rows = apps.map((a) =>
    [
      a.name,
      a.email,
      a.phone,
      a.area,
      [a.city, a.state].filter(Boolean).join("/"),
      applicationStatusLabel(a.status),
      a.message.replace(/\r?\n/g, " "),
      a.note.replace(/\r?\n/g, " "),
    ]
      .map(escape)
      .join(",")
  );
  return [header.map(escape).join(","), ...rows].join("\n");
}

export function VagaApplications({ applications: initial }: { applications: VagaApplication[] }) {
  const [apps, setApps] = useState<VagaApplication[]>(initial);
  const [view, setView] = useState<"list" | "board">("list");

  async function patch(id: string, payload: { status?: string; note?: string }) {
    try {
      await fetch(`/api/empresa/candidaturas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // silencioso: estado local mantém o valor; nova tentativa depois.
    }
  }

  function setStatus(id: string, status: string) {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    patch(id, { status });
  }

  function setNoteLocal(id: string, note: string) {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, note } : a)));
  }

  function exportCsv() {
    const blob = new Blob(["﻿" + toCsv(apps)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "candidaturas.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-800 p-0.5">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${view === "list" ? "bg-blue-600 text-white" : "text-neutral-600 dark:text-neutral-300"}`}
          >
            Lista
          </button>
          <button
            type="button"
            onClick={() => setView("board")}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${view === "board" ? "bg-blue-600 text-white" : "text-neutral-600 dark:text-neutral-300"}`}
          >
            Quadro
          </button>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="shrink-0 rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
        >
          Exportar CSV
        </button>
      </div>

      {view === "board" ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {APPLICATION_STATUSES.map((col) => {
            const colApps = apps.filter((a) => a.status === col.value);
            return (
              <div key={col.value} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 p-3 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{col.label}</span>
                  <span className="text-xs text-neutral-400">{colApps.length}</span>
                </div>
                <div className="space-y-2">
                  {colApps.map((a) => (
                    <div key={a.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3">
                      <p className="font-semibold text-sm truncate">{a.name || "Candidato"}</p>
                      {a.area && <p className="text-xs text-neutral-500 truncate">{a.area}</p>}
                      {a.email && <p className="text-xs text-neutral-500 truncate">{a.email}</p>}
                      <select
                        value={a.status}
                        onChange={(e) => setStatus(a.id, e.target.value)}
                        className="mt-2 w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-2 py-1 text-xs outline-none focus:border-blue-500"
                      >
                        {APPLICATION_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>Mover para: {s.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
      <ul className="space-y-3">
        {apps.map((a) => (
          <li key={a.id} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{a.name || "Candidato"}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_TONE[a.status] ?? STATUS_TONE.new}`}>
                    {applicationStatusLabel(a.status)}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {[a.area, [a.city, a.state].filter(Boolean).join("/")].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 space-y-0.5">
                  {a.email && <p>{a.email}</p>}
                  {a.phone && <p>{a.phone}</p>}
                </div>
                {a.message && (
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line">{a.message}</p>
                )}
              </div>
              <select
                value={a.status}
                onChange={(e) => setStatus(a.id, e.target.value)}
                className="shrink-0 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-2.5 py-1.5 text-sm outline-none focus:border-blue-500"
              >
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <textarea
              value={a.note}
              onChange={(e) => setNoteLocal(a.id, e.target.value)}
              onBlur={(e) => patch(a.id, { note: e.target.value })}
              rows={1}
              placeholder="Anotação interna (salva ao sair do campo)..."
              className="mt-3 w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-y"
            />
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}
