"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CAREER_SEGMENT_OPTIONS, type CareerSegment } from "@/lib/career-segments";
import { COMMON_PROFESSIONAL_AREAS } from "@/lib/course-catalog";

export function SettingsForm({
  initialSegment,
  initialArea,
  initialHasFormalEducation,
}: {
  initialSegment: CareerSegment | null;
  initialArea: string | null;
  initialHasFormalEducation: boolean | null;
}) {
  const router = useRouter();
  const [segment, setSegment] = useState<CareerSegment | "">(initialSegment ?? "");
  const [area, setArea] = useState(initialArea ?? "");
  const [hasFormalEducation, setHasFormalEducation] = useState<boolean | null>(
    initialHasFormalEducation
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerSegment: segment || null,
          professionalArea: area || null,
          hasFormalEducation,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar.");

      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Qual é o seu momento?</label>
        <select
          value={segment}
          onChange={(e) => setSegment(e.target.value as CareerSegment | "")}
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
        >
          <option value="">Prefiro não dizer</option>
          {CAREER_SEGMENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Qual é a sua área de atuação?</label>
        <input
          type="text"
          list="professional-areas"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="Ex: Eletricista, Cabeleireira, Tecnologia..."
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
        />
        <datalist id="professional-areas">
          {COMMON_PROFESSIONAL_AREAS.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={hasFormalEducation === false}
            onChange={(e) => setHasFormalEducation(e.target.checked ? false : null)}
            className="mt-0.5"
          />
          <span>
            Não tenho formação acadêmica na área, tenho cursos e/ou experiência prática.
          </span>
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && !error && <p className="text-sm text-emerald-600 dark:text-emerald-400">Salvo!</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-blue-600 text-white font-medium px-5 py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {saving ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
