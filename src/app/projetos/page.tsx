import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  FREELANCE_CATEGORIES,
  parseSkills,
  categoryLabel,
  formatBudget,
} from "@/lib/freelance";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projetos freelancer",
  description: "Projetos abertos para freelancers enviarem propostas.",
};

type Props = { searchParams: Promise<{ cat?: string }> };

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 30) return `há ${days} dias`;
  return `há ${Math.floor(days / 30)} mês(es)`;
}

export default async function ProjectsPage({ searchParams }: Props) {
  const { cat } = await searchParams;
  const category = cat && FREELANCE_CATEGORIES.some((c) => c.value === cat) ? cat : "";

  const projects = await prisma.freelanceProject.findMany({
    where: { status: "open", ...(category ? { category } : {}) },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { client: { select: { name: true } } },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Projetos freelancer</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">Envie propostas para projetos abertos.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/freelancers" className="rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-white/5">
            Ver freelancers
          </Link>
          <Link href="/projetos/novo" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Publicar projeto
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <Link href="/projetos" className={`rounded-full px-3 py-1.5 text-sm ${!category ? "bg-blue-600 text-white" : "bg-neutral-100 dark:bg-white/5"}`}>
          Todas
        </Link>
        {FREELANCE_CATEGORIES.map((c) => (
          <Link key={c.value} href={`/projetos?cat=${c.value}`} className={`rounded-full px-3 py-1.5 text-sm ${category === c.value ? "bg-blue-600 text-white" : "bg-neutral-100 dark:bg-white/5"}`}>
            {c.label}
          </Link>
        ))}
      </div>

      {projects.length === 0 ? (
        <p className="text-neutral-500 py-12 text-center">Nenhum projeto aberto nesta categoria ainda.</p>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => {
            const skills = parseSkills(p.skills).slice(0, 6);
            return (
              <Link key={p.id} href={`/projetos/${p.id}`} className="block rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-blue-400 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-lg truncate">{p.title}</h2>
                    <p className="text-sm text-neutral-500 mt-0.5">
                      {p.category ? categoryLabel(p.category) : "Projeto"} · por {p.client.name ?? "Contratante"} · {timeAgo(p.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-semibold">{formatBudget(p.budgetType, p.budgetMinCents, p.budgetMaxCents)}</span>
                    <span className="block text-xs text-neutral-500">{p.proposalCount} proposta(s)</span>
                  </span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2">{p.description}</p>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {skills.map((s) => (
                      <span key={s} className="rounded-full bg-neutral-100 dark:bg-white/5 px-2.5 py-0.5 text-xs">{s}</span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
