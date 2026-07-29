"use client";

import { HIGH_SCHOOL_YEARS, YearId } from "@/lib/ensino-medio-types";
import { GraduationCap, Sparkles, BookOpen, Flame } from "lucide-react";

interface EnsinoMedioYearSelectorProps {
  selectedYear: YearId;
  onSelectYear: (yearId: YearId) => void;
  className?: string;
}

export function EnsinoMedioYearSelector({
  selectedYear,
  onSelectYear,
  className = "",
}: EnsinoMedioYearSelectorProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Filtrar por Ano Escolar do Ensino Médio:
        </label>
        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-full">
          Grade BNCC Completa
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {HIGH_SCHOOL_YEARS.map((year) => {
          const isActive = selectedYear === year.id;
          return (
            <button
              key={year.id}
              type="button"
              onClick={() => onSelectYear(year.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between group ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]"
                  : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/40 dark:hover:bg-blue-950/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold tracking-tight ${isActive ? "text-white" : "text-neutral-900 dark:text-white"}`}>
                  {year.label}
                </span>
                {year.id === "3o-ano" ? (
                  <Flame className={`h-4 w-4 ${isActive ? "text-amber-300" : "text-amber-500"}`} />
                ) : year.id === "all" ? (
                  <BookOpen className={`h-4 w-4 ${isActive ? "text-blue-200" : "text-blue-500"}`} />
                ) : (
                  <Sparkles className={`h-4 w-4 ${isActive ? "text-blue-200" : "text-blue-400"}`} />
                )}
              </div>

              <div className="mt-2">
                <span
                  className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  {year.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
