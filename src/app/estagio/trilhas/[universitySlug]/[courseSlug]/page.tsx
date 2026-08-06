import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, GraduationCap, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ContentPage } from "@/components/content-page";
import { getCoursesForArea, type CourseCatalogEntry } from "@/lib/course-catalog";

export const dynamic = "force-dynamic";

async function getCourse(universitySlug: string, courseSlug: string) {
  return prisma.universityCourse.findFirst({
    where: { slug: courseSlug, active: true, university: { slug: universitySlug } },
    include: { university: true, subjects: { orderBy: [{ semester: "asc" }, { order: "asc" }] } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ universitySlug: string; courseSlug: string }>;
}): Promise<Metadata> {
  const { universitySlug, courseSlug } = await params;
  const course = await getCourse(universitySlug, courseSlug);
  if (!course) return {};
  return {
    title: `Trilha de estudos: ${course.title} — ${course.university.name} | CarreirasMatch`,
    description: `Grade curricular de ${course.title} na ${course.university.name}, com recomendações de curso complementar por disciplina.`,
    alternates: { canonical: `/estagio/trilhas/${universitySlug}/${courseSlug}` },
  };
}

export default async function TrilhaDetalhePage({
  params,
}: {
  params: Promise<{ universitySlug: string; courseSlug: string }>;
}) {
  const { universitySlug, courseSlug } = await params;
  const course = await getCourse(universitySlug, courseSlug);
  if (!course) notFound();

  const bySemester = new Map<number, typeof course.subjects>();
  for (const subject of course.subjects) {
    const key = subject.semester ?? 0;
    const list = bySemester.get(key) ?? [];
    list.push(subject);
    bySemester.set(key, list);
  }
  const semesters = Array.from(bySemester.keys()).sort((a, b) => a - b);

  const recommendationsFor = (subjectName: string): CourseCatalogEntry[] => {
    const bySubject = getCoursesForArea(subjectName);
    if (bySubject.length > 0) return bySubject.slice(0, 2);
    return getCoursesForArea(course.area).slice(0, 2);
  };

  return (
    <ContentPage
      eyebrow="Trilha de Estudos"
      title={course.title}
      description={`Grade curricular real, organizada por semestre, com sugestões de curso complementar pra cada disciplina.`}
      maxWidthClass="max-w-4xl"
      backHref="/estagio/trilhas"
      backLabel="← Voltar às trilhas"
    >
      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 mb-8">
        <GraduationCap className="w-4 h-4 shrink-0" />
        {course.university.name}
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <MapPin className="w-3.5 h-3.5 shrink-0" />
        {course.university.city}/{course.university.state}
      </div>

      <div className="space-y-8">
        {semesters.map((semester) => (
          <section key={semester}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
              {semester > 0 ? `${semester}º Período` : "Sem período definido"}
            </h2>
            <div className="space-y-4">
              {(bySemester.get(semester) ?? []).map((subject) => {
                const recommendations = recommendationsFor(subject.name);
                return (
                  <div
                    key={subject.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 p-4"
                  >
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
                      <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      {subject.name}
                    </div>
                    {recommendations.length > 0 && (
                      <ul className="mt-2 pl-6 space-y-1">
                        {recommendations.map((rec) => (
                          <li key={rec.title} className="text-xs text-slate-600 dark:text-slate-400">
                            Curso recomendado: <strong>{rec.title}</strong> ({rec.provider}
                            {rec.free ? ", gratuito" : ""})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
        Quer mais conteúdo de preparação para estágio?{" "}
        <Link href="/tools/internship-guide" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          Veja o guia completo de estágio
        </Link>
        .
      </div>
    </ContentPage>
  );
}
