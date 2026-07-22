import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { PartnerCourseActions } from "@/components/partner-course-actions";
import { Globe, BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

async function getPartnerData(id: string) {
  return prisma.partner.findUnique({
    where: { id },
    include: { courses: { where: { active: true } } },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const partner = await getPartnerData(id);
  if (!partner) return { title: "Parceiro Não Encontrado" };
  return {
    title: `${partner.name} | Cursos e Treinamentos`,
    description: partner.description || `Veja todos os cursos e qualificações oferecidas por ${partner.name} no CarreirasMatch.`,
  };
}

export default async function PartnerPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partner = await getPartnerData(id);
  if (!partner) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50">
      <PublicSiteHeader />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-10 space-y-10">
        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left shadow-sm">
          {partner.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={partner.logoUrl}
              alt={partner.name}
              className="w-24 h-24 rounded-2xl object-contain border border-neutral-200 dark:border-neutral-800 bg-neutral-50 p-2"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center font-bold text-neutral-400 text-3xl">
              {partner.name[0]}
            </div>
          )}

          <div className="space-y-3 flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight">{partner.name}</h1>
            <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed max-w-2xl">
              {partner.description || "Esta instituição parceira oferece cursos e treinamentos de alta qualidade na nossa vitrine."}
            </p>
            {partner.website && (
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
              >
                <Globe className="h-4 w-4" />
                Visitar site da instituição
              </a>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Todos os Cursos Disponíveis ({partner.courses.length})
          </h2>

          {partner.courses.length === 0 ? (
            <p className="text-neutral-500 text-sm">Nenhum curso disponível no momento.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {partner.courses.map((course) => (
                <div
                  key={course.id}
                  className={`rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                    course.featured
                      ? "border-amber-300 dark:border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/5 hover:border-amber-400"
                      : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-300"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 px-2 py-0.5 rounded">
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
                    featured={course.featured}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
