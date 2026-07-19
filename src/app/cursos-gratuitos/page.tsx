import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ContentPage } from "@/components/content-page";
import { Pagination } from "@/components/Pagination";

const COURSES_PER_PAGE = 12;

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Cursos gratuitos com certificado | CarreirasMatch",
  description: "Encontre cursos gratuitos verificados para melhorar seu currículo e aumentar suas chances.",
  alternates: { canonical: "/cursos-gratuitos" },
};

export default async function FreeCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; area?: string; page?: string }>;
}) {
  const { q = "", area = "", page: pageParam } = await searchParams;
  const where = {
    active: true,
    free: true,
    ...(area ? { area: { contains: area } } : {}),
    ...(q ? { OR: [{ title: { contains: q } }, { provider: { contains: q } }, { area: { contains: q } }] } : {}),
  };
  const parsedPage = Number.parseInt(pageParam ?? "1", 10);
  const total = await prisma.externalCourse.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / COURSES_PER_PAGE));
  const page = Math.min(Math.max(Number.isNaN(parsedPage) ? 1 : parsedPage, 1), totalPages);

  const [courses, areas] = await Promise.all([
    prisma.externalCourse.findMany({
      where,
      orderBy: [{ area: "asc" }, { title: "asc" }],
      skip: (page - 1) * COURSES_PER_PAGE,
      take: COURSES_PER_PAGE,
    }),
    prisma.externalCourse.findMany({
      where: { active: true, free: true },
      distinct: ["area"],
      select: { area: true },
      orderBy: { area: "asc" },
    }),
  ]);

  return (
    <ContentPage eyebrow="Qualificação" title="Cursos gratuitos verificados" description="Escolha uma área e encontre cursos gratuitos para fortalecer seu currículo." wide>
      <form className="grid gap-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800 sm:grid-cols-[1fr_1fr_auto]">
        <input name="q" defaultValue={q} placeholder="Curso, habilidade ou instituição" className="rounded-xl border bg-transparent px-3 py-2.5 text-sm dark:border-neutral-700" />
        <select name="area" defaultValue={area} className="rounded-xl border bg-transparent px-3 py-2.5 text-sm dark:border-neutral-700">
          <option value="">Todas as áreas</option>
          {areas.map((item) => <option key={item.area} value={item.area}>{item.area}</option>)}
        </select>
        <button className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white">Buscar</button>
      </form>
      <p className="mt-5 text-sm text-neutral-500">{total} curso(s) encontrado(s).</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <a key={course.id} href={course.url} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-neutral-200 p-5 hover:border-blue-300 dark:border-neutral-800">
            <span className="text-xs font-semibold text-blue-600">{course.area}</span>
            <h2 className="mt-2 font-bold">{course.title}</h2>
            <p className="mt-2 text-sm text-neutral-500">{course.provider}</p>
            <p className="mt-4 text-xs text-emerald-700 dark:text-emerald-400">Gratuito{course.certificate ? " • Com certificado" : ""} • {course.modality}</p>
          </a>
        ))}
      </div>
      <div className="mt-8">
        <Pagination
          page={page}
          totalPages={totalPages}
          basePath="/cursos-gratuitos"
          searchParams={{ q, area }}
        />
      </div>
    </ContentPage>
  );
}
