import { prisma } from "@/lib/prisma";
import { hasToolAccess } from "@/lib/tool-access";
import { ToolAccessGate } from "@/components/ToolAccessGate";
import { ResumeFromScratchForm } from "./ResumeFromScratchForm";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";
import { hasFullAccessEmail } from "@/lib/full-access-users";

const TOOL_HREF = "/tools/resume-from-scratch";

export default async function ResumeFromScratchPage() {
  const session = await requireSubscriptionPage();

  const [user, courses, evidences] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { careerSegment: true, professionalArea: true },
    }),
    prisma.userCourse.findMany({
      where: { userId: session.user.id },
      select: { title: true, provider: true },
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

  const initialProjects = [
    ...evidences.map((e) => `${e.title}: ${e.description}${e.metrics ? ` (${e.metrics})` : ""}`),
    ...courses.map((c) => (c.provider ? `${c.title} (${c.provider})` : c.title)),
  ].join("\n");

  return (
    <ResumeFromScratchForm
      initialTargetRole={user?.professionalArea ?? ""}
      initialProjects={initialProjects}
    />
  );
}
