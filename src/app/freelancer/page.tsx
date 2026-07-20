import Link from "next/link";
import { requireAuthPage } from "@/lib/require-auth-page";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FreelancerHubPage() {
  const session = await requireAuthPage();

  const [profile, proposalCount, projectCount] = await Promise.all([
    prisma.freelancerProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.freelanceProposal.count({ where: { freelancerUserId: session.user.id } }),
    prisma.freelanceProject.count({ where: { clientUserId: session.user.id } }),
  ]);

  const cardClass =
    "block rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 hover:border-blue-400 transition-colors";

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-8">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Freelancer</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Ofereça seus serviços ou contrate profissionais para os seus projetos.
        </p>
      </header>

      {!profile?.published && (
        <div className="rounded-2xl border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 p-5">
          <p className="font-semibold">Seu perfil ainda não está publicado</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Publique um perfil para aparecer na vitrine e receber projetos.
          </p>
          <Link href="/freelancer/perfil" className="inline-block mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Montar meu perfil
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/freelancer/perfil" className={cardClass}>
          <p className="text-2xl">👤</p>
          <p className="font-semibold mt-2">Meu perfil</p>
          <p className="text-sm text-neutral-500 mt-1">
            {profile?.published ? "Publicado" : "Rascunho"} · edite sua vitrine
          </p>
        </Link>

        <Link href="/freelancer/propostas" className={cardClass}>
          <p className="text-2xl">📨</p>
          <p className="font-semibold mt-2">Minhas propostas</p>
          <p className="text-sm text-neutral-500 mt-1">{proposalCount} enviada(s)</p>
        </Link>

        <Link href="/projetos" className={cardClass}>
          <p className="text-2xl">🔎</p>
          <p className="font-semibold mt-2">Buscar projetos</p>
          <p className="text-sm text-neutral-500 mt-1">Encontre trabalhos para propor</p>
        </Link>

        <Link href="/freelancer/meus-projetos" className={cardClass}>
          <p className="text-2xl">📁</p>
          <p className="font-semibold mt-2">Projetos que publiquei</p>
          <p className="text-sm text-neutral-500 mt-1">{projectCount} projeto(s)</p>
        </Link>
      </div>
    </div>
  );
}
