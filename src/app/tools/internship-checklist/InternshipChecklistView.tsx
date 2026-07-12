"use client";

import { useState } from "react";
import Link from "next/link";
import { INTERNSHIP_CHECKLIST_ITEMS } from "@/lib/internship-checklist";

export function InternshipChecklistView({ initialChecked }: { initialChecked: string[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set(initialChecked));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function persist(next: Set<string>) {
    setSaving(true);
    try {
      await fetch("/api/user/internship-checklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked: Array.from(next) }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      persist(next);
      return next;
    });
  }

  const total = INTERNSHIP_CHECKLIST_ITEMS.length;
  const done = INTERNSHIP_CHECKLIST_ITEMS.filter((item) => checked.has(item.key)).length;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link href="/tools" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar para ferramentas
      </Link>
      <header className="mt-4 mb-6">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
          Checklist
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Checklist de documentos de estágio
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          O que confirmar antes e durante o estágio, com base na Lei 11.788/2008. Marque conforme
          for verificando com a empresa e a instituição de ensino.
        </p>
      </header>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-1.5 flex-1 rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-1.5 rounded-full bg-emerald-500"
            style={{ width: `${total ? (done / total) * 100 : 0}%` }}
          />
        </div>
        <span className="text-sm font-semibold shrink-0">
          {done}/{total}
        </span>
      </div>

      <div className="space-y-2">
        {INTERNSHIP_CHECKLIST_ITEMS.map((item) => {
          const isChecked = checked.has(item.key);
          return (
            <label
              key={item.key}
              className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all hover:shadow-sm ${
                isChecked
                  ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-800"
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(item.key)}
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <div>
                <p
                  className={`text-sm font-medium ${
                    isChecked ? "line-through text-neutral-400" : ""
                  }`}
                >
                  {item.title}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">{item.description}</p>
              </div>
            </label>
          );
        })}
      </div>

      <p className="text-xs text-neutral-500 mt-4">
        {saved ? "Progresso salvo ✓" : saving ? "Salvando..." : ""}
      </p>
    </main>
  );
}
