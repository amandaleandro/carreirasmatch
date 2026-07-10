import { prisma } from "@/lib/prisma";
import { hasToolAccess } from "@/lib/tool-access";
import { ToolAccessGate } from "@/components/ToolAccessGate";
import { ProjectToExperienceForm } from "./ProjectToExperienceForm";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";
import { hasFullAccessEmail } from "@/lib/full-access-users";

const TOOL_HREF = "/tools/project-to-experience";

export default async function ProjectToExperiencePage() {
  const session = await requireSubscriptionPage();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { careerSegment: true },
  });

  if (!hasFullAccessEmail(session.user.email) && !hasToolAccess(user?.careerSegment, TOOL_HREF)) {
    return <ToolAccessGate hasSegment={Boolean(user?.careerSegment)} />;
  }

  return <ProjectToExperienceForm />;
}
