import { requirePartnerPage } from "@/lib/partner-auth";
import { prisma } from "@/lib/prisma";
import { PartnerShell } from "@/components/partner-shell";
import { BookOpen, Sparkles, MapPin, Link as LinkIcon, Check, Trash2, ArrowUpRight } from "lucide-react";
import { revalidatePath } from "next/cache";
import { PartnerCourseForm } from "./PartnerCourseForm";

export const dynamic = "force-dynamic";

export default async function PartnerCoursesPage() {
  const { partner } = await requirePartnerPage();

  const courses = await prisma.externalCourse.findMany({
    where: { partnerId: partner.id },
    orderBy: { createdAt: "desc" },
  });

  async function createCourse(formData: FormData) {
    "use server";
    const title = (formData.get("title") as string ?? "").trim();
    const url = (formData.get("url") as string ?? "").trim();
    const area = (formData.get("area") as string ?? "").trim();
    const modality = (formData.get("modality") as string ?? "online").trim();
    const free = formData.get("free") === "true";
    const certificate = formData.get("certificate") === "true";
    const city = (formData.get("city") as string ?? "").trim();
    const state = (formData.get("state") as string ?? "").trim();
    const couponCode = (formData.get("couponCode") as string ?? "").trim();
    const couponDiscount = (formData.get("couponDiscount") as string ?? "").trim();

    if (!title || !url || !area) return;

    try {
      await prisma.externalCourse.create({
        data: {
          title,
          provider: partner.name,
          url,
          area,
          modality,
          free,
          certificate,
          city: modality === "online" ? "" : city,
          state: modality === "online" ? "" : state,
          active: true,
          source: "partner",
          partnerId: partner.id,
          featured: false,
          couponCode,
          couponDiscount,
        },
      });
      revalidatePath("/parceiro/dashboard/cursos");
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteCourse(courseId: string) {
    "use server";
    try {
      await prisma.externalCourse.deleteMany({
        where: { id: courseId, partnerId: partner.id },
      });
      revalidatePath("/parceiro/dashboard/cursos");
    } catch (err) {
      console.error(err);
    }
  }

  async function highlightCourse(courseId: string) {
    "use server";
    const freshPartner = await prisma.partner.findUnique({ where: { id: partner.id } });
    if (!freshPartner || freshPartner.credits <= 0) return;

    try {
      await prisma.$transaction([
        prisma.partner.update({
          where: { id: partner.id },
          data: { credits: { decrement: 1 } },
        }),
        prisma.externalCourse.update({
          where: { id: courseId },
          data: { featured: true },
        }),
      ]);
      revalidatePath("/parceiro/dashboard/cursos");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <PartnerShell partnerName={partner.name} logoUrl={partner.logoUrl} credits={partner.credits}>
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        <header>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Meus Cursos
          </h1>
          <p className="text-neutral-500 mt-1">
            Cadastre e promova os cursos oferecidos pela sua instituição.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form de Cadastro */}
          <div className="lg:col-span-1">
            <PartnerCourseForm createCourseAction={createCourse} />
          </div>

          {/* Listagem de Cursos */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Cursos Publicados ({courses.length})
              </h2>
              {partner.credits > 0 && (
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200/60 dark:border-amber-900/40">
                  ⚡ {partner.credits} crédito(s) para destaque
                </span>
              )}
            </div>

            {courses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 p-10 text-center bg-white dark:bg-neutral-900 shadow-sm space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white">Nenhum curso cadastrado ainda</h3>
                <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
                  Preencha o formulário ao lado para publicar o primeiro curso da sua instituição. Cursos cadastrados aparecem para milhares de alunos e candidatos na plataforma.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className={`rounded-2xl border bg-white dark:bg-neutral-900 p-5 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      course.featured ? "border-amber-300 dark:border-amber-500/30 ring-1 ring-amber-400/20" : "border-neutral-200 dark:border-neutral-800"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-200/50 dark:border-blue-900/50">
                          {course.area}
                        </span>
                        {course.featured ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-500/20">
                            <Sparkles className="h-3 w-3" /> Patrocinado
                          </span>
                        ) : null}
                      </div>

                      <h3 className="font-bold text-neutral-900 dark:text-white text-base leading-snug">
                        {course.title}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                          {course.modality === "online" ? "Online" : `${course.city || "Cidade"} - ${course.state || "UF"}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          {course.free ? "Gratuito" : "Pago"}
                        </span>
                        {course.certificate ? <span className="font-medium text-emerald-600 dark:text-emerald-400">• Com certificado</span> : null}
                      </div>

                      {course.couponCode ? (
                        <div className="text-xs mt-2 text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                          <span>Cupom de Desconto:</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-900/30">{course.couponCode}</span>
                          {course.couponDiscount ? <span className="ml-1 font-semibold text-emerald-700 dark:text-emerald-400">({course.couponDiscount})</span> : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex sm:flex-col items-stretch gap-2 shrink-0">
                      <a
                        href={course.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-white/[0.03] px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 transition-colors"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        Visitar Link
                      </a>

                      {!course.featured && (
                        <form action={highlightCourse.bind(null, course.id)}>
                          <button
                            type="submit"
                            disabled={partner.credits <= 0}
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 px-4 py-2 text-xs font-semibold shadow-sm shadow-amber-500/10 transition-colors cursor-pointer"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            Destacar (1 Crd)
                          </button>
                        </form>
                      )}

                      <form action={deleteCourse.bind(null, course.id)}>
                        <button
                          type="submit"
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Excluir
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PartnerShell>
  );
}
