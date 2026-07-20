import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCompanyPage } from "@/lib/company-auth";

export const dynamic = "force-dynamic";

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900";
  if (score >= 40) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900";
  return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900";
}

export default async function ScreeningResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { company } = await requireCompanyPage();
  const { id } = await params;

  const job = await prisma.companyJob.findFirst({
    where: { id, companyId: company.id },
    include: {
      candidates: { orderBy: { fitScore: "desc" } },
    },
  });

  if (!job) notFound();

  return (
    <div>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-6">
        <Link href="/empresa" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          ← Voltar para triagens
        </Link>

        <header>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{job.title}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {job.candidates.length} {job.candidates.length === 1 ? "candidato" : "candidatos"} ·{" "}
            {job.createdAt.toLocaleDateString("pt-BR")}
          </p>
        </header>

        {job.recommendation && (
          <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 p-5">
            <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1.5">Recomendação</h2>
            <p className="text-sm text-blue-900/90 dark:text-blue-200/90 leading-relaxed">{job.recommendation}</p>
          </div>
        )}

        <ol className="space-y-3">
          {job.candidates.map((candidate, index) => (
            <li
              key={candidate.id}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-400">#{index + 1}</span>
                    <h3 className="font-semibold truncate">{candidate.candidateName || candidate.fileName}</h3>
                  </div>
                  {candidate.reason && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                      {candidate.reason}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full border px-3 py-1 text-sm font-bold ${scoreColor(candidate.fitScore)}`}
                >
                  {candidate.fitScore}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
