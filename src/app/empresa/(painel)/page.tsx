import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCompanyPage, FREE_SCREENING_LIMIT } from "@/lib/company-auth";

export const dynamic = "force-dynamic";

export default async function CompanyDashboardPage() {
  const { company } = await requireCompanyPage();

  const jobs = await prisma.companyJob.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { candidates: true } } },
  });

  const freeRemaining = Math.max(0, FREE_SCREENING_LIMIT - company.screeningCount);
  const remaining = freeRemaining + company.screeningCredits;

  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Triagem de candidatos</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Descreva a vaga, envie os currículos e receba um ranking por aderência.
            </p>
          </div>
          <Link
            href="/empresa/triagem/nova"
            className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 text-center"
          >
            + Nova triagem
          </Link>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
          {remaining > 0 ? (
            <span>Você tem <strong className="text-neutral-900 dark:text-white">{remaining}</strong> {remaining === 1 ? "triagem" : "triagens"} disponíveis{freeRemaining > 0 && company.screeningCredits > 0 ? ` (${freeRemaining} gratuita(s) + ${company.screeningCredits} compradas)` : ""}.</span>
          ) : (
            <span>Seus créditos de triagem acabaram.</span>
          )}
          <Link href="/empresa/billing" className="shrink-0 font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Comprar créditos
          </Link>
        </div>

        <Link
          href="/empresa/talentos"
          className="flex items-center justify-between gap-4 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 p-5 hover:border-blue-400 dark:hover:border-blue-700 transition-colors"
        >
          <div>
            <h2 className="font-semibold text-blue-900 dark:text-blue-200">Banco de talentos</h2>
            <p className="text-sm text-blue-900/80 dark:text-blue-200/80 mt-0.5">
              Busque candidatos que optaram por ser encontrados por empresas.
            </p>
          </div>
          <span className="text-blue-600 dark:text-blue-400 shrink-0">→</span>
        </Link>

        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-10 text-center">
            <p className="text-neutral-600 dark:text-neutral-400">Você ainda não fez nenhuma triagem.</p>
            <Link href="/empresa/triagem/nova" className="mt-3 inline-block font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Criar a primeira triagem →
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/empresa/triagem/${job.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 hover:border-blue-400 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="min-w-0">
                    <h2 className="font-semibold truncate">{job.title}</h2>
                    <p className="text-sm text-neutral-500 mt-0.5">
                      {job._count.candidates} {job._count.candidates === 1 ? "currículo" : "currículos"} ·{" "}
                      {job.createdAt.toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 shrink-0">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
