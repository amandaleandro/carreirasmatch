import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { InterviewPrep } from "@/components/interview-prep";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";

export const dynamic = "force-dynamic";

export default async function InterviewsPage() {
  const session = await requireSubscriptionPage();

  const latest = await prisma.analysis.findFirst({
    where: { resume: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 w-full text-center">
        <h1 className="text-2xl font-bold tracking-tight">Prepare-se para a entrevista</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Faça sua primeira análise de vaga para treinar com perguntas
          baseadas na vaga selecionada.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 rounded-xl bg-blue-600 text-white font-semibold px-6 py-3 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all"
        >
          Fazer minha primeira análise
        </Link>
      </div>
    );
  }

  const questions: string[] = JSON.parse(latest.interviewQuestions || "[]");
  let progress: Record<string, { answer: string; feedback: string; strongPoints: string[]; improvementTips: string[]; clarity: number; technicalDepth: number; confidence: number }> = {};
  try {
    progress = JSON.parse(latest.interviewProgress || "{}");
  } catch {
    progress = {};
  }

  return (
    <InterviewPrep
      analysisId={latest.id}
      jobTitle={latest.jobTitle}
      jobText={latest.jobText}
      questions={questions}
      initialProgress={progress}
    />
  );
}
