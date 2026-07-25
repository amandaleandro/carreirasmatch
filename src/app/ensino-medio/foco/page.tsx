"use client";

import { useState, useEffect } from "react";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnsinoMedioToolsNav } from "@/components/ensino-medio-tools-nav";
import { HIGH_SCHOOL_SUBJECTS } from "@/lib/ensino-medio-types";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Flame,
  Coffee,
  BookOpen,
} from "lucide-react";

type FocusMode = "foco" | "pausaCurta" | "pausaLonga";

const DURATIONS: Record<FocusMode, number> = {
  foco: 25 * 60,
  pausaCurta: 5 * 60,
  pausaLonga: 15 * 60,
};

export default function FocoPomodoroPage() {
  const [mode, setMode] = useState<FocusMode>("foco");
  const [selectedSubject, setSelectedSubject] = useState("matematica");

  // Durações em segundos
  const [timeLeft, setTimeLeft] = useState(DURATIONS.foco);
  const [isRunning, setIsRunning] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);

  function selectMode(nextMode: FocusMode) {
    setMode(nextMode);
    setTimeLeft(DURATIONS[nextMode]);
    setIsRunning(false);
  }

  useEffect(() => {
    if (!isRunning) return;

    const timer = setTimeout(() => {
      if (timeLeft > 1) {
        setTimeLeft(timeLeft - 1);
      } else {
        setIsRunning(false);
        if (mode === "foco") {
          setCompletedCycles((count) => count + 1);
          setTotalFocusMinutes((minutes) => minutes + 25);
          setMode("pausaCurta");
          setTimeLeft(DURATIONS.pausaCurta);
        } else {
          setMode("foco");
          setTimeLeft(DURATIONS.foco);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isRunning, mode, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const activeSubjectObj = HIGH_SCHOOL_SUBJECTS.find((s) => s.slug === selectedSubject);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans">
      <PublicSiteHeader />
      <EnsinoMedioToolsNav />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-8 py-10 space-y-8">
        {/* Header */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Timer className="h-3.5 w-3.5" />
            Método Pomodoro Escolar
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
            Temporizador de Foco & Estudo
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Estude em blocos de **25 minutos focados** e descanse em pausas curtas para manter o cérebro afiado sem cansaço.
          </p>
        </header>

        {/* Card do Temporizador */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-10 shadow-sm space-y-8 text-center max-w-2xl mx-auto">
          {/* Seletor de Matéria */}
          <div className="space-y-2 max-w-md mx-auto">
            <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-blue-600" />
              Matéria em Estudo Agora:
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-bold text-neutral-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {HIGH_SCHOOL_SUBJECTS.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          {/* Abas do Modo */}
          <div className="inline-flex p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 gap-1">
            <button
              onClick={() => selectMode("foco")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                mode === "foco"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Flame className="h-3.5 w-3.5" /> Foco (25m)
            </button>
            <button
              onClick={() => selectMode("pausaCurta")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                mode === "pausaCurta"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Coffee className="h-3.5 w-3.5" /> Pausa Curta (5m)
            </button>
            <button
              onClick={() => selectMode("pausaLonga")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                mode === "pausaLonga"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Pausa Longa (15m)
            </button>
          </div>

          {/* Relógio Digital */}
          <div className="py-4">
            <div className="text-6xl sm:text-7xl md:text-8xl font-black font-mono tracking-tighter text-neutral-900 dark:text-white">
              {formatTime(timeLeft)}
            </div>
            <p className="text-xs text-neutral-500 font-medium mt-2">
              {mode === "foco"
                ? `Estudando ${activeSubjectObj?.name || selectedSubject}... Mantenha o foco!`
                : "Hora de descansar a mente! Tome água ou se espreguice."}
            </p>
          </div>

          {/* Botões de Controle */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-4 rounded-2xl font-black text-sm text-white shadow-md transition-all active:scale-95 flex items-center gap-2 ${
                isRunning
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="h-5 w-5 fill-current" /> Pausar Foco
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 fill-current" /> Iniciar Bloco
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                setTimeLeft(DURATIONS[mode]);
              }}
              className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>

          {/* Placar de Conquistas de Foco */}
          <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-2 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {completedCycles}
              </p>
              <p className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">
                Ciclos Concluídos 🎯
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {totalFocusMinutes} min
              </p>
              <p className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">
                Tempo Total Focado ⚡
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
