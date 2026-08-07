"use client";

import { useState } from "react";
import Link from "next/link";
import { HIGH_SCHOOL_SUBJECTS, YearId, getTopicsByYear } from "@/lib/ensino-medio-types";
import { EnsinoMedioYearSelector } from "@/components/ensino-medio-year-selector";
import {
  BookOpen,
  Calculator,
  Dna,
  Zap,
  FlaskConical,
  Landmark,
  Globe,
  Brain,
  ArrowRight,
} from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  Calculator: <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
  BookOpen: <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
  Dna: <Dna className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
  Zap: <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
  FlaskConical: <FlaskConical className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
  Landmark: <Landmark className="h-6 w-6 text-amber-700 dark:text-amber-300" />,
  Globe: <Globe className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />,
  Brain: <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
};

export function EnsinoMedioSubjectsGrid() {
  const [selectedYear, setSelectedYear] = useState<YearId>("all");

  return (
    <div className="space-y-6">
      <section className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <EnsinoMedioYearSelector selectedYear={selectedYear} onSelectYear={setSelectedYear} />
      </section>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <p className="text-xs md:text-sm text-neutral-500">
          {selectedYear === "all"
            ? "Exibindo os tópicos dos 3 Anos do Ensino Médio."
            : `Exibindo o programa de estudos focado no ${
                selectedYear === "1o-ano" ? "1º Ano" : selectedYear === "2o-ano" ? "2º Ano" : "3º Ano & ENEM"
              }.`}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {HIGH_SCHOOL_SUBJECTS.map((subject) => {
          const yearTopics = getTopicsByYear(subject, selectedYear);
          return (
            <Link
              key={subject.slug}
              href={`/ensino-medio/${subject.slug}${selectedYear !== "all" ? `?ano=${selectedYear}` : ""}`}
              className="group rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between hover:border-blue-500 dark:hover:border-blue-500 shadow-2xs hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-3.5 w-fit group-hover:scale-110 transition-transform">
                  {ICON_MAP[subject.iconName] || <BookOpen className="h-6 w-6 text-blue-600" />}
                </div>

                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                    {subject.category}
                  </span>
                  <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {subject.name}
                  </h3>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">
                  {subject.description}
                </p>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Principais tópicos ({yearTopics.length}):
                  </span>
                  <ul className="space-y-1">
                    {yearTopics.slice(0, 3).map((item) => (
                      <li key={item.topic} className="text-[11px] text-neutral-600 dark:text-neutral-300 truncate flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span className="truncate">{item.topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/60 mt-4 flex items-center justify-between text-[11px]">
                <span className="font-bold text-neutral-500">Acessar matérias</span>
                <span className="flex items-center gap-1 font-extrabold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                  Estudar <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
