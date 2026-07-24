"use client";

import React from "react";

export interface ScoreDataPoint {
  id: string;
  jobTitle: string;
  overallScore: number;
  atsScore: number;
  dateLabel: string;
}

interface CareerScoreEvolutionChartProps {
  dataPoints: ScoreDataPoint[];
}

export function CareerScoreEvolutionChart({ dataPoints }: CareerScoreEvolutionChartProps) {
  if (!dataPoints || dataPoints.length === 0) return null;

  const maxScore = 100;
  const recentPoints = dataPoints.slice(-8);

  return (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full">
            📈 Evolução de Carreira
          </span>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mt-1">
            Progresso de Aderência do Currículo
          </h3>
        </div>
        <span className="text-xs font-semibold text-neutral-500">
          Últimas {recentPoints.length} análises
        </span>
      </div>

      <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-neutral-100 dark:border-neutral-800 px-2">
        {recentPoints.map((pt, idx) => {
          const heightPercent = Math.max(10, Math.min(100, (pt.overallScore / maxScore) * 100));
          const isHigh = pt.overallScore >= 70;

          return (
            <div key={pt.id || idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
              {/* Tooltip no hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded font-semibold whitespace-nowrap z-10 shadow-md pointer-events-none">
                {pt.jobTitle}: {pt.overallScore}%
              </div>

              <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                {pt.overallScore}%
              </span>

              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full max-w-[36px] rounded-t-lg transition-all ${
                  isHigh
                    ? "bg-gradient-to-t from-emerald-500 to-emerald-400"
                    : "bg-gradient-to-t from-blue-500 to-indigo-400"
                }`}
              />

              <span className="text-[9px] font-medium text-neutral-400 truncate w-full text-center">
                {pt.dateLabel}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
