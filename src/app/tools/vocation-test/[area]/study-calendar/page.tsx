import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hasToolAccess } from "@/lib/tool-access";
import { ToolAccessGate } from "@/components/ToolAccessGate";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";
import { hasFullAccessEmail } from "@/lib/full-access-users";
import { getVocationArea } from "@/lib/vocation-areas";
import { StudyCalendarView } from "./StudyCalendarView";

const TOOL_HREF = "/tools/vocation-test";

export default async function StudyCalendarPage({
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

  const items = await prisma.studyScheduleItem.findMany({
    where: { userId: session.user.id, areaSlug: area.slug },
    orderBy: [{ weekStart: "asc" }, { createdAt: "asc" }],
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link
        href={`/tools/vocation-test/${area.slug}`}
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        ← Voltar para {area.label}
      </Link>
      <header className="mt-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Calendário de estudos — {area.label}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Marque as tarefas conforme for concluindo ao longo das semanas.
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Nenhum calendário salvo ainda. Gere um{" "}
          <Link
            href={`/tools/vocation-test/${area.slug}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            mapa de estudos
          </Link>{" "}
          e clique em &quot;Salvar como calendário&quot;.
        </p>
      ) : (
        <StudyCalendarView items={items} />
      )}
    </main>
  );
}
