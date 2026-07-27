import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ContentPage } from "@/components/content-page";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Trilhas de Estudo por Curso e Universidade | CarreirasMatch",
  description:
    "Trilhas de estudo geradas a partir da grade curricular real de cursos de universidades brasileiras, com recomendações de curso por disciplina.",
  alternates: { canonical: "/estagio/trilhas" },
};

export default async function TrilhasPage() {
  const courses = await prisma.universityCourse.findMany({
    where: { active: true },
    include: { university: true },
    orderBy: [{ area: "asc" }, { title: "asc" }],
  });

  const byArea = new Map<string, typeof courses>();
  for (const course of courses) {
    const list = byArea.get(course.area) ?? [];
    list.push(course);
    byArea.set(course.area, list);
  }

  return (
    <ContentPage
      eyebrow="Trilhas de Estudo"
      title="Trilhas de estudo por curso de universidade"
      description="Escolha um curso de uma universidade real e veja a trilha de estudos gerada a partir da grade curricular dele, com recomendações de curso complementar por disciplina."
      maxWidthClass="max-w-6xl"
    >
      {courses.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Ainda não há trilhas disponíveis. O conteúdo é atualizado automaticamente ao longo do dia.
        </p>
      ) : (
        <div className="space-y-8">
          {Array.from(byArea.entries()).map(([area, areaCourses]) => (
            <section key={area}>
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
                {area}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {areaCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/estagio/trilhas/${course.university.slug}/${course.slug}`}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
                      <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      {course.title}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {course.university.name} · {course.university.city}/{course.university.state}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </ContentPage>
  );
}
