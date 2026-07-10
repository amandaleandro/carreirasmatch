import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasToolAccess } from "@/lib/tool-access";
import { ToolAccessGate } from "@/components/ToolAccessGate";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";
import { hasFullAccessEmail } from "@/lib/full-access-users";
import { getVocationArea } from "@/lib/vocation-areas";
import { CutoffEstimateForm } from "./CutoffEstimateForm";

const TOOL_HREF = "/tools/vocation-test";

export default async function CutoffEstimatePage({
  params,
}: {
  params: Promise<{ area: string }>;
}) {
  const { area: areaSlug } = await params;
  const area = getVocationArea(areaSlug);
  if (!area) notFound();

  const session = await requireSubscriptionPage();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { careerSegment: true },
  });

  if (!hasFullAccessEmail(session.user.email) && !hasToolAccess(user?.careerSegment, TOOL_HREF)) {
    return <ToolAccessGate hasSegment={Boolean(user?.careerSegment)} />;
  }

  return <CutoffEstimateForm area={area} />;
}
