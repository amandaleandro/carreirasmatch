import { prisma } from "@/lib/prisma";
import { hasToolAccess } from "@/lib/tool-access";
import { ToolAccessGate } from "@/components/ToolAccessGate";
import { InternshipChecklistView } from "./InternshipChecklistView";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";
import { hasFullAccessEmail } from "@/lib/full-access-users";

const TOOL_HREF = "/tools/internship-checklist";

export default async function InternshipChecklistPage() {
  const session = await requireSubscriptionPage();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { careerSegment: true, internshipChecklistProgress: true },
  });

  if (!hasFullAccessEmail(session.user.email) && !hasToolAccess(user?.careerSegment, TOOL_HREF)) {
    return <ToolAccessGate hasSegment={Boolean(user?.careerSegment)} />;
  }

  let initialChecked: string[] = [];
  try {
    initialChecked = JSON.parse(user?.internshipChecklistProgress ?? "[]");
  } catch {
    initialChecked = [];
  }

  return <InternshipChecklistView initialChecked={initialChecked} />;
}
