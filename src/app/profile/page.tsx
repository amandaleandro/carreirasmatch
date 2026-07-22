import { prisma } from "@/lib/prisma";
import { ProfileSuggestions, ProfileSuggestionType, ProfileSuggestionStatus } from "@/components/profile-suggestions";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";
import { rankCourses } from "@/lib/course-match";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireSubscriptionPage();

  const [suggestions, user, externalCourses] = await Promise.all([
    prisma.profileSuggestion.findMany({ where: { userId: session.user.id }, orderBy: { impactScore: "desc" } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { professionalArea: true, city: true, state: true } }),
    prisma.externalCourse.findMany({ where: { active: true }, orderBy: { lastSeenAt: "desc" }, take: 100 }),
  ]);
  // Com área definida, ranqueia por relevância (descarta os sem match); sem área, mostra
  // os mais recentes como fallback para a página não ficar vazia. Cursos presenciais na
  // cidade/estado do usuário sobem no ranking (ver bônus de região em course-match.ts).
  const area = user?.professionalArea ?? "";
  const relevantCourses = (
    area.trim()
      ? rankCourses(externalCourses, { area, city: user?.city, state: user?.state })
      : externalCourses
  ).slice(0, 12);

  return (
    <ProfileSuggestions
      initialSuggestions={suggestions.map((s) => ({
        ...s,
        type: s.type as ProfileSuggestionType,
        status: s.status as ProfileSuggestionStatus,
      }))}
      externalCourses={relevantCourses}
    />
  );
}
