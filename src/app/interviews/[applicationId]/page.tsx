import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { InterviewPrep } from "@/components/interview-prep";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";
import { linkAnalysisToApplication } from "@/app/applications/actions";

export const dynamic = "force-dynamic";

export default async function ApplicationInterviewPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const session = await requireSubscriptionPage();
  const { applicationId } = await params;

  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId: session.user.id },
    include: { analysis: true },
  });

  if (!application) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 w-full text-center">
        <h1 className="text-2xl font-bold tracking-tight">Candidatura não encontrada</h1>
        <Link
          href="/applications"
          className="inline-block mt-6 rounded-xl bg-blue-600 text-white font-semibold px-6 py-3 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all"
        >
          Voltar para candidaturas
        </Link>
      </div>
    );
  }

  if (!application.analysis) {
    const analyses = await prisma.analysis.findMany({
      where: { resume: { userId: session.user.id } },
      orderBy: { createdAt: "desc" },
      select: { id: true, jobTitle: true, createdAt: true },
    });

    return (
      <div className="max-w-xl mx-auto px-4 py-16 w-full">
        <Link href="/applications" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          ← Voltar para candidaturas
        </Link>
        <h1 className="text-2xl font-bold tracking-tight mt-4">
          Vincule uma análise para {application.jobTitle}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Para gerar perguntas de entrevista personalizadas, ligue esta candidatura a uma
          análise de vaga já feita.
        </p>
        {analyses.length === 0 ? (
          <Link
            href="/"
            className="inline-block mt-6 rounded-xl bg-blue-600 text-white font-semibold px-6 py-3 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all"
          >
            Fazer minha primeira análise
          </Link>
        ) : (
          <form
            action={linkAnalysisToApplication.bind(null, application.id)}
            className="mt-6 flex flex-col sm:flex-row gap-3"
          >
            <select
              name="analysisId"
              required
              className="min-w-0 flex-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              {analyses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.jobTitle} — {a.createdAt.toLocaleDateString("pt-BR")}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all"
            >
              Vincular e continuar
            </button>
          </form>
        )}
      </div>
    );
  }

  const questions: string[] = JSON.parse(application.analysis.interviewQuestions || "[]");
  let progress: Record<string, { answer: string; feedback: string; strongPoints: string[]; improvementTips: string[]; clarity: number; technicalDepth: number; confidence: number }> = {};
  try {
    progress = JSON.parse(application.analysis.interviewProgress || "{}");
  } catch {
    progress = {};
  }

  return (
    <InterviewPrep
      analysisId={application.analysis.id}
      jobTitle={application.analysis.jobTitle}
      questions={questions}
      initialProgress={progress}
    />
  );
}
