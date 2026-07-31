"use client";

import React from "react";
import { TrendingUp, Award, Sparkles, CheckCircle2 } from "lucide-react";

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

  const recentPoints = dataPoints.slice(-7);
  const latestScore = recentPoints[recentPoints.length - 1]?.overallScore ?? 0;
  const firstScore = recentPoints[0]?.overallScore ?? 0;
  const scoreDiff = latestScore - firstScore;

  // Calculando coordenadas para linha de tendência SVG
  const chartHeight = 120;
  const chartWidth = 500;
  const paddingX = 30;
  const usableWidth = chartWidth - paddingX * 2;

  const pointsCoords = recentPoints.map((pt, i) => {
    const x = paddingX + (i / Math.max(1, recentPoints.length - 1)) * usableWidth;
    const y = chartHeight - (pt.overallScore / 100) * (chartHeight - 30) - 15;
    return { x, y, score: pt.overallScore, label: pt.dateLabel, title: pt.jobTitle };
  });

  const pathD = pointsCoords.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = pointsCoords[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${pointsCoords[pointsCoords.length - 1].x} ${chartHeight} L ${pointsCoords[0].x} ${chartHeight} Z`;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/50 to-amber-50/20 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 p-6 sm:p-7 shadow-sm space-y-6">
      {/* Top Bar with Warm Progress Stat */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/50 px-3 py-1 rounded-full border border-amber-200/80 dark:border-amber-800/60">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Evolução do Seu Perfil</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Progresso de Aderência às Vagas
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Acompanhe o ganho de competitividade do seu currículo a cada nova análise.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm shrink-0 self-start sm:self-auto">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Aderência Atual</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{latestScore}%</span>
              {scoreDiff !== 0 && (
                <span className={`text-xs font-bold ${scoreDiff > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  ({scoreDiff > 0 ? "+" : ""}{scoreDiff}%)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern SVG Trend Line Curve Graph */}
      <div className="relative pt-4 pb-2">
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-36 overflow-visible">
            <defs>
              <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="scoreLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Background Grid Lines */}
            <line x1="0" y1="20" x2={chartWidth} y2="20" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="4 4" />
            <line x1="0" y1="60" x2={chartWidth} y2="60" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="4 4" />
            <line x1="0" y1="100" x2={chartWidth} y2="100" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="4 4" />

            {/* Gradient Fill Area */}
            <path d={areaD} fill="url(#scoreAreaGradient)" />

            {/* Main Smooth Line Curve */}
            <path d={pathD} fill="none" stroke="url(#scoreLineGradient)" strokeWidth="3.5" strokeLinecap="round" />

            {/* Data Point Circles and Score Labels */}
            {pointsCoords.map((pt, i) => (
              <g key={i} className="group cursor-pointer">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="6"
                  className="fill-white dark:fill-slate-900 stroke-blue-600 dark:stroke-blue-400 hover:scale-125 transition-transform"
                  strokeWidth="3"
                />
                <text
                  x={pt.x}
                  y={pt.y - 12}
                  textAnchor="middle"
                  className="text-[11px] font-extrabold fill-slate-800 dark:fill-slate-100"
                >
                  {pt.score}%
                </text>
                <text
                  x={pt.x}
                  y={chartHeight + 14}
                  textAnchor="middle"
                  className="text-[10px] font-medium fill-slate-400"
                >
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Motivational Bottom Highlight Bar */}
      <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Cada otimização no currículo eleva suas chances de ser chamado para entrevista.</span>
        </div>
        <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
          {recentPoints.length} de {dataPoints.length} diagnósticos exibidos
        </span>
      </div>
    </section>
  );
}
