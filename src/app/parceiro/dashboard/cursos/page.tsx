import { requirePartnerPage } from "@/lib/partner-auth";
import { prisma } from "@/lib/prisma";
import { PartnerShell } from "@/components/partner-shell";
import { BookOpen, Sparkles, MapPin, Link as LinkIcon, Plus, Check } from "lucide-react";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function PartnerCoursesPage() {
  const { partner } = await requirePartnerPage();

  const courses = await prisma.externalCourse.findMany({
    where: { partnerId: partner.id },
    orderBy: { createdAt: "desc" },
  });

  // Action local do próprio Server Component para cadastrar de forma limpa
  async function createCourse(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const url = formData.get("url") as string;
    const area = formData.get("area") as string;
    const modality = formData.get("modality") as string;
    const free = formData.get("free") === "true";
    const certificate = formData.get("certificate") === "true";
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
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
          city,
          state,
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

  // Action local para destacar o curso de forma reativa
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

  const inputClass =
    "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]";
  const selectClass =
    "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]";

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
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Novo Curso
              </h2>
              <form action={createCourse} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase">Título do Curso</label>
                  <input type="text" name="title" required placeholder="Ex: Programação Web Fullstack" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase">Link de Inscrição</label>
                  <input type="url" name="url" required placeholder="https://..." className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase">Área do Curso</label>
                  <input type="text" name="area" required placeholder="Ex: Tecnologia, Negócios, Saúde" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase">Modalidade</label>
                    <select name="modality" className={selectClass}>
                      <option value="online">Online</option>
                      <option value="presencial">Presencial</option>
                      <option value="hibrido">Híbrido</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase">Preço</label>
                    <select name="free" className={selectClass}>
                      <option value="true">Gratuito</option>
                      <option value="false">Pago</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase">Certificado</label>
                    <select name="certificate" className={selectClass}>
                      <option value="true">Sim</option>
                      <option value="false">Não</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase">UF (Se Presencial)</label>
                    <input type="text" name="state" maxLength={2} placeholder="Ex: SP" className={inputClass} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase">Cidade (Se Presencial)</label>
                  <input type="text" name="city" placeholder="Ex: São Paulo" className={inputClass} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase">Cupom de Desconto</label>
                    <input type="text" name="couponCode" placeholder="Ex: MATCH20" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase">Valor do Desconto</label>
                    <input type="text" name="couponDiscount" placeholder="Ex: 20% OFF" className={inputClass} />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all mt-2"
                >
                  Cadastrar Curso
                </button>
              </form>
            </div>
          </div>

          {/* Listagem de Cursos */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Cursos Publicados ({courses.length})
            </h2>

            {courses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 p-8 text-center text-neutral-500">
                Você ainda não cadastrou nenhum curso.
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
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                          {course.area}
                        </span>
                        {course.featured ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-200/50 dark:border-amber-500/20">
                            <Sparkles className="h-3 w-3" /> Patrocinado
                          </span>
                        ) : null}
                      </div>

                      <h3 className="font-bold text-neutral-900 dark:text-white text-base leading-snug">
                        {course.title}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {course.modality === "online" ? "Online" : `${course.city} - ${course.state}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          {course.free ? "Gratuito" : "Pago"}
                        </span>
                        {course.certificate ? <span>• Com certificado</span> : null}
                      </div>

                      {course.couponCode ? (
                        <div className="text-xs mt-2 text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                          <span>Cupom:</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-900/30">{course.couponCode}</span>
                          {course.couponDiscount ? <span className="ml-1 font-medium text-emerald-700 dark:text-emerald-400">({course.couponDiscount})</span> : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex sm:flex-col items-stretch gap-2 shrink-0">
                      <a
                        href={course.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 transition-colors"
                      >
                        <LinkIcon className="h-3.5 w-3.5" />
                        Visitar Link
                      </a>

                      {!course.featured && (
                        <form action={highlightCourse.bind(null, course.id)}>
                          <button
                            type="submit"
                            disabled={partner.credits <= 0}
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 px-4 py-2.5 text-xs font-semibold shadow-sm shadow-amber-500/10 transition-colors cursor-pointer"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            Destacar (1 Crd)
                          </button>
                        </form>
                      )}
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
