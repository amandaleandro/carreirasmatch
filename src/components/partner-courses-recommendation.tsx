import React from "react";
import type { RecommendedCourse } from "@/lib/analysis-recommendations";

interface PartnerCoursesRecommendationProps {
  courses: RecommendedCourse[];
}

export function PartnerCoursesRecommendation({ courses }: PartnerCoursesRecommendationProps) {
  if (!courses || courses.length === 0) return null;

  return (
    <section className="rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-neutral-900 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 mb-1">
            Recomendado para fechar suas lacunas
          </span>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            Cursos Recomendados por Parceiros
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Aumente suas chances capacitando-se nas habilidades ausentes no seu currículo.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex flex-col justify-between p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors shadow-xs"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  {course.provider}
                </span>
                {course.free && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Gratuito
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 line-clamp-2">
                {course.title}
              </h4>
              {course.matchingKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {course.matchingKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-medium"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between">
              {course.couponCode ? (
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                  Cupom: <strong className="font-bold">{course.couponCode}</strong> ({course.couponDiscount})
                </span>
              ) : (
                <span className="text-[11px] text-neutral-500">
                  Modalidade: {course.modality}
                </span>
              )}
              <a
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Acessar Curso →
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
