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
import { canViewFullDiagnostic, hasActiveSubscriptionAccess } from "@/lib/entitlements";
import { normalizeCareerSegment } from "@/lib/career-segments";
import { CAREER_OFFER_BY_SEGMENT } from "@/lib/career-offers";
import { UnlockDiagnosticButton } from "@/components/unlock-diagnostic-button";
import { FunnelImpression, TEASER_VIEWED_EVENT } from "@/components/funnel-impression";
import { SubscriptionUpsell } from "@/components/subscription-upsell";
import { ShareMatchCard } from "@/components/share-match-card";
import { ReferralRewardBox } from "@/components/referral-reward-box";
import { getUserReferralStats } from "@/lib/referrals";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const [record, user, behavioralResult, referralStats] = await Promise.all([
    prisma.analysis.findUnique({ where: { id }, include: { resume: true } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { careerSegment: true, name: true } }),
    prisma.softSkillTestResult.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    getUserReferralStats(session.user.id),
  ]);

  if (!record || record.resume.userId !== session.user.id) {
    notFound();
  }

  const [unlocked, subscribed] = await Promise.all([
    canViewFullDiagnostic(session.user.id, id),
    hasActiveSubscriptionAccess(session.user.id),
  ]);
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
    <main className="max-w-3xl mx-auto px-4 py-12 w-full space-y-10">
      <header>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
            Relatório gerado por CarreirasMatch
          </span>
          {unlocked && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              🎁 Sua 1ª Análise Completa é 100% Grátis!
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
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

      {/* Card Gerado para Compartilhamento em Stories */}
      <ShareMatchCard
        jobTitle={record.jobTitle}
        overallScore={record.overallScore}
        userName={user?.name}
      />

      {analysis ? (
        <div className="space-y-6">
          <AnalysisResult
            result={analysis}
            careerTrack={record.careerTrack as CareerTrack}
            jobTitle={record.jobTitle}
            behavioralResult={behavioralResult}
          />
          {!subscribed && <SubscriptionUpsell segment={segment ?? "career_pro"} />}
        </div>
      ) : (
        <div className="space-y-6">
          <AnalysisTeaserView result={teaser}>
            <FunnelImpression
              event={TEASER_VIEWED_EVENT}
              analysisId={id}
              segment={segment ?? undefined}
            />
            <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 p-5 shadow-sm space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">
                Próximo passo recomendado
              </p>
              <h3 className="font-semibold text-lg">Veja exatamente o que ajustar antes de aplicar</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Libere o diagnóstico desta vaga com palavras-chave, ajustes de currículo,
                plano de evolução, perguntas de entrevista e mensagem para o recrutador.
              </p>
              <ul className="grid gap-2 text-sm text-neutral-700 dark:text-neutral-300 sm:grid-cols-2">
                {["Pagamento único", "Acesso vinculado a esta análise", "Cartão ou Pix", "Sem promessa de contratação"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <UnlockDiagnosticButton analysisId={id} price={diagnosticPrice} />
            </div>
          </AnalysisTeaserView>

          {/* Recompensa de Indicação para liberar sem pagar */}
          <ReferralRewardBox
            userId={session.user.id}
            totalReferrals={referralStats.totalReferrals}
            credits={referralStats.credits}
          />
        </div>
      )}
    </main>
  );
}
