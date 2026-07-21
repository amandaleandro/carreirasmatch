import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  FREELANCE_CATEGORIES,
  parseSkills,
  categoryLabel,
  averageRating,
  formatCents,
} from "@/lib/freelance";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Freelancers",
  description: "Encontre profissionais freelancer para o seu projeto.",
};

type Props = { searchParams: Promise<{ cat?: string }> };

export default async function FreelancersPage({ searchParams }: Props) {
  const { cat } = await searchParams;
  const category = cat && FREELANCE_CATEGORIES.some((c) => c.value === cat) ? cat : "";

  const profiles = await prisma.freelancerProfile.findMany({
    where: { published: true, available: true, ...(category ? { category } : {}) },
    orderBy: [{ ratingCount: "desc" }, { updatedAt: "desc" }],
    take: 60,
    include: { user: { select: { name: true, image: true, city: true, state: true } } },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 text-white p-6 sm:p-8">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-blue-500/15 text-blue-300 border border-blue-400/30">
          Marketplace freelancer
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Contrate um freelancer ou ofereça seus serviços
        </h1>
        <p className="text-white/70 mt-2 max-w-xl text-sm md:text-base">
          De um lado, profissionais prontos para o seu projeto. Do outro, projetos abertos esperando proposta. Tudo dentro da plataforma, sem taxa para começar.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/freelancer/perfil" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-blue-50 transition-colors">
            Sou freelancer, quero oferecer serviços
          </Link>
          <Link href="/projetos" className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
            Preciso contratar, ver projetos abertos
          </Link>
        </div>
      </section>

      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Freelancers disponíveis</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-sm">
            Profissionais disponíveis para o seu projeto.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/projetos/novo" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Publicar projeto
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <Link href="/freelancers" className={`rounded-full px-3 py-1.5 text-sm ${!category ? "bg-blue-600 text-white" : "bg-neutral-100 dark:bg-white/5"}`}>
          Todas
        </Link>
        {FREELANCE_CATEGORIES.map((c) => (
          <Link key={c.value} href={`/freelancers?cat=${c.value}`} className={`rounded-full px-3 py-1.5 text-sm ${category === c.value ? "bg-blue-600 text-white" : "bg-neutral-100 dark:bg-white/5"}`}>
            {c.label}
          </Link>
        ))}
      </div>

      {profiles.length === 0 ? (
        <p className="text-neutral-500 py-12 text-center">Nenhum freelancer nesta categoria ainda.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {profiles.map((p) => {
            const skills = parseSkills(p.skills).slice(0, 4);
            const avg = averageRating(p.ratingSum, p.ratingCount);
            const name = p.user.name ?? "Freelancer";
            const location = [p.user.city, p.user.state].filter(Boolean).join(", ");
            return (
              <Link key={p.id} href={`/freelancers/${p.userId}`} className="block rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-blue-400 transition-colors">
                <div className="flex items-center gap-3">
                  {p.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.user.image} alt={name} className="h-12 w-12 rounded-xl object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center font-bold text-blue-600 dark:text-blue-300">
                      {name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{name}</p>
                    <p className="text-sm text-neutral-500 truncate">{p.headline || categoryLabel(p.category)}</p>
                  </div>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {skills.map((s) => (
                      <span key={s} className="rounded-full bg-neutral-100 dark:bg-white/5 px-2.5 py-0.5 text-xs">{s}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 text-sm">
                  <span className="text-neutral-500">{location || categoryLabel(p.category)}</span>
                  <span className="font-medium">
                    {p.ratingCount > 0 && <span className="text-amber-500 mr-2">★ {avg.toFixed(1)}</span>}
                    {formatCents(p.hourlyRateCents)}{p.hourlyRateCents ? "/h" : ""}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
