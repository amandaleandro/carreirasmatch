import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getVocationArea } from "@/lib/vocation-areas";
import { VocationTestForm } from "./VocationTestForm";
import type { VocationResult } from "@/lib/tools";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";
import { ToolAccessGate } from "@/components/ToolAccessGate";
import { hasFullAccessEmail } from "@/lib/full-access-users";
import { normalizeCareerSegment } from "@/lib/career-segments";

export default async function VocationTestAreaPage({
  params,
  searchParams,
}: {
  params: Promise<{ area: string }>;
  searchParams: Promise<{ enrolled?: string }>;
}) {
  const { area: areaSlug } = await params;
  const { enrolled } = await searchParams;
  const alreadyEnrolled = enrolled === "1";
  const area = getVocationArea(areaSlug);
  if (!area) notFound();

  if (alreadyEnrolled) {
    const session = await requireSubscriptionPage();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { careerSegment: true },
    });

    if (
      !hasFullAccessEmail(session.user.email) &&
      normalizeCareerSegment(user?.careerSegment) !== "internship"
    ) {
      return <ToolAccessGate hasSegment={Boolean(user?.careerSegment)} />;
    }

    const lastResult = await prisma.vocationTestResult.findFirst({
      where: { userId: session.user.id, areaSlug: area.slug },
      orderBy: { createdAt: "desc" },
    });

    const initialResult = lastResult ? (JSON.parse(lastResult.result) as VocationResult) : null;

    return (
      <VocationTestForm
        area={area}
        initialResult={initialResult}
        alreadyEnrolled
        loggedIn
        hasCompletedGeneralTest
      />
    );
  }

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [lastResult, generalTestResult] = await Promise.all([
    prisma.vocationTestResult.findFirst({
      where: { userId: session.user.id, areaSlug: area.slug },
      orderBy: { createdAt: "desc" },
    }),
    prisma.vocationTestResult.findFirst({
      where: { userId: session.user.id, areaSlug: "discover" },
      select: { id: true },
    }),
  ]);

  const initialResult = lastResult ? (JSON.parse(lastResult.result) as VocationResult) : null;

  return (
    <VocationTestForm
      area={area}
      initialResult={initialResult}
      alreadyEnrolled={alreadyEnrolled}
      hasCompletedGeneralTest={Boolean(generalTestResult)}
    />
  );
}
