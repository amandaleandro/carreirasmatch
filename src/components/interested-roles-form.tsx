"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COMMON_PROFESSIONAL_AREAS } from "@/lib/course-catalog";

export function InterestedRolesForm({ initialRoles }: { initialRoles: string[] }) {
  const router = useRouter();
  const [roles, setRoles] = useState<string[]>(initialRoles);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function persist(next: string[]) {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interestedRoles: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar.");

      setRoles(next);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  function addRole(role: string) {
    const trimmed = role.trim();
    if (!trimmed || roles.includes(trimmed) || roles.length >= 20) return;
    setInput("");
    persist([...roles, trimmed]);
  }

  function removeRole(role: string) {
    persist(roles.filter((r) => r !== role));
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium mb-1">
        Quais cargos têm o seu interesse?
      </label>

      {roles.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <li
              key={role}
              className="flex items-center gap-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-3 py-1 text-sm"
            >
              {role}
              <button
                type="button"
                onClick={() => removeRole(role)}
                disabled={saving}
                aria-label={`Remover ${role}`}
                className="text-neutral-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          list="interested-roles-suggestions"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addRole(input);
            }
          }}
          placeholder="Ex: Eletricista, Vendedor(a)..."
          className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
        />
        <datalist id="interested-roles-suggestions">
          {COMMON_PROFESSIONAL_AREAS.filter((option) => !roles.includes(option)).map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        <button
          type="button"
          onClick={() => addRole(input)}
          disabled={saving || !input.trim()}
          className="rounded-md border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && !error && <p className="text-sm text-emerald-600 dark:text-emerald-400">Salvo!</p>}
    </div>
  );
}
