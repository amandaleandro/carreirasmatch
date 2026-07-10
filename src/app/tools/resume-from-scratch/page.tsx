import { prisma } from "@/lib/prisma";
import { hasToolAccess } from "@/lib/tool-access";
import { ToolAccessGate } from "@/components/ToolAccessGate";
import { ResumeFromScratchForm } from "./ResumeFromScratchForm";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";
import { hasFullAccessEmail } from "@/lib/full-access-users";

const TOOL_HREF = "/tools/resume-from-scratch";

export default async function ResumeFromScratchPage() {
  const session = await requireSubscriptionPage();

  const [user, courses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { careerSegment: true, professionalArea: true },
    }),
    prisma.userCourse.findMany({
      where: { userId: session.user.id },
      select: { title: true, provider: true },
    }),
  ]);

  if (!hasFullAccessEmail(session.user.email) && !hasToolAccess(user?.careerSegment, TOOL_HREF)) {
    return <ToolAccessGate hasSegment={Boolean(user?.careerSegment)} />;
  }

  const initialProjects = courses
    .map((c) => (c.provider ? `${c.title} (${c.provider})` : c.title))
    .join("\n");

  return (
    <ResumeFromScratchForm
      initialTargetRole={user?.professionalArea ?? ""}
      initialProjects={initialProjects}
    />
  );
}
