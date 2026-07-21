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
    "block rounded-3xl border border-[#E2E8F0] dark:border-neutral-850 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-md hover:border-[#64748B]/30 transition-all space-y-3";

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-5 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-neutral-800 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/15">
            Área de Serviços
          </span>
          <h1 className="text-xl md:text-2xl font-title font-bold text-[#071827] dark:text-white mt-1">Freelancer</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Ofereça seus serviços ou contrate profissionais para os seus projetos.
          </p>
        </div>
      </div>

      {!profile?.published && (
        <div className="rounded-3xl border border-[#2563EB]/25 bg-gradient-to-r from-[#2563EB]/5 to-indigo-500/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#2563EB]/15 text-[#2563EB]">
              📢 Perfil em Rascunho
            </span>
            <p className="font-bold text-sm text-[#071827] mt-1.5">Seu perfil ainda não está publicado</p>
            <p className="text-xs text-[#64748B]">
              Monte e publique seu perfil freelancer para aparecer na vitrine pública e receber convites.
            </p>
          </div>
          <Link
            href="/freelancer/perfil"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold px-4 py-2.5 shadow-sm transition-all shrink-0 cursor-pointer w-full sm:w-auto justify-center active:scale-[0.98]"
          >
            Montar meu perfil
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/freelancer/perfil" className={cardClass}>
          <div className="h-10 w-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center text-lg font-bold shrink-0">
            👤
          </div>
          <h3 className="font-bold text-sm text-[#071827] dark:text-white mt-3">Meu perfil</h3>
          <p className="text-xs text-[#64748B] mt-1">
            Status: {profile?.published ? <span className="text-emerald-600 font-bold">Publicado</span> : <span className="text-amber-500 font-bold">Rascunho</span>} · Clique para editar sua vitrine.
          </p>
        </Link>

        <Link href="/freelancer/propostas" className={cardClass}>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-lg font-bold shrink-0">
            📨
          </div>
          <h3 className="font-bold text-sm text-[#071827] dark:text-white mt-3">Minhas propostas</h3>
          <p className="text-xs text-[#64748B] mt-1">
            Você enviou <span className="font-bold text-neutral-800 dark:text-white">{proposalCount} proposta(s)</span> até o momento.
          </p>
        </Link>

        <Link href="/freelancers" className={cardClass}>
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center text-lg font-bold shrink-0">
            🔎
          </div>
          <h3 className="font-bold text-sm text-[#071827] dark:text-white mt-3">Buscar freelancers</h3>
          <p className="text-xs text-[#64748B] mt-1">
            Explore a vitrine de outros freelancers e encontre parceiros.
          </p>
        </Link>

        <Link href="/freelancer/meus-projetos" className={cardClass}>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg font-bold shrink-0">
            📁
          </div>
          <h3 className="font-bold text-sm text-[#071827] dark:text-white mt-3">Projetos que publiquei</h3>
          <p className="text-xs text-[#64748B] mt-1">
            Você tem <span className="font-bold text-neutral-800 dark:text-white">{projectCount} projeto(s)</span> publicados como cliente.
          </p>
        </Link>
      </div>
    </div>
  );
}
