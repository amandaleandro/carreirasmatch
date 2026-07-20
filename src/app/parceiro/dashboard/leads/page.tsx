import { requirePartnerPage } from "@/lib/partner-auth";
import { prisma } from "@/lib/prisma";
import { PartnerShell } from "@/components/partner-shell";
import { Mail, Phone, Calendar, User, BookOpen } from "lucide-react";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function PartnerLeadsPage() {
  const { partner } = await requirePartnerPage();

  const [leads, courses] = await Promise.all([
    prisma.partnerLead.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.externalCourse.findMany({
      where: { partnerId: partner.id },
      select: { id: true, title: true },
    }),
  ]);

  const courseMap = new Map(courses.map((c) => [c.id, c.title]));

  const leadsWithCourse = leads.map((lead) => ({
    ...lead,
    courseTitle: courseMap.get(lead.courseId) ?? "Curso Removido",
  }));

  // Server Action para marcar o lead como contatado
  async function toggleLeadStatus(leadId: string, currentStatus: string) {
    "use server";
    const nextStatus = currentStatus === "new" ? "contacted" : "new";
    try {
      await prisma.partnerLead.update({
        where: { id: leadId },
        data: { status: nextStatus },
      });
      revalidatePath("/parceiro/dashboard/leads");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <PartnerShell partnerName={partner.name} logoUrl={partner.logoUrl} credits={partner.credits}>
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        <header>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Leads Capturados
          </h1>
          <p className="text-neutral-500 mt-1">
            Lista de alunos interessados que preencheram o formulário nos seus cursos patrocinados.
          </p>
        </header>

        {leadsWithCourse.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 p-12 text-center text-neutral-500">
            Nenhum lead capturado ainda. Destaque seus cursos para começar a receber contatos.
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    <th className="p-4 pl-6">Aluno</th>
                    <th className="p-4">Curso de Interesse</th>
                    <th className="p-4">Contato</th>
                    <th className="p-4">Data de Cadastro</th>
                    <th className="p-4 pr-6 text-center">Status / Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-sm">
                  {leadsWithCourse.map((lead) => (
                    <tr key={lead.id} className="hover:bg-neutral-50/50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 pl-6 font-semibold text-neutral-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-neutral-400 shrink-0" />
                          {lead.name}
                        </div>
                      </td>
                      <td className="p-4 text-neutral-600 dark:text-neutral-300">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-500 shrink-0" />
                          <span className="font-medium">{lead.courseTitle}</span>
                        </div>
                      </td>
                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                          <Mail className="h-3.5 w-3.5" />
                          <a href={`mailto:${lead.email}`} className="hover:underline hover:text-blue-600">
                            {lead.email}
                          </a>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                            <Phone className="h-3.5 w-3.5" />
                            <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-emerald-600">
                              {lead.phone}
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-neutral-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(lead.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-center">
                        <form action={toggleLeadStatus.bind(null, lead.id, lead.status)}>
                          <button
                            type="submit"
                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                              lead.status === "new"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50 hover:bg-blue-100"
                                : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200"
                            }`}
                          >
                            {lead.status === "new" ? "Novo (Marcar Contato)" : "Contatado"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PartnerShell>
  );
}
