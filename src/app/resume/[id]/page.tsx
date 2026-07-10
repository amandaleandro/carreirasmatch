import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ResumeOptimizer } from "@/components/resume-optimizer";
import type { ExperienceSuggestion, AtsChecklistItem } from "@/components/analysis-display";
import type { StructuredResume } from "@/lib/groq";
import { canViewFullDiagnostic } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

type ResumeOverride = {
  summary?: string;
  experiences?: Record<number, string>;
  resumeStructured?: StructuredResume;
};

const EMPTY_STRUCTURED: StructuredResume = {
  contact: { name: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "" },
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  experiences: [],
};

export default async function ResumeOptimizerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const analysis = await prisma.analysis.findUnique({
    where: { id },
    include: { resume: true },
  });

  if (!analysis || analysis.resume.userId !== session.user.id) {
    notFound();
  }

  if (!(await canViewFullDiagnostic(session.user.id, id))) {
    redirect(`/report/${id}`);
  }

  let override: ResumeOverride = {};
  if (analysis.resumeOverride) {
    try {
      override = JSON.parse(analysis.resumeOverride);
    } catch {
      override = {};
    }
  }

  const experienceSuggestions: ExperienceSuggestion[] = JSON.parse(
    analysis.experienceSuggestions || "[]"
  );
  const atsChecklist: AtsChecklistItem[] = JSON.parse(analysis.atsChecklist || "[]");
  const keywordsFound: string[] = JSON.parse(analysis.keywordsFound || "[]");
  const keywordsMissing: string[] = JSON.parse(analysis.keywordsMissing || "[]");

  let resumeStructured: StructuredResume = EMPTY_STRUCTURED;
  try {
    resumeStructured = {
      ...EMPTY_STRUCTURED,
      ...JSON.parse(analysis.resumeStructured || "{}"),
    };
  } catch {
    resumeStructured = EMPTY_STRUCTURED;
  }

  const previous = await prisma.analysis.findFirst({
    where: {
      resume: { userId: session.user.id },
      createdAt: { lt: analysis.createdAt },
    },
    orderBy: { createdAt: "desc" },
    select: { atsScore: true },
  });

  return (
    <ResumeOptimizer
      analysisId={analysis.id}
      jobTitle={analysis.jobTitle}
      candidateName={session.user.name ?? session.user.email ?? "Candidato"}
      currentSummary={analysis.currentSummary || "Nenhum resumo profissional encontrado no currículo."}
      suggestedSummary={override.summary ?? analysis.suggestedSummary}
      experienceSuggestions={experienceSuggestions}
      experienceOverrides={override.experiences ?? {}}
      resumeStructured={override.resumeStructured ?? resumeStructured}
      atsChecklist={atsChecklist}
      keywordsFound={keywordsFound}
      keywordsMissing={keywordsMissing}
      atsScore={analysis.atsScore}
      previousAtsScore={previous?.atsScore ?? null}
      hasPdf={!!analysis.resume.pdfData}
      pdfFileName={analysis.resume.fileName}
      hasBaseline={analysis.careerTrack !== "from_scratch"}
    />
  );
}
