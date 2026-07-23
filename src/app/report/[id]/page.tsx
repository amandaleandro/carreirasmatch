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
import { SubscriptionNudgeAutoOpen } from "@/components/subscription-nudge";
import { ShareMatchCard } from "@/components/share-match-card";
import { ReferralRewardBox } from "@/components/referral-reward-box";
import { getUserReferralStats } from "@/lib/referrals";
import { analyzeResumeBullets } from "@/lib/bullet-analysis";
import { VerifiedBadgeBox } from "@/components/verified-badge-box";
import type { StructuredResume } from "@/lib/groq";

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
  const diagnosticPrice = segment ? CAREER_OFFER_BY_SEGMENT[segment].diagnosticPrice : "R$9,90";

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
        grammarErrors: record.grammarErrors,
        structureRating: record.structureRating,
        structureFeedback: record.structureFeedback,
        missingBasicInfo: record.missingBasicInfo,
        jobDecoded: record.jobDecoded,
        jobRedFlags: record.jobRedFlags,
        clarifyingQuestions: record.clarifyingQuestions,
      }
    : null;

  // Currículo estruturado salvo na análise: alimenta a "Visão do ATS" e o
  // diagnóstico determinístico das descrições de experiência.
  let resumeStructured: StructuredResume | null = null;
  try {
    const parsed = JSON.parse(record.resumeStructured || "{}");
    if (parsed && Array.isArray(parsed.experiences)) resumeStructured = parsed as StructuredResume;
  } catch {
    // JSON malformado: segue sem os cards determinísticos.
  }
  const bulletAnalysis = resumeStructured ? analyzeResumeBullets(resumeStructured) : null;

  // Percentil do score frente às demais análises da mesma trilha (benchmark).
  // Só mostra com amostra mínima para o número não ser ruído.
  const [trackTotal, trackBelow] = await Promise.all([
    prisma.analysis.count({ where: { careerTrack: record.careerTrack } }),
    prisma.analysis.count({
      where: { careerTrack: record.careerTrack, overallScore: { lt: record.overallScore } },
    }),
  ]);
  const betterThanPercent =
    trackTotal >= 20 ? Math.round((trackBelow / trackTotal) * 100) : null;

  // Evolução: compara com a análise anterior do MESMO currículo (qualquer vaga).
  // Motiva o ciclo "corrigiu → re-analisou → nota subiu".
  const previousAnalysis = await prisma.analysis.findFirst({
    where: { resumeId: record.resumeId, createdAt: { lt: record.createdAt } },
    orderBy: { createdAt: "desc" },
    select: { overallScore: true, atsScore: true, createdAt: true, jobTitle: true },
  });
  const scoreDelta = previousAnalysis ? record.overallScore - previousAnalysis.overallScore : null;

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
            <Link
              href="/tools/cover-letter"
              className="inline-block text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Gerar carta de apresentação para esta vaga →
            </Link>
          </div>
        )}
      </header>

      {previousAnalysis && scoreDelta !== null && scoreDelta !== 0 && (
        <div
          className={`rounded-2xl border p-4 flex items-center gap-3 ${
            scoreDelta > 0
              ? "border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30"
              : "border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30"
          }`}
        >
          <span className={`text-2xl font-black shrink-0 ${scoreDelta > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
            {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
          </span>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {scoreDelta > 0 ? "Seu currículo evoluiu: " : "Nota abaixo da análise anterior: "}
            este match ficou {Math.abs(scoreDelta)} ponto{Math.abs(scoreDelta) > 1 ? "s" : ""}{" "}
            {scoreDelta > 0 ? "acima" : "abaixo"} da análise anterior deste currículo (
            {previousAnalysis.jobTitle}, {previousAnalysis.createdAt.toLocaleDateString("pt-BR")}).
            {scoreDelta < 0 && " Vagas diferentes exigem requisitos diferentes — veja as palavras-chave ausentes."}
          </p>
        </div>
      )}

      {/* Card Gerado para Compartilhamento em Stories */}
      <ShareMatchCard
        jobTitle={record.jobTitle}
        overallScore={record.overallScore}
        userName={user?.name}
        userId={session.user.id}
        betterThanPercent={betterThanPercent}
      />

      {analysis ? (
        <div className="space-y-6">
          <AnalysisResult
            result={analysis}
            careerTrack={record.careerTrack as CareerTrack}
            jobTitle={record.jobTitle}
            behavioralResult={behavioralResult}
            bulletAnalysis={bulletAnalysis}
            resumeStructured={resumeStructured}
            betterThanPercent={betterThanPercent}
            analysisId={id}
          />
          <VerifiedBadgeBox analysisId={id} overallScore={record.overallScore} />
          {!subscribed && segment !== "student" && (
            <>
              <SubscriptionUpsell segment={segment ?? "career_pro"} />
              <SubscriptionNudgeAutoOpen reason="limit" />
            </>
          )}
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
              <h3 className="font-semibold text-lg">Libere o Kit Candidatura para esta vaga</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Currículo pronto em PDF, palavras-chave da vaga, mensagem para o recrutador,
                perguntas de entrevista e um plano de evolução, tudo em um só lugar.
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
        </div>
      )}

      {/* Recompensa de Indicação para liberar sem pagar */}
      <ReferralRewardBox
        userId={session.user.id}
        totalReferrals={referralStats.totalReferrals}
        credits={referralStats.credits}
      />
    </main>
  );
}
