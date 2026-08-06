import { prisma } from "@/lib/prisma";
import { hasToolAccess } from "@/lib/tool-access";
import { ToolAccessGate } from "@/components/ToolAccessGate";
import { ProfileFromScratchForm } from "./ProfileFromScratchForm";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";
import { hasFullAccessEmail } from "@/lib/full-access-users";

const TOOL_HREF = "/tools/profile-from-scratch";

export default async function ProfileFromScratchPage() {
  const session = await requireSubscriptionPage();

  const [user, evidences] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { careerSegment: true },
    }),
    prisma.professionalEvidence.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { title: true, description: true, metrics: true },
    }),
  ]);

  if (!hasFullAccessEmail(session.user.email) && !hasToolAccess(user?.careerSegment, TOOL_HREF)) {
    return <ToolAccessGate hasSegment={Boolean(user?.careerSegment)} />;
  }

  const initialProjects = evidences
    .map((e) => `${e.title}: ${e.description}${e.metrics ? ` (${e.metrics})` : ""}`)
    .join("\n");

  return <ProfileFromScratchForm initialProjects={initialProjects} />;
}
