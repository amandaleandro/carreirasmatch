import Link from "next/link";
import { UserCheck, ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
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
    <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6 font-sans">
      <Link
        href="/freelancer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao painel freelancer</span>
      </Link>

      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <UserCheck className="w-3.5 h-3.5" />
          Vitrine Profissional
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Meu Perfil Freelancer
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl">
          Configure seu portfólio, bio e pretensão de valor hora. Perfil publicado fica visível para contratantes na vitrine pública.
        </p>

        {profile?.published && (
          <div className="pt-1">
            <Link
              href={`/freelancers/${session.user.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Ver meu perfil público na vitrine</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      <FreelancerProfileForm initial={initial} />
    </main>
  );
}
