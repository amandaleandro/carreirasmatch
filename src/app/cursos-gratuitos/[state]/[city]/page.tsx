import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ContentPage } from "@/components/content-page";

export const dynamic = "force-dynamic";

function cityName(slug: string) {
  return slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export async function generateMetadata({ params }: { params: Promise<{ state: string; city: string }> }): Promise<Metadata> {
  const { state, city } = await params;
  const name = cityName(city);
  return {
    title: `Cursos gratuitos em ${name}, ${state.toUpperCase()}`,
    description: `Cursos gratuitos online e locais disponíveis para moradores de ${name}.`,
    alternates: { canonical: `/cursos-gratuitos/${state}/${city}` },
  };
}

export default async function CoursesByCityPage({ params }: { params: Promise<{ state: string; city: string }> }) {
  const { state, city } = await params;
  const name = cityName(city);
  const courses = await prisma.externalCourse.findMany({
    where: {
      active: true,
      free: true,
      OR: [{ modality: "online" }, { state: state.toUpperCase(), city: { contains: name } }],
    },
    orderBy: [{ area: "asc" }, { title: "asc" }],
    take: 200,
  });
  return (
    <ContentPage eyebrow="Qualificação local" title={`Cursos gratuitos em ${name}, ${state.toUpperCase()}`} description="Cursos online acessíveis de qualquer cidade e oportunidades locais cadastradas." wide>
      <Link href="/cursos-gratuitos" className="text-sm font-semibold text-blue-600">Ver catálogo completo</Link>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <a key={course.id} href={course.url} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
            <span className="text-xs font-semibold text-blue-600">{course.area}</span>
            <h2 className="mt-2 font-bold">{course.title}</h2>
            <p className="mt-2 text-sm text-neutral-500">{course.provider}</p>
            <p className="mt-4 text-xs text-emerald-700">Gratuito • {course.certificate ? "Com certificado" : "Consulte o certificado"}</p>
          </a>
        ))}
      </div>
    </ContentPage>
  );
}
