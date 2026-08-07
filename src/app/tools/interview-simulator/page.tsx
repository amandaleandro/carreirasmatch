import { InterviewSimulatorForm } from "./InterviewSimulatorForm";
import { requireAuthPage } from "@/lib/require-auth-page";
import { prisma } from "@/lib/prisma";
import { TRACK_LABELS, type CareerTrack } from "@/components/analysis-display";
import { JourneyUpsellBanner } from "@/components/journey-upsell-banner";

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
    <>
      <InterviewSimulatorForm
        analysisId={analysisId}
        initialTargetRole={initialTargetRole}
        initialArea={initialArea}
      />
      <JourneyUpsellBanner
        journey="career"
        title="Quer se preparar para uma vaga específica de ponta a ponta?"
        description="O Plano de Candidatura junta esta simulação com Match, ajustes de currículo e mensagem para o recrutador."
      />
    </>
  );
}
