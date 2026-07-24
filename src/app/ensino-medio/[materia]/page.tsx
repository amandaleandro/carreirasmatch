import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSubjectBySlug, HIGH_SCHOOL_SUBJECTS } from "@/lib/ensino-medio";
import { EnsinoMedioStudyView } from "@/components/ensino-medio-study-view";
import { ArrowLeft, BookOpen, GraduationCap, Briefcase } from "lucide-react";

export async function generateStaticParams() {
  return HIGH_SCHOOL_SUBJECTS.map((s) => ({ materia: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ materia: string }>;
}): Promise<Metadata> {
  const { materia } = await params;
  const subject = getSubjectBySlug(materia);
  if (!subject) return { title: "Matéria Não Encontrada | CarreirasMatch" };

  return {
    title: `Estudo de ${subject.name} (Ensino Médio, ENEM & Jogos) | CarreirasMatch`,
    description: `Estude ${subject.name} com resumos, quizzes e flashcards gerados por IA, e veja opções de Faculdade vs Curso Técnico.`,
    alternates: { canonical: `/ensino-medio/${materia}` },
  };
}

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ materia: string }>;
}) {
  const { materia } = await params;
  const subject = getSubjectBySlug(materia);

  if (!subject) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans">
      <PublicSiteHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Breadcrumb / Back Link */}
        <div>
          <Link
            href="/ensino-medio"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar para Matérias do Ensino Médio
          </Link>
        </div>

        {/* Header da Matéria */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider">
              {subject.category}
            </span>
            <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
              <BookOpen className="h-3.5 w-3.5" />
              Ensino Médio & ENEM
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-white">
            {subject.name}
          </h1>

          <p className="text-neutral-600 dark:text-neutral-300 text-xs md:text-sm leading-relaxed max-w-2xl">
            {subject.description}
          </p>

          {/* Atalhos para Cursos */}
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-semibold">
              <GraduationCap className="h-4 w-4" />
              Faculdades relacionadas: {subject.collegeCourses.slice(0, 3).join(", ")}...
            </div>
            <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-semibold">
              <Briefcase className="h-4 w-4" />
              Técnicos relacionados: {subject.technicalCourses.slice(0, 2).join(", ")}...
            </div>
          </div>
        </div>

        {/* Componente Interativo de Estudo & Jogos */}
        <EnsinoMedioStudyView subject={subject} />
      </main>

      <SiteFooter />
    </div>
  );
}
