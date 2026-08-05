import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { defaultTrackForSegment, tracksForSegment, CAREER_SEGMENT_LABELS, normalizeCareerSegment } from "@/lib/career-segments";
import { hasActiveSubscriptionAccess } from "@/lib/entitlements";
import { AnalyzeVagaPage } from "@/components/analyze-vaga";
import type { CareerTrack } from "@/components/analysis-display";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calcule seu Match antes de enviar",
  description:
    "Envie seu currículo e uma vaga real para descobrir seu Match, as lacunas mais importantes e o que ajustar antes de se candidatar.",
  alternates: { canonical: "/analise" },
};

export default async function AnalisePage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { careerSegment: true },
      })
    : null;

  const suggestedTrack = defaultTrackForSegment(user?.careerSegment) as CareerTrack | null;
  // Intentional exception: unlocks the full track picker for any paid plan, not usage against a
  // single feature's monthly limit — no natural catalog featureKey for it.
  const isPaidUser = userId ? await hasActiveSubscriptionAccess(userId) : false;
  const allowedTracks = isPaidUser
    ? (tracksForSegment(user?.careerSegment) as CareerTrack[] | null)
    : null;
  const lockedTrack = allowedTracks && allowedTracks.length === 1 ? allowedTracks[0] : null;
  const segment = normalizeCareerSegment(user?.careerSegment);
  const careerSegmentLabel = segment ? CAREER_SEGMENT_LABELS[segment] : null;

  return (
    <AnalyzeVagaPage
      suggestedTrack={suggestedTrack}
      lockedTrack={lockedTrack}
      allowedTracks={allowedTracks}
      careerSegmentLabel={careerSegmentLabel}
      isAuthenticated={Boolean(userId)}
    />
  );
}
