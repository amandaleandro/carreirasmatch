"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ThemePreference = "light" | "dark" | "system";

const OPTIONS: { value: ThemePreference; label: string; description: string }[] = [
  { value: "light", label: "Claro", description: "Sempre usar o modo claro." },
  { value: "dark", label: "Escuro", description: "Sempre usar o modo escuro." },
  { value: "system", label: "Automático", description: "Seguir o tema do seu dispositivo." },
];

export function ThemeForm({ initialTheme }: { initialTheme: ThemePreference }) {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemePreference>(initialTheme);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(value: ThemePreference) {
    setTheme(value);
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themePreference: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={saving}
            onClick={() => handleChange(option.value)}
            className={`rounded-md border px-3 py-2.5 text-sm font-medium text-left transition-colors disabled:opacity-50 ${
              theme === option.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground hover:bg-surface"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {OPTIONS.find((o) => o.value === theme)?.description} As páginas de vagas e ferramentas de
        carreira sempre são exibidas no modo claro, para facilitar a leitura.
      </p>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
