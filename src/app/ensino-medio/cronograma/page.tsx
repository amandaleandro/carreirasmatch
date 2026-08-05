"use client";

import { useState } from "react";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnsinoMedioToolsNav } from "@/components/ensino-medio-tools-nav";
import { GeneratedStudySchedule } from "@/lib/ensino-medio-tools";
import {
  Calendar,
  Sparkles,
  RotateCcw,
} from "lucide-react";

const DAYS_LIST = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const SUBJECTS_LIST = [
  "Matemática",
  "Português",
  "Biologia",
  "Física",
  "Química",
  "História",
  "Geografia",
  "Filosofia/Sociologia",
];

export default function StudySchedulePage() {
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [selectedDays, setSelectedDays] = useState(["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]);
  const [subjectLevels, setSubjectLevels] = useState<Record<string, "fraco" | "medio" | "forte">>({
    Matemática: "fraco",
    Física: "fraco",
    Biologia: "medio",
    Português: "forte",
  });
  const [goal, setGoal] = useState("ENEM e Vestibulares");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<GeneratedStudySchedule | null>(null);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleGenerate = async () => {
    if (selectedDays.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ensino-medio/cronograma/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availableHoursPerDay: hoursPerDay,
          availableDays: selectedDays,
          subjectLevels,
          goal,
        }),
      });

      if (res.status === 401) {
        window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      if (!res.ok) throw new Error("Erro na API");

      const json = await res.json();
      if (json.error) throw new Error(json.error);

      setSchedule(json);
    } catch (err) {
      console.error(err);
      setError("Falha ao gerar o cronograma. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans">
      <PublicSiteHeader />
      <EnsinoMedioToolsNav />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-8 space-y-8">
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5" />
            Planejador Inteligente com Gemini
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
            Cronograma de Estudos Personalizado
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-xs md:text-sm leading-relaxed">
            Configure seu tempo livre e seu nível por matéria para receber uma rotina semanal equilibrada e sem sobrecarga.
          </p>
        </header>

        {!schedule ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            {/* Horas e Dias */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-500">
                  Horas Disponíveis por Dia: {hoursPerDay}h
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-500">
                  Objetivo Principal
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white"
                >
                  <option value="ENEM e Vestibulares">ENEM e Vestibulares</option>
                  <option value="Passar de ano / Provas da Escola">Passar de ano / Provas da Escola</option>
                  <option value="Foco em Medicina / Alta Concorrência">Foco em Medicina / Alta Concorrência</option>
                  <option value="Concurso Público / Técnico">Concurso Público / Técnico</option>
                </select>
              </div>
            </div>

            {/* Dias da Semana */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-500">
                Dias de Estudo
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_LIST.map((day) => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nível por Matéria */}
            <div className="space-y-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-500">
                Seu Nível em Cada Matéria (Dificuldade)
              </label>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {SUBJECTS_LIST.map((subj) => {
                  const currentLevel = subjectLevels[subj] || "medio";
                  return (
                    <div
                      key={subj}
                      className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2"
                    >
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        {subj}
                      </span>
                      <div className="flex items-center gap-1">
                        {(["fraco", "medio", "forte"] as const).map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() =>
                              setSubjectLevels((prev) => ({ ...prev, [subj]: lvl }))
                            }
                            className={`flex-1 py-1 text-[10px] font-bold rounded-lg capitalize transition-all ${
                              currentLevel === lvl
                                ? lvl === "fraco"
                                  ? "bg-red-600 text-white"
                                  : lvl === "medio"
                                  ? "bg-amber-600 text-white"
                                  : "bg-emerald-600 text-white"
                                : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || selectedDays.length === 0}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Gerando Cronograma com Gemini...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Gerar Cronograma Semanal
                </>
              )}
            </button>
          </div>
        ) : (
          /* Exibição do Cronograma */
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                    {schedule.title}
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Carga horária estimada: ~{schedule.totalWeeklyHours} horas por semana.
                  </p>
                </div>
                <button
                  onClick={() => setSchedule(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Recalcular Cronograma
                </button>
              </div>

              {/* Plano Diário */}
              <div className="grid gap-6 md:grid-cols-2">
                {schedule.weeklyPlan.map((dayPlan, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3"
                  >
                    <h3 className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
                      {dayPlan.day}
                    </h3>
                    <div className="space-y-2">
                      {dayPlan.slots.map((slot, j) => (
                        <div
                          key={j}
                          className="bg-white dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1"
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-neutral-900 dark:text-white">
                            <span>{slot.subject}</span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {slot.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-neutral-600 dark:text-neutral-300 font-medium">
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                              {slot.activity}
                            </span>
                            <span>{slot.tip}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Dicas da Semana */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
                  Recomendações do Mentor
                </span>
                <ul className="space-y-1 text-xs font-medium">
                  {schedule.weeklyRecommendations.map((rec, k) => (
                    <li key={k}>• {rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
