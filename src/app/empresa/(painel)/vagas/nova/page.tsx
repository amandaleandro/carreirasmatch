import Link from "next/link";
import { requireCompanyPage } from "@/lib/company-auth";
import { NewVagaForm } from "@/components/new-vaga-form";

export const dynamic = "force-dynamic";

export default async function NewVagaPage() {
  await requireCompanyPage();

  return (
    <div>
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 space-y-6">
        <Link href="/empresa/vagas" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          ← Voltar para vagas
        </Link>
        <header>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Nova vaga</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Descreva a vaga. Assim que salvar, buscamos no banco de talentos os candidatos com o
            perfil mais aderente.
          </p>
        </header>

        <NewVagaForm />
      </div>
    </div>
  );
}
