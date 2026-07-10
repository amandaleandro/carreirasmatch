import { prisma } from "@/lib/prisma";
import { ProfileSuggestions, ProfileSuggestionType } from "@/components/profile-suggestions";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireSubscriptionPage();

  const suggestions = await prisma.profileSuggestion.findMany({
    where: { userId: session.user.id },
    orderBy: { impactScore: "desc" },
  });

  return (
    <ProfileSuggestions
      initialSuggestions={suggestions.map((s) => ({
        ...s,
        type: s.type as ProfileSuggestionType,
      }))}
    />
  );
}
