import Link from "next/link";
import { requireCompanyPage, FREE_SCREENING_LIMIT } from "@/lib/company-auth";
import { NewScreeningForm } from "@/components/new-screening-form";

export const dynamic = "force-dynamic";

export default async function NewScreeningPage() {
  const { company } = await requireCompanyPage();
  const remaining = Math.max(0, FREE_SCREENING_LIMIT - company.screeningCount);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 space-y-6">
        <Link href="/empresa" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          ← Voltar
        </Link>
        <header>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Nova triagem</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Descreva a vaga e envie os currículos (PDF). Nós ranqueamos por aderência.
          </p>
        </header>

        {remaining > 0 ? (
          <NewScreeningForm />
        ) : (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30 p-6 text-sm text-amber-900 dark:text-amber-200">
            Você usou suas {FREE_SCREENING_LIMIT} triagens gratuitas. Fale com a gente para liberar mais triagens.
          </div>
        )}
      </div>
    </main>
  );
}
