import { notFound } from "next/navigation";
import { getVocationArea } from "@/lib/vocation-areas";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";
import { prisma } from "@/lib/prisma";
import { normalizeCareerSegment } from "@/lib/career-segments";
import { hasFullAccessEmail } from "@/lib/full-access-users";
import { ToolAccessGate } from "@/components/ToolAccessGate";
import { ContentPage } from "@/components/content-page";
import { ExamMapForm } from "../ExamMapForm";

export default async function ExamMapPage({
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

  if (
    !hasFullAccessEmail(session.user.email) &&
    normalizeCareerSegment(user?.careerSegment) !== "student"
  ) {
    return <ToolAccessGate hasSegment={Boolean(user?.careerSegment)} />;
  }

  return (
    <ContentPage
      eyebrow="Assinantes · ensino médio"
      title={`Mapa de estudos ENEM/vestibular, ${area.label}`}
      description={`Conte como está sua preparação e receba um plano priorizado de estudos para o curso de ${area.label}.`}
      backHref={`/tools/vocation-test/${area.slug}`}
      backLabel="← Voltar para o teste"
    >
      <ExamMapForm area={area} />
    </ContentPage>
  );
}
