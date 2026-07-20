import { requirePartnerPage } from "@/lib/partner-auth";
import { prisma } from "@/lib/prisma";
import { PartnerShell } from "@/components/partner-shell";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function PartnerProfilePage() {
  const { partner } = await requirePartnerPage();

  async function updateProfile(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const cnpj = formData.get("cnpj") as string;
    const logoUrl = formData.get("logoUrl") as string;
    const website = formData.get("website") as string;
    const description = formData.get("description") as string;

    if (!name) return;

    try {
      await prisma.partner.update({
        where: { id: partner.id },
        data: { name, cnpj, logoUrl, website, description },
      });
      revalidatePath("/parceiro/dashboard/perfil");
    } catch (err) {
      console.error(err);
    }
  }

  const inputClass = "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]";

  return (
    <PartnerShell partnerName={partner.name} logoUrl={partner.logoUrl} credits={partner.credits}>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <header>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Perfil da Instituição
          </h1>
          <p className="text-neutral-500 mt-1">
            Mantenha as informações públicas da sua escola ou faculdade atualizadas para os candidatos.
          </p>
        </header>

        <form action={updateProfile} className="space-y-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase">Nome da Instituição</label>
            <input type="text" name="name" required defaultValue={partner.name} className={inputClass} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase">CNPJ</label>
            <input type="text" name="cnpj" defaultValue={partner.cnpj} className={inputClass} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase">Website</label>
            <input type="url" name="website" defaultValue={partner.website} className={inputClass} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase">URL do Logotipo</label>
            <input type="url" name="logoUrl" defaultValue={partner.logoUrl} className={inputClass} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase">Sobre a Instituição (Descrição Pública)</label>
            <textarea name="description" rows={4} defaultValue={partner.description} className={inputClass} placeholder="Descreva brevemente sua escola, especialidades e o que ensina..." />
          </div>

          <button type="submit" className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all">
            Salvar Alterações
          </button>
        </form>
      </div>
    </PartnerShell>
  );
}
