import { prisma } from "@/lib/prisma";
import { hasToolAccess } from "@/lib/tool-access";
import { ToolAccessGate } from "@/components/ToolAccessGate";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";
import { hasFullAccessEmail } from "@/lib/full-access-users";
import { ApprenticeCompanies } from "./ApprenticeCompanies";

const TOOL_HREF = "/tools/apprentice-companies";

export default async function ApprenticeCompaniesPage() {
  const session = await requireSubscriptionPage();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { careerSegment: true },
  });

  if (!hasFullAccessEmail(session.user.email) && !hasToolAccess(user?.careerSegment, TOOL_HREF)) {
    return <ToolAccessGate hasSegment={Boolean(user?.careerSegment)} />;
  }

  return <ApprenticeCompanies />;
}
