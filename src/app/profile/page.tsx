import { prisma } from "@/lib/prisma";
import { ProfileSuggestions, ProfileSuggestionType } from "@/components/profile-suggestions";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireSubscriptionPage();

  const [suggestions, user, externalCourses] = await Promise.all([
    prisma.profileSuggestion.findMany({ where: { userId: session.user.id }, orderBy: { impactScore: "desc" } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { professionalArea: true } }),
    prisma.externalCourse.findMany({ where: { active: true }, orderBy: { lastSeenAt: "desc" }, take: 100 }),
  ]);
  const area = (user?.professionalArea ?? "").toLowerCase();
  const relevantCourses = externalCourses
    .filter((course) => !area || course.area.toLowerCase().includes(area) || course.title.toLowerCase().includes(area))
    .slice(0, 12);

  return (
    <ProfileSuggestions
      initialSuggestions={suggestions.map((s) => ({
        ...s,
        type: s.type as ProfileSuggestionType,
      }))}
      externalCourses={relevantCourses}
    />
  );
}
