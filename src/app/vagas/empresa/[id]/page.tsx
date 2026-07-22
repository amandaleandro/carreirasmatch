import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { ApplyVaga } from "@/components/apply-vaga";
import { vagaAttributeChips } from "@/lib/vaga-fields";
import { PartnerCourseActions } from "@/components/partner-course-actions";

export const dynamic = "force-dynamic";

async function loadVaga(id: string) {
  return prisma.companyVaga.findFirst({
    where: { id, publishedToFeed: true, status: "open" },
    include: { company: { select: { name: true, city: true, state: true } } },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const vaga = await loadVaga(id);
  if (!vaga) return { title: "Vaga não encontrada" };
  return {
    title: `${vaga.title} | ${vaga.company.name}`,
    description: vaga.description.slice(0, 160),
    alternates: { canonical: `/vagas/empresa/${vaga.id}` },
  };
}

export default async function CompanyVagaPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vaga = await loadVaga(id);
  if (!vaga) notFound();

  const session = await auth();
  let applyState: "guest" | "company" | "candidate" | "applied" = "guest";
  if (session?.user) {
    if (session.user.accountType === "company") {
      applyState = "company";
    } else {
      const existing = await prisma.companyJobApplication.findUnique({
        where: { vagaId_userId: { vagaId: vaga.id, userId: session.user.id } },
        select: { id: true },
      });
      applyState = existing ? "applied" : "candidate";
    }
  }

  // Busca cursos patrocinados recomendados para a área dessa vaga
  let recommendedCourses = await prisma.externalCourse.findMany({
    where: {
      active: true,
      featured: true,
      area: { contains: vaga.area },
    },
    take: 3,
  });

  if (recommendedCourses.length < 3) {
    const extra = await prisma.externalCourse.findMany({
      where: {
        active: true,
        featured: true,
        id: { notIn: recommendedCourses.map((c) => c.id) },
      },
      take: 3 - recommendedCourses.length,
    });
    recommendedCourses = [...recommendedCourses, ...extra];
  }

  const location = [vaga.area, vaga.state].filter(Boolean).join(" · ");

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <PublicSiteHeader />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-6">
          <header className="space-y-2">
            <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
              Vaga de empresa
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{vaga.title}</h1>
            <p className="text-neutral-600 dark:text-neutral-300 font-medium">{vaga.company.name}</p>
            {location && (
              <p className="flex items-center gap-1.5 text-sm text-neutral-500">
                <MapPin className="h-4 w-4" strokeWidth={1.75} /> {location}
              </p>
            )}
            {vagaAttributeChips(vaga).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {vagaAttributeChips(vaga).map((chip) => (
                  <span key={chip} className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    {chip}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6">
            <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
              {vaga.description}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6">
            <h2 className="font-semibold mb-3">Candidatar-se</h2>
            <ApplyVaga vagaId={vaga.id} state={applyState} />
          </div>

          {/* Seção de recomendações de cursos do parceiro */}
          {recommendedCourses.length > 0 && (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-950/40 bg-amber-50/10 dark:bg-amber-950/5 p-6 space-y-4 shadow-sm">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 fill-amber-500 text-amber-500" />
                  Quer aumentar suas chances?
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Se qualifique nas competências exigidas para essa vaga com cursos recomendados dos nossos parceiros:
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {recommendedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm text-left flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                        {course.area}
                      </span>
                      <h4 className="mt-2 font-bold text-sm text-neutral-900 dark:text-white line-clamp-2 leading-tight">
                        {course.title}
                      </h4>
                      <p className="mt-1 text-xs text-neutral-500">{course.provider}</p>
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
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
