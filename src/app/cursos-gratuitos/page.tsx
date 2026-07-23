import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ContentPage } from "@/components/content-page";
import { Pagination } from "@/components/Pagination";
import { Sparkles } from "lucide-react";
import { PartnerCourseActions } from "@/components/partner-course-actions";

const COURSES_PER_PAGE = 12;

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Cursos gratuitos com certificado",
  description: "Encontre cursos gratuitos verificados para melhorar seu currículo e aumentar suas chances.",
  alternates: { canonical: "/cursos-gratuitos" },
};

export default async function FreeCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; area?: string; subarea?: string; page?: string }>;
}) {
  const { q = "", area = "", subarea = "", page: pageParam } = await searchParams;
  const where = {
    active: true,
    free: true,
    ...(area ? { area: { contains: area } } : {}),
    ...(subarea ? { subarea: { contains: subarea } } : {}),
    ...(q ? { OR: [{ title: { contains: q } }, { provider: { contains: q } }, { area: { contains: q } }] } : {}),
  };

  const parsedPage = Number.parseInt(pageParam ?? "1", 10);

  // Separamos busca de destacados (featured) e comuns
  const [featuredCourses, areas, subareas] = await Promise.all([
    prisma.externalCourse.findMany({
      where: { ...where, featured: true },
      orderBy: [{ area: "asc" }, { title: "asc" }],
      take: 6,
    }),
    prisma.externalCourse.findMany({
      where: { active: true, free: true },
      distinct: ["area"],
      select: { area: true },
      orderBy: { area: "asc" },
    }),
    prisma.externalCourse.findMany({
      where: { active: true, free: true, subarea: { not: "" } },
      distinct: ["subarea"],
      select: { subarea: true },
      orderBy: { subarea: "asc" },
    }),
  ]);

  // Os comuns excluem os já destacados na página
  const whereRegular = {
    ...where,
    featured: false,
  };

  const total = await prisma.externalCourse.count({ where: whereRegular });
  const totalPages = Math.max(1, Math.ceil(total / COURSES_PER_PAGE));
  const page = Math.min(Math.max(Number.isNaN(parsedPage) ? 1 : parsedPage, 1), totalPages);

  const courses = await prisma.externalCourse.findMany({
    where: whereRegular,
    orderBy: [{ area: "asc" }, { title: "asc" }],
    skip: (page - 1) * COURSES_PER_PAGE,
    take: COURSES_PER_PAGE,
  });

  return (
    <ContentPage eyebrow="Qualificação" title="Cursos gratuitos verificados" description="Escolha uma área e encontre cursos gratuitos para fortalecer seu currículo." wide>
      <form className="grid gap-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <input name="q" defaultValue={q} placeholder="Curso, habilidade ou instituição" className="rounded-xl border bg-transparent px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100" />
        <select name="area" defaultValue={area} className="rounded-xl border bg-transparent px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100">
          <option value="" className="dark:bg-neutral-900">Todas as áreas</option>
          {areas.map((item) => <option key={item.area} value={item.area} className="dark:bg-neutral-900">{item.area}</option>)}
        </select>
        <select name="subarea" defaultValue={subarea} className="rounded-xl border bg-transparent px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100">
          <option value="" className="dark:bg-neutral-900">Todas as subáreas</option>
          {subareas.map((item) => <option key={item.subarea} value={item.subarea} className="dark:bg-neutral-900">{item.subarea}</option>)}
        </select>
        <button className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white cursor-pointer">Buscar</button>
      </form>

      {/* Seção de Destaques / Patrocinados */}
      {featuredCourses.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-4">
            <Sparkles className="h-4 w-4 fill-amber-500" />
            Cursos Patrocinados em Destaque
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <div
                key={course.id}
                className="rounded-2xl border border-amber-300 dark:border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/5 p-5 shadow-sm relative overflow-hidden transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                    {course.area}
                  </span>
                  <h3 className="mt-3 font-bold text-neutral-900 dark:text-white leading-snug">{course.title}</h3>
                  <p className="mt-2 text-sm text-neutral-500">{course.provider}</p>
                  <p className="mt-4 text-xs text-emerald-700 dark:text-emerald-400">
                    Gratuito{course.certificate ? " • Com certificado" : ""} • {course.modality}
                  </p>
                </div>

                <PartnerCourseActions
                  courseId={course.id}
                  courseUrl={course.url}
                  couponCode={course.couponCode || undefined}
                  couponDiscount={course.couponDiscount || undefined}
                  featured={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-8 text-sm text-neutral-500">{total} curso(s) regular(es) encontrado(s).</p>
      
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800 transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                {course.area}
              </span>
              <h2 className="mt-3 font-bold text-neutral-900 dark:text-white leading-snug">{course.title}</h2>
              <p className="mt-2 text-sm text-neutral-500">{course.provider}</p>
              <p className="mt-4 text-xs text-emerald-700 dark:text-emerald-400">
                Gratuito{course.certificate ? " • Com certificado" : ""} • {course.modality}
              </p>
            </div>

            <PartnerCourseActions
              courseId={course.id}
              courseUrl={course.url}
              couponCode={course.couponCode || undefined}
              couponDiscount={course.couponDiscount || undefined}
              featured={false}
            />
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Pagination
          page={page}
          totalPages={totalPages}
          basePath="/cursos-gratuitos"
          searchParams={{ q, area, subarea }}
        />
      </div>
    </ContentPage>
  );
}
