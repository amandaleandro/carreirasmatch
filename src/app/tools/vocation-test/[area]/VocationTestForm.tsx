"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import type { VocationAreaConfig } from "@/lib/vocation-areas";
import { VOCATION_PEOPLE_OR_PROCESS_OPTIONS, VOCATION_WORK_STYLE_OPTIONS } from "@/lib/vocation-areas";
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

type VocationResult = {
  recommendedAreas: {
    area: string;
    fitReason: string;
    firstSteps: string[];
  }[];
  accessibleAreasFromResume: string[];
  resultId?: string;
};

function ResultView({ result, areaLabel }: { result: VocationResult; areaLabel: string }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="font-bold text-lg">Áreas recomendadas para você</h2>
        {result.recommendedAreas.map((area, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-5 shadow-sm">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <span className="h-6 w-6 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              {area.area}
            </h3>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">{area.fitReason}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 mb-1.5">
              Primeiros passos
            </p>
            <ul className="space-y-1.5">
              {area.firstSteps.map((step, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {result.accessibleAreasFromResume.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-5 shadow-sm">
          <h3 className="font-bold mb-3">Áreas mais acessíveis agora (com base no seu currículo)</h3>
          <div className="flex flex-wrap gap-2">
            {result.accessibleAreasFromResume.map((a, i) => (
              <span
                key={i}
                className="text-xs font-semibold rounded-full px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border-2 border-blue-100 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          Agora é hora de colocar isso em prática: monte seu currículo e veja quais oportunidades
          em {areaLabel} combinam com o seu perfil.
        </p>
        <Link
          href="/analise"
          className="shrink-0 inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors"
        >
          Ver oportunidades →
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
  hasCompletedGeneralTest = true,
}: {
  area: VocationAreaConfig;
  initialResult: VocationResult | null;
  alreadyEnrolled?: boolean;
  loggedIn?: boolean;
  hasCompletedGeneralTest?: boolean;
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
    <ContentPage
      eyebrow={alreadyEnrolled ? "Sua especialização" : "Teste vocacional"}
      title={alreadyEnrolled ? `Sua especialização em ${area.label}` : `Vocação em ${area.label}`}
      description={
        alreadyEnrolled
          ? `Você já faz ${area.label}. Marque as opções que mais combinam com você (e, se quiser, envie seu currículo) para descobrir qual caminho seguir dentro do seu curso.`
          : `Marque as opções que mais combinam com você (e, se quiser, envie seu currículo) para descobrir quais caminhos dentro de ${area.label} mais combinam com você e quais estão mais acessíveis agora.`
      }
      backHref="/tools/vocation-test"
      backLabel="← Voltar para áreas"
    >
      {!alreadyEnrolled && (
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 -mt-2 mb-6">
          <Link
            href={`/tools/vocation-test/${area.slug}/exam-map`}
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Gerar mapa ENEM/vestibular com assinatura -&gt;
          </Link>
          <Link
            href={`/tools/vocation-test/${area.slug}/cutoff-estimate`}
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Calcular chance no SISU →
          </Link>
        </div>
      )}

      {!alreadyEnrolled && !hasCompletedGeneralTest && (
        <div className="mb-6 rounded-2xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 p-4 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div>
            <p className="font-bold mb-0.5 text-amber-950 dark:text-amber-100">
              💡 Recomendação de Orientação Vocacional
            </p>
            <p>
              Para alunos do Ensino Médio, o ideal é fazer a <strong>Etapa 1 (Quiz Geral)</strong>{" "}
              primeiro para descobrir quais áreas mais combinam com você antes de testar a fundo a área de {area.label}.
            </p>
          </div>
          <Link
            href="/tools/vocation-test/discover"
            className="shrink-0 font-semibold text-blue-600 dark:text-blue-400 hover:underline bg-white dark:bg-neutral-900 px-3.5 py-2 rounded-xl border border-amber-200 dark:border-amber-800 text-xs shadow-xs"
          >
            Fazer Quiz Geral (Etapa 1) →
          </Link>
        </div>
      )}

      {displayedResult && !showForm && !leadUnlocked && (
        <LeadGate
          source="vocation_test"
          vocationTestResultId={result?.resultId}
          title="Seu resultado está pronto!"
          description="Preencha seus dados para ver quais caminhos combinam com você."
          onUnlocked={() => setLeadUnlocked(true)}
        />
      )}

      {displayedResult && !showForm && leadUnlocked && (
        <div className="space-y-4">
          <ResultView result={displayedResult} areaLabel={area.label} />
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
              options={area.enjoysOptions}
              selected={enjoysProblemSolving}
              onToggle={(o) => setEnjoysProblemSolving((prev) => toggleInArray(prev, o))}
            />
          </QuizQuestion>

          <QuizQuestion label="Prefere trabalhar mais com pessoas ou com processos/sistemas?">
            <RadioGroup
              name="prefersPeopleOrSystems"
              options={VOCATION_PEOPLE_OR_PROCESS_OPTIONS}
              value={prefersPeopleOrSystems}
              onChange={setPrefersPeopleOrSystems}
            />
          </QuizQuestion>

          <QuizQuestion
            label={`Que caminhos dentro de ${area.label} já despertaram seu interesse?`}
            hint="pode marcar mais de uma"
          >
            <CheckboxGroup
              options={[...area.subareas, "Ainda não sei"]}
              selected={interestAreas}
              onToggle={(o) => setInterestAreas((prev) => toggleInArray(prev, o))}
            />
          </QuizQuestion>

          <QuizQuestion label="Como prefere trabalhar?">
            <RadioGroup
              name="workStylePreference"
              options={VOCATION_WORK_STYLE_OPTIONS}
              value={workStylePreference}
              onChange={setWorkStylePreference}
            />
          </QuizQuestion>

          <QuizQuestion label="Alguma experiência prévia relevante?" hint="pode marcar mais de uma">
            <CheckboxGroup
              options={area.priorExperienceOptions}
              selected={priorExperience}
              onToggle={(o) => setPriorExperience((prev) => toggleInArray(prev, o))}
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
            {loading ? "Analisando..." : "Descobrir minha vocação"}
          </button>
        </form>
      )}

    </ContentPage>
  );
}
