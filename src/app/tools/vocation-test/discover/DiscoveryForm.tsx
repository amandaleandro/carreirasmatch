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
import { ContentPage } from "@/components/content-page";
import {
  CheckboxGroup,
  RadioGroup,
  QuizQuestion,
  toggleInArray,
  QUIZ_SUBMIT_BUTTON_CLASS,
  QUIZ_FILE_INPUT_CLASS,
} from "@/components/quiz-controls";

type DiscoveryResultWithId = DiscoveryResult & { resultId?: string };

const PATH_LABELS: Record<string, string> = {
  faculdade: "Faculdade",
  tecnico: "Curso técnico",
  ambos: "Faculdade ou técnico",
};

function ResultView({ result }: { result: DiscoveryResult }) {
  return (
    <div className="space-y-4">
      <h2 className="font-bold text-lg">Áreas recomendadas para você</h2>
      {result.recommendedAreas.map((area, i) => (
        <div key={i} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="font-bold flex items-center gap-2">
              <span className="h-6 w-6 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              {area.areaLabel}
            </h3>
            <span className="text-[11px] font-semibold rounded-full px-2.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 shrink-0">
              {PATH_LABELS[area.suggestedPath] ?? area.suggestedPath}
            </span>
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-2">{area.fitReason}</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">{area.pathReason}</p>
          <Link
            href={`/tools/vocation-test/${area.areaSlug}`}
            className="inline-block text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
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
    <ContentPage
      eyebrow="Etapa 1"
      title="Descubra sua área."
      description="Responda o quiz para descobrir quais áreas amplas mais combinam com você e se o caminho ideal é faculdade, curso técnico, ou os dois."
      backHref="/tools/vocation-test"
      backLabel="← Voltar"
    >
      {displayedResult && !showForm && !leadUnlocked && (
        <LeadGate
          source="vocation_test"
          vocationTestResultId={result?.resultId}
          title="Seu resultado está pronto!"
          description="Preencha seus dados para ver quais áreas combinam com você."
          onUnlocked={() => setLeadUnlocked(true)}
        />
      )}

      {displayedResult && !showForm && leadUnlocked && (
        <div className="space-y-4">
          <ResultView result={displayedResult} />
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Refazer teste
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-7">
          <QuizQuestion label="O que mais gosta de fazer no dia a dia?" hint="pode marcar mais de uma">
            <CheckboxGroup
              options={DISCOVERY_ENJOYS_OPTIONS}
              selected={enjoys}
              onToggle={(o) => setEnjoys((prev) => toggleInArray(prev, o))}
            />
          </QuizQuestion>

          <QuizQuestion label="Prefere trabalhar mais com pessoas ou com processos/sistemas?">
            <RadioGroup
              name="peopleOrSystems"
              options={VOCATION_PEOPLE_OR_PROCESS_OPTIONS}
              value={peopleOrSystems}
              onChange={setPeopleOrSystems}
            />
          </QuizQuestion>

          <QuizQuestion label="Como prefere trabalhar?">
            <RadioGroup
              name="workStyle"
              options={VOCATION_WORK_STYLE_OPTIONS}
              value={workStyle}
              onChange={setWorkStyle}
            />
          </QuizQuestion>

          <QuizQuestion label="Você prefere seguir faculdade, curso técnico, ou ainda não decidiu?">
            <RadioGroup
              name="educationPreference"
              options={EDUCATION_PREFERENCE_OPTIONS}
              value={educationPreference}
              onChange={setEducationPreference}
            />
          </QuizQuestion>

          <QuizQuestion label="Currículo em PDF" hint="opcional, melhora a precisão">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className={QUIZ_FILE_INPUT_CLASS}
            />
          </QuizQuestion>

          {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

          <button type="submit" disabled={loading} className={QUIZ_SUBMIT_BUTTON_CLASS}>
            {loading ? "Analisando..." : "Descobrir minha área"}
          </button>
        </form>
      )}
    </ContentPage>
  );
}
