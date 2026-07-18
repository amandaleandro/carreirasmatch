import Link from "next/link";
import { requireCompanyPage } from "@/lib/company-auth";
import { TalentSearch } from "@/components/talent-search";

export const dynamic = "force-dynamic";

export default async function TalentPoolPage() {
  await requireCompanyPage();

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-6">
        <Link href="/empresa" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          ← Voltar
        </Link>
        <header>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Banco de talentos</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Descreva a vaga e encontre candidatos que optaram por ser localizados. O contato só é
            liberado quando o candidato aceita o seu pedido.
          </p>
        </header>

        <TalentSearch />
      </div>
    </main>
  );
}
