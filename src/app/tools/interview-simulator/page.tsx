import { InterviewSimulatorForm } from "./InterviewSimulatorForm";
import { requireAuthPage } from "@/lib/require-auth-page";
import { prisma } from "@/lib/prisma";
import { TRACK_LABELS, type CareerTrack } from "@/components/analysis-display";

export default async function InterviewSimulatorPage({
  searchParams,
}: {
  searchParams: Promise<{ analysisId?: string }>;
}) {
  const session = await requireAuthPage();
  const { analysisId } = await searchParams;

  let initialTargetRole = "";
  let initialArea = "";

  if (analysisId) {
    const analysis = await prisma.analysis.findFirst({
      where: { id: analysisId, resume: { userId: session.user.id } },
      select: { jobTitle: true, careerTrack: true },
    });
    if (analysis) {
      initialTargetRole = analysis.jobTitle;
      initialArea = TRACK_LABELS[analysis.careerTrack as CareerTrack] ?? "";
    }
  }

  return (
    <InterviewSimulatorForm
      analysisId={analysisId}
      initialTargetRole={initialTargetRole}
      initialArea={initialArea}
    />
  );
}
