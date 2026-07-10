"use client";

import { useEffect, useState } from "react";
import { GROQ_MODEL_OPTIONS } from "@/lib/groq-model-options";

export function AdminGroqModel() {
  const [current, setCurrent] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/groq-model")
      .then((res) => res.json())
      .then((data) => setCurrent(data.model))
      .catch(() => setMessage("Não foi possível carregar o modelo atual."));
  }, []);

  async function handleChange(model: string) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/groq-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar.");
      setCurrent(data.model);
      setMessage("Modelo atualizado. Novas análises já usam essa opção (em até 30s).");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="grid gap-2">
        {GROQ_MODEL_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`flex items-start gap-3 rounded-md border px-3 py-2 text-sm cursor-pointer ${
              current === option.value
                ? "border-blue-400 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40"
                : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
            }`}
          >
            <input
              type="radio"
              name="groq-model"
              className="mt-1"
              checked={current === option.value}
              disabled={saving || current === null}
              onChange={() => handleChange(option.value)}
            />
            <span>
              <span className="block font-medium">{option.label}</span>
              <span className="block text-xs text-neutral-500">{option.helper}</span>
            </span>
          </label>
        ))}
      </div>
      {message && <p className="mt-3 text-xs text-neutral-500">{message}</p>}
    </div>
  );
}
