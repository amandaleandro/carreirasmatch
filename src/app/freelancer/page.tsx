import Link from "next/link";
import {
  Briefcase,
  User,
  Send,
  Search,
  FolderKanban,
  Sparkles,
  ArrowRight,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FreelancerHubPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/freelancers");
  }

  const [profile, proposalCount, projectCount] = await Promise.all([
    prisma.freelancerProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.freelanceProposal.count({ where: { freelancerUserId: session.user.id } }),
    prisma.freelanceProject.count({ where: { clientUserId: session.user.id } }),
  ]);

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Briefcase className="w-3.5 h-3.5" />
            Marketplace de Serviços
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Painel do Freelancer
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Ofereça seus serviços profissionais ou contrate especialistas para os seus projetos.
          </p>
        </div>

        <Link
          href="/freelancer/perfil"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 shadow-md shadow-blue-500/20 transition-all shrink-0"
        >
          <User className="w-4 h-4" />
          <span>Meu Perfil Freelancer</span>
        </Link>
      </div>

      {/* Draft Profile Alert */}
      {!profile?.published && (
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <AlertCircle className="w-3.5 h-3.5" /> Perfil em Rascunho
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mt-2">
              Seu perfil ainda não está visível na vitrine pública
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
              Complete seu portfólio, defina o valor por hora e publique seu perfil para receber contatos diretos de clientes.
            </p>
          </div>
          <Link
            href="/freelancer/perfil"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 text-xs sm:text-sm transition-colors shadow-sm shrink-0 w-full sm:w-auto"
          >
            <span>Montar Meu Perfil</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Main Hub Cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        <Link
          href="/freelancer/perfil"
          className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs hover:border-blue-500/60 transition-all duration-200 space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                <User className="w-5 h-5" />
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                  profile?.published
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                }`}
              >
                {profile?.published ? "Publicado" : "Rascunho"}
              </span>
            </div>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              Meu Perfil de Freelancer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Edite sua bio, habilidades, valor hora e links de portfólio exibidos para potenciais clientes.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-blue-600 dark:text-blue-400">
            <span>Editar perfil</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/freelancer/propostas"
          className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs hover:border-blue-500/60 transition-all duration-200 space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Send className="w-5 h-5" />
            </div>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              Minhas Propostas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Você enviou <strong className="text-slate-900 dark:text-white">{proposalCount} proposta(s)</strong> para projetos da comunidade.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-blue-600 dark:text-blue-400">
            <span>Ver propostas</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/freelancers"
          className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs hover:border-blue-500/60 transition-all duration-200 space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Search className="w-5 h-5" />
            </div>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              Vitrine de Freelancers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Explore o diretório de profissionais e encontre parceiros para complementar suas entregas.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-blue-600 dark:text-blue-400">
            <span>Explorar vitrine</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/freelancer/meus-projetos"
          className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs hover:border-blue-500/60 transition-all duration-200 space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <FolderKanban className="w-5 h-5" />
            </div>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              Meus Projetos Publicados
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Você possui <strong className="text-slate-900 dark:text-white">{projectCount} projeto(s)</strong> publicados como contratante.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-blue-600 dark:text-blue-400">
            <span>Gerenciar meus projetos</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </main>
  );
}
