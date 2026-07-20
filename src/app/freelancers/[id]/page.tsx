import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  parseSkills,
  parsePortfolio,
  categoryLabel,
  averageRating,
  formatCents,
} from "@/lib/freelance";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

async function loadProfile(id: string) {
  return prisma.freelancerProfile.findFirst({
    where: { userId: id, published: true },
    include: { user: { select: { name: true, image: true, city: true, state: true } } },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const profile = await loadProfile(id);
  if (!profile) return { title: "Freelancer não encontrado" };
  const name = profile.user.name ?? "Freelancer";
  return {
    title: `${name} — ${profile.headline || "Freelancer"}`,
    description: profile.headline || `Perfil freelancer de ${name}`,
  };
}

export default async function PublicFreelancerPage({ params }: Props) {
  const { id } = await params;
  const [profile, session] = await Promise.all([loadProfile(id), auth()]);
  if (!profile) notFound();

  const skills = parseSkills(profile.skills);
  const portfolio = parsePortfolio(profile.portfolio);
  const avg = averageRating(profile.ratingSum, profile.ratingCount);
  const name = profile.user.name ?? "Freelancer";
  const location = [profile.user.city, profile.user.state].filter(Boolean).join(", ");
  const isOwner = session?.user?.id === profile.userId;

  const reviews = await prisma.freelanceReview.findMany({
    where: { targetUserId: profile.userId, direction: "client_to_freelancer" },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { author: { select: { name: true } } },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-8">
      <Link href="/freelancers" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Todos os freelancers
      </Link>

      <header className="flex flex-col sm:flex-row gap-5 sm:items-center">
        {profile.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.user.image} alt={name} className="h-20 w-20 rounded-2xl object-cover" />
        ) : (
          <div className="h-20 w-20 rounded-2xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-300">
            {name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{name}</h1>
          {profile.headline && <p className="text-neutral-600 dark:text-neutral-400 mt-1">{profile.headline}</p>}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-neutral-500">
            {profile.category && <span>{categoryLabel(profile.category)}</span>}
            {location && <span>· {location}</span>}
            {profile.ratingCount > 0 && (
              <span className="text-amber-500 font-medium">★ {avg.toFixed(1)} ({profile.ratingCount})</span>
            )}
            {profile.completedCount > 0 && <span>· {profile.completedCount} projeto(s) concluído(s)</span>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500">A partir de</p>
          <p className="text-lg font-bold">{formatCents(profile.hourlyRateCents)}{profile.hourlyRateCents ? "/h" : ""}</p>
          {!profile.available && <p className="text-xs text-amber-600 mt-1">Indisponível no momento</p>}
        </div>
      </header>

      {isOwner && (
        <Link href="/freelancer/perfil" className="inline-block text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          Editar meu perfil →
        </Link>
      )}

      {profile.bio && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Sobre</h2>
          <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Habilidades</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className="rounded-full bg-neutral-100 dark:bg-white/5 px-3 py-1 text-sm">{s}</span>
            ))}
          </div>
        </section>
      )}

      {portfolio.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Portfólio</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {portfolio.map((item, i) => (
              <a
                key={i}
                href={item.url || undefined}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="block rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-blue-400 transition-colors"
              >
                <p className="font-semibold">{item.title || item.url}</p>
                {item.description && <p className="text-sm text-neutral-500 mt-1">{item.description}</p>}
                {item.url && <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 truncate">{item.url}</p>}
              </a>
            ))}
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Avaliações</h2>
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{r.author.name ?? "Cliente"}</span>
                  <span className="text-amber-500 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                </div>
                {r.comment && <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">{r.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
