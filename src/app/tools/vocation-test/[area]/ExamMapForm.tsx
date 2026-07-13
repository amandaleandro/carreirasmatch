"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import type { VocationAreaConfig } from "@/lib/vocation-areas";
import {
  EXAM_TYPE_OPTIONS,
  EXAM_TIME_UNTIL_OPTIONS,
  EXAM_WEEKLY_HOURS_OPTIONS,
  EXAM_SUBJECT_OPTIONS,
} from "@/lib/vocation-areas";
import type { ExamMapResult, ExamType } from "@/lib/tools";
import {
  CheckboxGroup,
  RadioGroup,
  QuizQuestion,
  toggleInArray,
  QUIZ_SUBMIT_BUTTON_CLASS,
} from "@/components/quiz-controls";

function ExamMapResultView({
  result,
  area,
}: {
  result: ExamMapResult;
  area: VocationAreaConfig;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSaveCalendar() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/tools/study-calendar/${area.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeklySchedule: result.weeklySchedule }),
      });
      if (!res.ok) throw new Error("Erro ao salvar calendário.");
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-5 shadow-sm">
        <h3 className="font-bold mb-3">O que estudar primeiro</h3>
        <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
          {result.studyPlan.essential.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
        {result.studyPlan.niceToHave.length > 0 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mt-4 mb-1.5">
              Bom ter, mas não bloqueia
            </p>
            <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
              {result.studyPlan.niceToHave.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </>
        )}
        {result.studyPlan.later.length > 0 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mt-4 mb-1.5">
              Pode ficar para depois
            </p>
            <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
              {result.studyPlan.later.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="font-bold">Cronograma das próximas semanas</h3>
        </div>
        <div className="space-y-3">
          {result.weeklySchedule.map((block) => (
            <div key={block.week}>
              <p className="text-sm font-medium">
                Semana {block.week}, {block.focus}
              </p>
              <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
                {block.tasks.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          {saved ? (
            <Link
              href={`/tools/vocation-test/${area.slug}/study-calendar`}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Ver calendário salvo →
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleSaveCalendar}
              disabled={saving}
              className="text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 transition-colors disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar como calendário"}
            </button>
          )}
          {saveError && <p className="text-sm font-semibold text-red-500 mt-2">{saveError}</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-5 shadow-sm">
        <h3 className="font-bold mb-3">Dicas de redação</h3>
        <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
          {result.essayTips.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-5 shadow-sm">
        <h3 className="font-bold mb-2">Concorrência do curso</h3>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{result.courseCutoffNote}</p>
      </div>

      <p className="text-sm italic text-neutral-500 dark:text-neutral-400">{result.motivationalNote}</p>
    </div>
  );
}

export function ExamMapForm({ area }: { area: VocationAreaConfig }) {
  const [examType, setExamType] = useState<ExamType | "">("");
  const [timeUntilExam, setTimeUntilExam] = useState("");
  const [weeklyStudyHours, setWeeklyStudyHours] = useState("");
  const [subjectStrengths, setSubjectStrengths] = useState<string[]>([]);
  const [subjectWeaknesses, setSubjectWeaknesses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExamMapResult | null>(null);
  const [showForm, setShowForm] = useState(true);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!examType || !timeUntilExam || !weeklyStudyHours) {
      setError("Responda todas as perguntas do mapa de estudos.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/tools/exam-map/${area.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examType,
          timeUntilExam,
          weeklyStudyHours,
          subjectStrengths,
          subjectWeaknesses,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");

      setResult(data as ExamMapResult);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <header className="mb-6">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 rounded-full px-2.5 py-1 mb-3">
          Extra
        </span>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          Mapa de estudos para ENEM/vestibular, {area.label}
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          Conte como está sua preparação e receba um plano priorizado de estudos
          para o curso de {area.label}.
        </p>
      </header>

      {result && !showForm && (
        <div className="mb-8 space-y-4">
          <ExamMapResultView result={result} area={area} />
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Refazer mapa de estudos
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-7">
          <QuizQuestion label="Qual prova você vai fazer?">
            <RadioGroup
              name="examType"
              options={EXAM_TYPE_OPTIONS.map((o) => o.label)}
              value={EXAM_TYPE_OPTIONS.find((o) => o.value === examType)?.label ?? ""}
              onChange={(label) =>
                setExamType(EXAM_TYPE_OPTIONS.find((o) => o.label === label)!.value)
              }
            />
          </QuizQuestion>

          <QuizQuestion label="Quanto tempo falta até a prova?">
            <RadioGroup
              name="timeUntilExam"
              options={EXAM_TIME_UNTIL_OPTIONS}
              value={timeUntilExam}
              onChange={setTimeUntilExam}
            />
          </QuizQuestion>

          <QuizQuestion label="Quantas horas por semana você consegue estudar?">
            <RadioGroup
              name="weeklyStudyHours"
              options={EXAM_WEEKLY_HOURS_OPTIONS}
              value={weeklyStudyHours}
              onChange={setWeeklyStudyHours}
            />
          </QuizQuestion>

          <QuizQuestion label="Matérias que você mais domina" hint="pode marcar mais de uma">
            <CheckboxGroup
              options={EXAM_SUBJECT_OPTIONS}
              selected={subjectStrengths}
              onToggle={(o) => setSubjectStrengths((prev) => toggleInArray(prev, o))}
            />
          </QuizQuestion>

          <QuizQuestion label="Matérias com mais dificuldade" hint="pode marcar mais de uma">
            <CheckboxGroup
              options={EXAM_SUBJECT_OPTIONS}
              selected={subjectWeaknesses}
              onToggle={(o) => setSubjectWeaknesses((prev) => toggleInArray(prev, o))}
            />
          </QuizQuestion>

          {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

          <button type="submit" disabled={loading} className={QUIZ_SUBMIT_BUTTON_CLASS}>
            {loading ? "Gerando mapa..." : "Gerar meu mapa de estudos"}
          </button>
        </form>
      )}
    </div>
  );
}
