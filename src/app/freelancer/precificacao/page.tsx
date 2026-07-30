import { requireAuthPage } from "@/lib/require-auth-page";
import { prisma } from "@/lib/prisma";
import { parseSkills } from "@/lib/freelance";
import { PricingForm } from "@/components/pricing-form";

export const dynamic = "force-dynamic";

export default async function FreelancePricingPage() {
  const session = await requireAuthPage();

  const profile = await prisma.freelancerProfile.findUnique({
    where: { userId: session.user.id },
    select: { category: true, skills: true },
  });

  return (
    <PricingForm
      initialCategory={profile?.category ?? ""}
      initialSkills={parseSkills(profile?.skills)}
    />
  );
}
