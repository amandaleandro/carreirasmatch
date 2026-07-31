"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CAREER_SEGMENT_OPTIONS, type CareerSegment } from "@/lib/career-segments";
import { COMMON_PROFESSIONAL_AREAS, COMMON_STUDY_AREAS } from "@/lib/course-catalog";
import { MONITORED_CAREER_AREAS } from "@/lib/monitored-career-catalog";
import { useFeedback } from "@/components/feedback-provider";

const PROFILE_AREA_OPTIONS = Array.from(new Set([
  ...MONITORED_CAREER_AREAS.map((option) => option.label),
  ...COMMON_PROFESSIONAL_AREAS,
]));
const CAREER_SEGMENT_LABELS = new Set(CAREER_SEGMENT_OPTIONS.map((option) => option.label));
const cleanAreaValue = (value: string | null | undefined) => {
  const trimmed = value?.trim() ?? "";
  return CAREER_SEGMENT_LABELS.has(trimmed) ? "" : trimmed;
};

export function SettingsForm({
  initialSegment,
  initialArea,
  initialCurrentArea,
  initialTargetArea,
  initialStudyCourse,
  initialHasFormalEducation,
  initialCity,
  initialState,
}: {
  initialSegment: CareerSegment | null;
  initialArea: string | null;
  initialCurrentArea: string | null;
  initialTargetArea: string | null;
  initialStudyCourse: string | null;
  initialHasFormalEducation: boolean | null;
  initialCity: string | null;
  initialState: string | null;
}) {
  const { notify } = useFeedback();
  const router = useRouter();
  const [segment, setSegment] = useState<CareerSegment | "">(initialSegment ?? "");
  const [area, setArea] = useState(cleanAreaValue(initialArea));
  const [currentArea, setCurrentArea] = useState(cleanAreaValue(initialCurrentArea));
  const [targetArea, setTargetArea] = useState(cleanAreaValue(initialTargetArea ?? initialArea));
  const [studyCourse, setStudyCourse] = useState(initialStudyCourse ?? "");
  const [hasFormalEducation, setHasFormalEducation] = useState<boolean | null>(
    initialHasFormalEducation
  );
  const [state, setState] = useState(initialState ?? "");
  const [city, setCity] = useState(initialCity ?? "");
  const [cities, setCities] = useState<string[]>(initialCity ? [initialCity] : []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!state) {
      return;
    }
    let active = true;
    fetch(`/api/locations/cities?state=${encodeURIComponent(state)}`)
      .then((response) => response.json())
      .then((data) => {
        if (active && Array.isArray(data.cities)) setCities(data.cities.map((item: { name: string }) => item.name));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [state]);

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
          currentProfessionalArea: currentArea || null,
          targetProfessionalArea: targetArea || null,
          studyCourse: studyCourse || null,
          hasFormalEducation,
          state: state || null,
          city: city || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar.");

      setSaved(true);
      notify("success", "Preferências de carreira salvas.");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado.";
      setError(message);
      notify("error", message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">O que você quer alcançar agora?</label>
        <select
          value={segment}
          onChange={(e) => setSegment(e.target.value as CareerSegment | "")}
          className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="">Escolha seu objetivo principal</option>
          {CAREER_SEGMENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-neutral-500">
          Isso personaliza seu menu, suas vagas e suas recomendações.
        </p>
      </div>

      {(segment === "career_change" || segment === "career_pro") && (
        <div>
          <label className="block text-sm font-medium mb-1">
            {segment === "career_change" ? "Área de onde você está saindo" : "Área em que trabalha hoje"}
          </label>
          <select value={currentArea} onChange={(e) => setCurrentArea(e.target.value)} className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500">
            <option value="">Selecione a área</option>
            {currentArea && !PROFILE_AREA_OPTIONS.includes(currentArea) && <option value={currentArea}>{currentArea}</option>}
            {PROFILE_AREA_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
      )}

      {segment === "internship" && (
        <div>
          <label className="block text-sm font-medium mb-1">Curso que você faz</label>
          <select value={studyCourse} onChange={(e) => setStudyCourse(e.target.value)} className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500">
            <option value="">Selecione o curso</option>
            {studyCourse && !COMMON_STUDY_AREAS.includes(studyCourse) && <option value={studyCourse}>{studyCourse}</option>}
            {COMMON_STUDY_AREAS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          {segment === "student" ? "Qual profissão ou área interessa a você?" : "Qual é a sua área de atuação?"}
        </label>
        <select
          value={area}
          onChange={(e) => { setArea(e.target.value); setTargetArea(e.target.value); }}
          className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
        >
          <option value="">Selecione a área</option>
          {area && !PROFILE_AREA_OPTIONS.includes(area) && <option value={area}>{area}</option>}
          {(segment === "student" || segment === "internship" ? COMMON_STUDY_AREAS : PROFILE_AREA_OPTIONS).map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[120px_1fr]">
        <label className="text-sm font-medium">Estado
          <select value={state} onChange={(event) => { setState(event.target.value); setCity(""); setCities([]); }} className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm dark:border-white/10 dark:bg-neutral-900">
            <option value="">UF</option>
            {"AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ").map((uf) => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">Cidade
          <select value={city} onChange={(event) => setCity(event.target.value)} disabled={!state} className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm disabled:opacity-50 dark:border-white/10 dark:bg-neutral-900">
            <option value="">Selecione a cidade</option>
            {cities.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
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
        className="rounded-xl bg-blue-600 text-white font-semibold px-6 py-3 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
      >
        {saving ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
