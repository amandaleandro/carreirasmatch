import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCompanyPage } from "@/lib/company-auth";
import { ScreeningResults, type ScreeningCandidate } from "@/components/screening-results";
import { DeleteScreeningButton } from "@/components/delete-screening-button";
import { AddResumesForm } from "@/components/add-resumes-form";

export const dynamic = "force-dynamic";

type CandidateStatus = ScreeningCandidate["status"];

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

  const candidates: ScreeningCandidate[] = job.candidates.map((c) => ({
    id: c.id,
    candidateName: c.candidateName,
    fileName: c.fileName,
    fitScore: c.fitScore,
    reason: c.reason,
    status: (c.status as CandidateStatus) ?? "none",
    note: c.note,
    rawText: c.rawText,
  }));

  return (
    <div>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-6">
        <Link href="/empresa" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          ← Voltar para triagens
        </Link>

        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{job.title}</h1>
            <p className="text-sm text-neutral-500 mt-1">
              {job.candidates.length} {job.candidates.length === 1 ? "candidato" : "candidatos"} ·{" "}
              {job.createdAt.toLocaleDateString("pt-BR")}
            </p>
          </div>
          <DeleteScreeningButton jobId={job.id} />
        </header>

        {job.recommendation && (
          <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 p-5">
            <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1.5">Recomendação</h2>
            <p className="text-sm text-blue-900/90 dark:text-blue-200/90 leading-relaxed">{job.recommendation}</p>
          </div>
        )}

        <AddResumesForm jobId={job.id} />

        <ScreeningResults jobTitle={job.title} candidates={candidates} />
      </div>
    </div>
  );
}
