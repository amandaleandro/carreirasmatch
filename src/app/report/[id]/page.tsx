import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  Analysis,
  AnalysisResult,
  AnalysisTeaserView,
  TRACK_LABELS,
  CareerTrack,
} from "@/components/analysis-display";
import { canViewFullDiagnostic } from "@/lib/entitlements";
import { toAnalysisTeaser } from "@/lib/analysis-teaser";
import { normalizeCareerSegment } from "@/lib/career-segments";
import { CAREER_OFFER_BY_SEGMENT } from "@/lib/career-offers";
import { UnlockDiagnosticButton } from "@/components/unlock-diagnostic-button";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const [record, user] = await Promise.all([
    prisma.analysis.findUnique({ where: { id }, include: { resume: true } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { careerSegment: true } }),
  ]);

  if (!record || record.resume.userId !== session.user.id) {
    notFound();
  }

  const unlocked = await canViewFullDiagnostic(session.user.id, id);
  const segment = normalizeCareerSegment(user?.careerSegment);
  const diagnosticPrice = segment ? CAREER_OFFER_BY_SEGMENT[segment].diagnosticPrice : "R$14,90";

  const teaser = {
    overallScore: record.overallScore,
    atsScore: record.atsScore,
    applicationStatus: record.applicationStatus as Analysis["applicationStatus"],
    applicationStatusReason: record.applicationStatusReason,
    keywordsFound: JSON.parse(record.keywordsFound) as string[],
    keywordsMissing: JSON.parse(record.keywordsMissing) as string[],
    strengths: (JSON.parse(record.strengths) as string[]).slice(0, 3),
    weaknesses: (JSON.parse(record.weaknesses) as string[]).slice(0, 3),
  };

  const analysis: Analysis | null = unlocked
    ? {
        ...teaser,
        technicalScore: record.technicalScore,
        experienceScore: record.experienceScore,
        seniorityScore: record.seniorityScore,
        strengths: JSON.parse(record.strengths),
        weaknesses: JSON.parse(record.weaknesses),
        suggestedSummary: record.suggestedSummary,
        fixes: JSON.parse(record.fixes),
        interviewQuestions: JSON.parse(record.interviewQuestions),
        studyPlan: JSON.parse(record.studyPlan),
        recruiterMessage: record.recruiterMessage,
        alternativeRoles: JSON.parse(record.alternativeRoles),
        talkAboutYourselfAnswer: record.talkAboutYourselfAnswer,
        transferableSkills: record.transferableSkills
          ? JSON.parse(record.transferableSkills)
          : null,
        transitionNarrative: record.transitionNarrative,
        whyCareerChangeAnswer: record.whyCareerChangeAnswer,
        bridgeRoles: record.bridgeRoles ? JSON.parse(record.bridgeRoles) : null,
        recruiterObjections: record.recruiterObjections
          ? JSON.parse(record.recruiterObjections)
          : null,
        applicationStrategy: record.applicationStrategy,
        weeklyApplicationPlan: record.weeklyApplicationPlan
          ? JSON.parse(record.weeklyApplicationPlan)
          : null,
        feedbackAnalysis: record.feedbackAnalysis,
        experienceSuggestions: JSON.parse(record.experienceSuggestions || "[]"),
        atsChecklist: JSON.parse(record.atsChecklist || "[]"),
        currentSummary: record.currentSummary || "",
      }
    : null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <header className="mb-10">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Relatório gerado por CarreirasMatch
        </p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">
          {record.jobTitle}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Trilha: {TRACK_LABELS[record.careerTrack as CareerTrack]}
        </p>
        {unlocked && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            <Link
              href={`/report/${id}/map`}
              className="inline-block text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Ver Mapa da Próxima Oportunidade →
            </Link>
            <Link
              href={`/resume/${id}`}
              className="inline-block text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Otimizar currículo para esta vaga →
            </Link>
          </div>
        )}
      </header>

      {analysis ? (
        <AnalysisResult
          result={analysis}
          careerTrack={record.careerTrack as CareerTrack}
          jobTitle={record.jobTitle}
        />
      ) : (
        <AnalysisTeaserView result={teaser}>
          <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 p-5 space-y-3">
            <h3 className="font-semibold">Quer o diagnóstico completo?</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Currículo otimizado, plano de estudo, perguntas de entrevista e mensagem pronta para o recrutador.
            </p>
            <UnlockDiagnosticButton analysisId={id} price={diagnosticPrice} />
          </div>
        </AnalysisTeaserView>
      )}
    </main>
  );
}
