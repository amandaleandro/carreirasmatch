"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { matchAreaSlug } from "@/lib/vocation-areas";
import { MONITORED_CAREER_AREAS } from "@/lib/monitored-career-catalog";
import { useFeedback } from "@/components/feedback-provider";

export function InterestedRolesForm({
  initialRoles,
  initialArea,
}: {
  initialRoles: string[];
  initialArea: string | null;
}) {
  const router = useRouter();
  const { notify } = useFeedback();
  const [roles, setRoles] = useState<string[]>(initialRoles);
  const initialAreaSlug = (() => {
    const text = (initialArea ?? "").toLowerCase();
    const direct = MONITORED_CAREER_AREAS.find((area) => text.includes(area.label.toLowerCase()) || area.label.toLowerCase().includes(text));
    if (direct) return direct.slug;
    const vocationSlug = matchAreaSlug(initialArea ?? "");
    const aliases: Record<string, string> = { ti: "tecnologia", medicina: "saude", enfermagem: "saude", veterinaria: "agro", agronomia: "agro", "seguranca-publica": "servico-publico", artes: "artes-cultura", "gastronomia-turismo": "turismo" };
    return aliases[vocationSlug ?? ""] ?? "";
  })();
  const [areaSlug, setAreaSlug] = useState(initialAreaSlug);
  const [selectedRole, setSelectedRole] = useState("");
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
        body: JSON.stringify({
          interestedRoles: next,
          professionalArea: MONITORED_CAREER_AREAS.find((area) => area.slug === areaSlug)?.label ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar.");
      setRoles(next);
      setSaved(true);
      notify("success", "Preferências de cargos atualizadas.");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado.";
      setError(message);
      notify("error", message);
    } finally {
      setSaving(false);
    }
  }

  function removeRole(role: string) {
    void persist(roles.filter((item) => item !== role));
  }

  const selectedArea = MONITORED_CAREER_AREAS.find((area) => area.slug === areaSlug);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium mb-1">Cargo ou especialidade (subárea)</label>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Escolha uma área e depois um cargo ou especialidade dentro dela para o radar.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          value={areaSlug}
          onChange={(event) => { setAreaSlug(event.target.value); setSelectedRole(""); }}
          className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="">Selecione a área</option>
          {MONITORED_CAREER_AREAS.map((area) => <option key={area.slug} value={area.slug}>{area.label}</option>)}
        </select>
        <select
          value={selectedRole}
          onChange={(event) => setSelectedRole(event.target.value)}
          disabled={!selectedArea}
          className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
        >
          <option value="">Selecione o cargo</option>
          {selectedArea?.roles.map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
      </div>

      <button
        type="button"
        onClick={() => {
          if (selectedRole && !roles.includes(selectedRole) && roles.length < 20) {
            void persist([...roles, selectedRole]);
            setSelectedRole("");
          }
        }}
        disabled={saving || !selectedRole || roles.length >= 20}
        className="rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
      >Adicionar cargo</button>

      {roles.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <li key={role} className="flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-3 py-1 text-sm font-medium">
              {role}
              <button type="button" onClick={() => removeRole(role)} disabled={saving} aria-label={`Remover ${role}`} className="text-neutral-500 hover:text-red-600 disabled:opacity-50">×</button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && !error && <p className="text-sm text-emerald-600 dark:text-emerald-400">Salvo!</p>}
    </div>
  );
}
