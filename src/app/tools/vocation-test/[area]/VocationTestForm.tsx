"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import type { VocationAreaConfig } from "@/lib/vocation-areas";
import { VOCATION_PEOPLE_OR_PROCESS_OPTIONS, VOCATION_WORK_STYLE_OPTIONS } from "@/lib/vocation-areas";
import { ExamMapForm } from "./ExamMapForm";
import { LeadGate, getStoredLeadContact } from "@/components/lead-gate";

type VocationResult = {
  recommendedAreas: {
    area: string;
    fitReason: string;
    firstSteps: string[];
  }[];
  accessibleAreasFromResume: string[];
  resultId?: string;
};

function CheckboxGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {options.map((option) => {
        const checked = selected.includes(option);
        return (
          <label
            key={option}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
              checked
                ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-500"
                : "border-neutral-300 dark:border-neutral-700"
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(option)}
              className="h-4 w-4 accent-blue-600"
            />
            {option}
          </label>
        );
      })}
    </div>
  );
}

function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (option: string) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {options.map((option) => {
        const checked = value === option;
        return (
          <label
            key={option}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
              checked
                ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-500"
                : "border-neutral-300 dark:border-neutral-700"
            }`}
          >
            <input
              type="radio"
              name={name}
              checked={checked}
              onChange={() => onChange(option)}
              className="h-4 w-4 accent-blue-600"
            />
            {option}
          </label>
        );
      })}
    </div>
  );
}

function toggleInArray(list: string[], option: string) {
  return list.includes(option) ? list.filter((o) => o !== option) : [...list, option];
}

function ResultView({ result, areaLabel }: { result: VocationResult; areaLabel: string }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Áreas recomendadas para você</h2>
        {result.recommendedAreas.map((area, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <h3 className="font-semibold mb-1">
              {i + 1}. {area.area}
            </h3>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">{area.fitReason}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1.5">
              Primeiros passos
            </p>
            <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
              {area.firstSteps.map((step, j) => (
                <li key={j}>{step}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {result.accessibleAreasFromResume.length > 0 && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
          <h3 className="font-semibold mb-3">Áreas mais acessíveis agora (com base no seu currículo)</h3>
          <div className="flex flex-wrap gap-2">
            {result.accessibleAreasFromResume.map((a, i) => (
              <span
                key={i}
                className="text-xs rounded-full px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          Agora é hora de colocar isso em prática: monte seu currículo e veja quais vagas de
          estágio em {areaLabel} combinam com o seu perfil.
        </p>
        <Link
          href="/analise?track=internship"
          className="shrink-0 inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors"
        >
          Buscar vagas de estágio →
        </Link>
      </div>
    </div>
  );
}

export function VocationTestForm({
  area,
  initialResult,
  alreadyEnrolled = false,
  loggedIn = false,
}: {
  area: VocationAreaConfig;
  initialResult: VocationResult | null;
  alreadyEnrolled?: boolean;
  loggedIn?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [enjoysProblemSolving, setEnjoysProblemSolving] = useState<string[]>([]);
  const [prefersPeopleOrSystems, setPrefersPeopleOrSystems] = useState("");
  const [interestAreas, setInterestAreas] = useState<string[]>([]);
  const [workStylePreference, setWorkStylePreference] = useState("");
  const [priorExperience, setPriorExperience] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VocationResult | null>(null);
  const [showForm, setShowForm] = useState(!initialResult);
  const [leadUnlocked, setLeadUnlocked] = useState(() => loggedIn || Boolean(getStoredLeadContact()));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      enjoysProblemSolving.length === 0 ||
      !prefersPeopleOrSystems ||
      interestAreas.length === 0 ||
      !workStylePreference ||
      priorExperience.length === 0
    ) {
      setError("Marque pelo menos uma opção em cada pergunta do quiz.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      if (file) formData.append("resume", file);
      formData.append("enjoysProblemSolving", enjoysProblemSolving.join(", "));
      formData.append("prefersPeopleOrSystems", prefersPeopleOrSystems);
      formData.append("interestAreas", interestAreas.join(", "));
      formData.append("workStylePreference", workStylePreference);
      formData.append("priorExperience", priorExperience.join(", "));
      formData.append("alreadyEnrolled", String(alreadyEnrolled));

      const res = await fetch(`/api/tools/vocation-test/${area.slug}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");

      setResult(data as VocationResult);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  const displayedResult = result ?? initialResult;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link
        href="/tools/vocation-test"
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        ← Voltar para áreas
      </Link>
      <header className="mt-4 mb-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {alreadyEnrolled ? `Sua especialização em ${area.label}` : `Vocação em ${area.label}`}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          {alreadyEnrolled
            ? `Você já faz ${area.label}. Marque as opções que mais combinam com você (e, se quiser, envie seu currículo) para descobrir qual caminho seguir dentro do seu curso.`
            : `Marque as opções que mais combinam com você (e, se quiser, envie seu currículo) para descobrir quais caminhos dentro de ${area.label} mais combinam com você e quais estão mais acessíveis agora.`}
        </p>
        {!alreadyEnrolled && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            <Link
              href={`/tools/vocation-test/${area.slug}/study-calendar`}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Ver calendário de estudos →
            </Link>
            <Link
              href={`/tools/vocation-test/${area.slug}/cutoff-estimate`}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Calcular chance no SISU →
            </Link>
          </div>
        )}
      </header>

      {displayedResult && !showForm && !leadUnlocked && (
        <div className="mb-10">
          <LeadGate
            source="vocation_test"
            vocationTestResultId={result?.resultId}
            title="Seu resultado está pronto!"
            description="Preencha seus dados para ver quais caminhos combinam com você."
            onUnlocked={() => setLeadUnlocked(true)}
          />
        </div>
      )}

      {displayedResult && !showForm && leadUnlocked && (
        <div className="mb-10 space-y-4">
          <ResultView result={displayedResult} areaLabel={area.label} />
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Refazer teste
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              O que mais gosta de fazer no dia a dia?{" "}
              <span className="text-neutral-500 font-normal">(pode marcar mais de uma)</span>
            </label>
            <CheckboxGroup
              options={area.enjoysOptions}
              selected={enjoysProblemSolving}
              onToggle={(o) => setEnjoysProblemSolving((prev) => toggleInArray(prev, o))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Prefere trabalhar mais com pessoas ou com processos/sistemas?
            </label>
            <RadioGroup
              name="prefersPeopleOrSystems"
              options={VOCATION_PEOPLE_OR_PROCESS_OPTIONS}
              value={prefersPeopleOrSystems}
              onChange={setPrefersPeopleOrSystems}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Que caminhos dentro de {area.label} já despertaram seu interesse?{" "}
              <span className="text-neutral-500 font-normal">(pode marcar mais de uma)</span>
            </label>
            <CheckboxGroup
              options={[...area.subareas, "Ainda não sei"]}
              selected={interestAreas}
              onToggle={(o) => setInterestAreas((prev) => toggleInArray(prev, o))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Como prefere trabalhar?</label>
            <RadioGroup
              name="workStylePreference"
              options={VOCATION_WORK_STYLE_OPTIONS}
              value={workStylePreference}
              onChange={setWorkStylePreference}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Alguma experiência prévia relevante?{" "}
              <span className="text-neutral-500 font-normal">(pode marcar mais de uma)</span>
            </label>
            <CheckboxGroup
              options={area.priorExperienceOptions}
              selected={priorExperience}
              onToggle={(o) => setPriorExperience((prev) => toggleInArray(prev, o))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Currículo em PDF (opcional, melhora a precisão)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-neutral-900 file:text-white file:px-4 file:py-2 dark:file:bg-white dark:file:text-neutral-900"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium py-2.5 disabled:opacity-50"
          >
            {loading ? "Analisando..." : "Descobrir minha vocação"}
          </button>
        </form>
      )}

      {!alreadyEnrolled && <ExamMapForm area={area} />}
    </main>
  );
}
