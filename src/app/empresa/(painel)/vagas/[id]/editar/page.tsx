import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCompanyPage } from "@/lib/company-auth";
import { EditVagaForm } from "@/components/edit-vaga-form";

export const dynamic = "force-dynamic";

export default async function EditVagaPage({ params }: { params: Promise<{ id: string }> }) {
  const { company } = await requireCompanyPage();
  const { id } = await params;

  const vaga = await prisma.companyVaga.findFirst({ where: { id, companyId: company.id } });
  if (!vaga) notFound();

  return (
    <div>
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 space-y-6">
        <Link href={`/empresa/vagas/${vaga.id}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          ← Voltar para a vaga
        </Link>
        <header>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Editar vaga</h1>
        </header>

        <EditVagaForm
          vaga={{ id: vaga.id, title: vaga.title, description: vaga.description, area: vaga.area, state: vaga.state }}
        />
      </div>
    </div>
  );
}
