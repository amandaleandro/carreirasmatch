import Link from "next/link";
import { requireAuthPage } from "@/lib/require-auth-page";
import { prisma } from "@/lib/prisma";
import { parseSkills, parsePortfolio } from "@/lib/freelance";
import { FreelancerProfileForm } from "@/components/freelancer-profile-form";

export const dynamic = "force-dynamic";

export default async function FreelancerProfilePage() {
  const session = await requireAuthPage();

  const profile = await prisma.freelancerProfile.findUnique({
    where: { userId: session.user.id },
  });

  const initial = {
    headline: profile?.headline ?? "",
    bio: profile?.bio ?? "",
    category: profile?.category ?? "",
    skills: parseSkills(profile?.skills),
    hourlyRate: profile?.hourlyRateCents ? String(profile.hourlyRateCents / 100) : "",
    portfolio: parsePortfolio(profile?.portfolio),
    available: profile?.available ?? true,
    published: profile?.published ?? false,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 space-y-6">
      <Link href="/freelancer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Painel freelancer
      </Link>
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Meu perfil freelancer</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Monte sua vitrine. Um perfil publicado aparece para quem procura profissionais e pode
          receber convites para projetos.
        </p>
        {profile?.published && (
          <Link href={`/freelancers/${session.user.id}`} className="inline-block mt-3 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Ver meu perfil público →
          </Link>
        )}
      </header>

      <FreelancerProfileForm initial={initial} />
    </div>
  );
}
