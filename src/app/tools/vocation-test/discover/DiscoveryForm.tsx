"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import {
  DISCOVERY_ENJOYS_OPTIONS,
  VOCATION_PEOPLE_OR_PROCESS_OPTIONS,
  VOCATION_WORK_STYLE_OPTIONS,
  EDUCATION_PREFERENCE_OPTIONS,
} from "@/lib/vocation-areas";
import type { DiscoveryResult } from "@/lib/tools";
import { LeadGate, getStoredLeadContact } from "@/components/lead-gate";

type DiscoveryResultWithId = DiscoveryResult & { resultId?: string };

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

const PATH_LABELS: Record<string, string> = {
  faculdade: "Faculdade",
  tecnico: "Curso técnico",
  ambos: "Faculdade ou técnico",
};

function ResultView({ result }: { result: DiscoveryResult }) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Áreas recomendadas para você</h2>
      {result.recommendedAreas.map((area, i) => (
        <div key={i} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="font-semibold">
              {i + 1}. {area.areaLabel}
            </h3>
            <span className="text-xs rounded-full px-2.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 shrink-0">
              {PATH_LABELS[area.suggestedPath] ?? area.suggestedPath}
            </span>
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-2">{area.fitReason}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">{area.pathReason}</p>
          <Link
            href={`/tools/vocation-test/${area.areaSlug}`}
            className="inline-block text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Fazer o teste de caminho dentro de {area.areaLabel} →
          </Link>
        </div>
      ))}
    </div>
  );
}

export function DiscoveryForm({
  initialResult,
  loggedIn = false,
}: {
  initialResult: DiscoveryResult | null;
  loggedIn?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [enjoys, setEnjoys] = useState<string[]>([]);
  const [peopleOrSystems, setPeopleOrSystems] = useState("");
  const [workStyle, setWorkStyle] = useState("");
  const [educationPreference, setEducationPreference] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiscoveryResultWithId | null>(null);
  const [showForm, setShowForm] = useState(!initialResult);
  const [leadUnlocked, setLeadUnlocked] = useState(() => loggedIn || Boolean(getStoredLeadContact()));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (enjoys.length === 0 || !peopleOrSystems || !workStyle || !educationPreference) {
      setError("Marque pelo menos uma opção em cada pergunta do quiz.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      if (file) formData.append("resume", file);
      formData.append("enjoys", enjoys.join(", "));
      formData.append("peopleOrSystems", peopleOrSystems);
      formData.append("workStyle", workStyle);
      formData.append("educationPreference", educationPreference);

      const res = await fetch("/api/tools/vocation-test/discover", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");

      setResult(data as DiscoveryResultWithId);
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
        ← Voltar
      </Link>
      <header className="mt-4 mb-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Etapa 1: descubra sua área
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Responda o quiz para descobrir quais áreas amplas mais combinam com você e se o
          caminho ideal é faculdade, curso técnico, ou os dois.
        </p>
      </header>

      {displayedResult && !showForm && !leadUnlocked && (
        <div className="mb-10">
          <LeadGate
            source="vocation_test"
            vocationTestResultId={result?.resultId}
            title="Seu resultado está pronto!"
            description="Preencha seus dados para ver quais áreas combinam com você."
            onUnlocked={() => setLeadUnlocked(true)}
          />
        </div>
      )}

      {displayedResult && !showForm && leadUnlocked && (
        <div className="mb-10 space-y-4">
          <ResultView result={displayedResult} />
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
              options={DISCOVERY_ENJOYS_OPTIONS}
              selected={enjoys}
              onToggle={(o) => setEnjoys((prev) => toggleInArray(prev, o))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Prefere trabalhar mais com pessoas ou com processos/sistemas?
            </label>
            <RadioGroup
              name="peopleOrSystems"
              options={VOCATION_PEOPLE_OR_PROCESS_OPTIONS}
              value={peopleOrSystems}
              onChange={setPeopleOrSystems}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Como prefere trabalhar?</label>
            <RadioGroup
              name="workStyle"
              options={VOCATION_WORK_STYLE_OPTIONS}
              value={workStyle}
              onChange={setWorkStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Você prefere seguir faculdade, curso técnico, ou ainda não decidiu?
            </label>
            <RadioGroup
              name="educationPreference"
              options={EDUCATION_PREFERENCE_OPTIONS}
              value={educationPreference}
              onChange={setEducationPreference}
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
            {loading ? "Analisando..." : "Descobrir minha área"}
          </button>
        </form>
      )}
    </main>
  );
}
