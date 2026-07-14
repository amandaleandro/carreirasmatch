import Link from "next/link";
import { VOCATION_AREAS } from "@/lib/vocation-areas";
import { ContentPage } from "@/components/content-page";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";
import { ToolAccessGate } from "@/components/ToolAccessGate";
import { hasFullAccessEmail } from "@/lib/full-access-users";
import { normalizeCareerSegment } from "@/lib/career-segments";
import { prisma } from "@/lib/prisma";

export default async function VocationCollegePage() {
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

  return (
    <ContentPage
      eyebrow="Já na faculdade"
      title="Vamos direto para a sua especialização."
      description="Você já escolheu seu curso, escolha a área abaixo para achar qual caminho seguir dentro dele."
      backHref="/tools/vocation-test"
      backLabel="← Voltar"
      wide
    >
      <div className="grid sm:grid-cols-2 gap-4">
        {VOCATION_AREAS.map((area) => (
          <Link
            key={area.slug}
            href={`/tools/vocation-test/${area.slug}?enrolled=1`}
            className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-5 shadow-sm hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h2 className="font-bold mb-1.5">{area.label}</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{area.description}</p>
          </Link>
        ))}
      </div>
    </ContentPage>
  );
}
