import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DiscoveryForm } from "./DiscoveryForm";
import type { DiscoveryResult } from "@/lib/tools";

const DISCOVERY_AREA_SLUG = "discover";

export default async function VocationDiscoverPage() {
  const session = await auth();

  const lastResult = session?.user?.id
    ? await prisma.vocationTestResult.findFirst({
        where: { userId: session.user.id, areaSlug: DISCOVERY_AREA_SLUG },
        orderBy: { createdAt: "desc" },
      })
    : null;

  const initialResult = lastResult ? (JSON.parse(lastResult.result) as DiscoveryResult) : null;

  return <DiscoveryForm initialResult={initialResult} loggedIn={Boolean(session?.user?.id)} />;
}
