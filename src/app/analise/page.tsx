import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { defaultTrackForSegment, tracksForSegment, CAREER_SEGMENT_LABELS, normalizeCareerSegment } from "@/lib/career-segments";
import { hasActiveSubscriptionAccess } from "@/lib/entitlements";
import { AnalyzeVagaPage } from "@/components/analyze-vaga";
import type { CareerTrack } from "@/components/analysis-display";

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
    />
  );
}
