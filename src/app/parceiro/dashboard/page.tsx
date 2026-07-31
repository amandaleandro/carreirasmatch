import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PartnerShell } from "@/components/partner-shell";
import Link from "next/link";
import { BookOpen, Sparkles, Plus, MousePointerClick, Users, Handshake, GraduationCap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PartnerDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.accountType !== "partner" || !session.user.partnerId) {
    redirect("/parceiro/login");
  }

  const partner = await prisma.partner.findUnique({
    where: { id: session.user.partnerId },
  });

  if (!partner) {
    redirect("/parceiro/login");
  }

  const [coursesCount, featuredCount, clicksCount, leadsCount] = await Promise.all([
    prisma.externalCourse.count({ where: { partnerId: partner.id } }),
    prisma.externalCourse.count({ where: { partnerId: partner.id, featured: true } }),
    prisma.partnerCourseClick.count({ where: { partnerId: partner.id } }),
    prisma.partnerLead.count({ where: { partnerId: partner.id } }),
  ]);

  return (
    <PartnerShell partnerName={partner.name} logoUrl={partner.logoUrl} credits={partner.credits}>
      <main className="p-5 md:p-7 space-y-6 max-w-6xl mx-auto font-sans">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Handshake className="w-3.5 h-3.5" />
              Painel do Parceiro
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Olá, {partner.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
              Gerencie a publicação e os destaques dos seus cursos e treinamentos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/parceiro/dashboard/empregabilidade"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <span>Empregabilidade</span>
            </Link>
            <Link
              href="/parceiro/dashboard/leads"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Users className="w-4 h-4 text-blue-500" />
              <span>Ver Leads ({leadsCount})</span>
            </Link>
            <Link
              href="/parceiro/dashboard/cursos"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Curso</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-center justify-between shadow-2xs">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cursos Cadastrados
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{coursesCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-center justify-between shadow-2xs">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cursos em Destaque
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{featuredCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-center justify-between shadow-2xs">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cliques nos Links
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{clicksCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
              <MousePointerClick className="w-5 h-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-center justify-between shadow-2xs">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Leads de Alunos
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{leadsCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* How it works section */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Como funciona o programa de parceiros?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Três passos simples para acelerar suas matrículas:
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-5 space-y-2">
              <div className="h-7 w-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Cadastre seus cursos</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Adicione título, área de atuação, link oficial de inscrição e cupons de desconto.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-5 space-y-2">
              <div className="h-7 w-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Adquira um pacote</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Compre créditos de destaque na aba &quot;Anunciar / Destaques&quot; via Mercado Pago com liberação automática.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-5 space-y-2">
              <div className="h-7 w-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Destaque e receba cliques</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Destaque seus cursos no topo do feed e receba contatos de candidatos interessados.
              </p>
            </div>
          </div>
        </div>
      </main>
    </PartnerShell>
  );
}
