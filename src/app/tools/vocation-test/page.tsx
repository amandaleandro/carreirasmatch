import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getAreaOfTheDayExplanation } from "@/lib/area-of-the-day";
import { ContentPage } from "@/components/content-page";
import { VocationHubClient, RecommendedAreaInfo } from "./VocationHubClient";

export default async function VocationTestHubPage() {
  const session = await auth();

  const results = session?.user?.id
    ? await prisma.vocationTestResult.findMany({
        where: { userId: session.user.id },
        select: { areaSlug: true, result: true },
      })
    : [];

  const testedSlugs = Array.from(new Set(results.map((r) => r.areaSlug)));
  const hasCompletedGeneralTest = testedSlugs.includes("discover");

  let recommendedAreas: RecommendedAreaInfo[] = [];
  const discoverResult = results.find((r) => r.areaSlug === "discover");

  if (discoverResult?.result) {
    try {
      const parsed = JSON.parse(discoverResult.result);
      if (Array.isArray(parsed.recommendedAreas)) {
        recommendedAreas = parsed.recommendedAreas;
      }
    } catch (error) {
      console.error("Erro ao ler áreas recomendadas:", error);
    }
  }

  let areaOfTheDay: Awaited<ReturnType<typeof getAreaOfTheDayExplanation>> | null = null;
  try {
    areaOfTheDay = await getAreaOfTheDayExplanation();
  } catch (error) {
    console.error("Erro ao gerar área do dia:", error);
  }

  return (
    <ContentPage
      eyebrow="Orientação Vocacional · Ensino Médio & Faculdade"
      title="Descubra qual caminho combina com você."
      description="Siga as etapas para identificar seu perfil de carreira, conhecer os cursos e tomar decisões com segurança."
      backHref="/tools/vocation-test/exam-archive"
      backLabel="Provas anteriores →"
      wide
    >
      <VocationHubClient
        testedSlugs={testedSlugs}
        hasCompletedGeneralTest={hasCompletedGeneralTest}
        recommendedAreas={recommendedAreas}
        areaOfTheDay={areaOfTheDay}
        loggedIn={Boolean(session?.user?.id)}
      />
    </ContentPage>
  );
}
