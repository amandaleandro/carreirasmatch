import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getVocationArea } from "@/lib/vocation-areas";
import { VocationTestForm } from "./VocationTestForm";
import type { VocationResult } from "@/lib/tools";

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

  const session = await auth();

  const lastResult = session?.user?.id
    ? await prisma.vocationTestResult.findFirst({
        where: { userId: session.user.id, areaSlug: area.slug },
        orderBy: { createdAt: "desc" },
      })
    : null;

  const initialResult = lastResult ? (JSON.parse(lastResult.result) as VocationResult) : null;

  return (
    <VocationTestForm
      area={area}
      initialResult={initialResult}
      alreadyEnrolled={alreadyEnrolled}
      loggedIn={Boolean(session?.user?.id)}
    />
  );
}
