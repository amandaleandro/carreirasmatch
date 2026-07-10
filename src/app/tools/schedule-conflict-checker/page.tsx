import { prisma } from "@/lib/prisma";
import { hasToolAccess } from "@/lib/tool-access";
import { ToolAccessGate } from "@/components/ToolAccessGate";
import { ScheduleConflictForm } from "./ScheduleConflictForm";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";
import { hasFullAccessEmail } from "@/lib/full-access-users";

const TOOL_HREF = "/tools/schedule-conflict-checker";

export default async function ScheduleConflictCheckerPage() {
  const session = await requireSubscriptionPage();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { careerSegment: true },
  });

  if (!hasFullAccessEmail(session.user.email) && !hasToolAccess(user?.careerSegment, TOOL_HREF)) {
    return <ToolAccessGate hasSegment={Boolean(user?.careerSegment)} />;
  }

  const classItems = await prisma.classScheduleItem.findMany({
    where: { userId: session.user.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return <ScheduleConflictForm initialClassItems={classItems} />;
}
