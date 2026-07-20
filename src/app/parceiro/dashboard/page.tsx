import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PartnerShell } from "@/components/partner-shell";
import Link from "next/link";
import { BookOpen, Sparkles, Plus, MousePointerClick, Users } from "lucide-react";

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
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Olá, {partner.name}
            </h1>
            <p className="text-neutral-500 mt-1">
              Bem-vindo ao seu painel de parceiro. Publique e destaque seus cursos.
            </p>
          </div>
          <div className="flex gap-2.5">
            <Link
              href="/parceiro/dashboard/leads"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-5 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200 shadow-sm hover:bg-neutral-50 dark:hover:bg-white/[0.03] transition-colors"
            >
              <Users className="h-4 w-4" />
              Ver Leads
            </Link>
            <Link
              href="/parceiro/dashboard/cursos"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/10 hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Cadastrar Curso
            </Link>
          </div>
        </header>

        {/* Estatísticas */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex items-center gap-5 shadow-sm">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/50 p-3.5 text-blue-600 dark:text-blue-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Cursos Online</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-0.5">{coursesCount}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex items-center gap-5 shadow-sm">
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/50 p-3.5 text-amber-600 dark:text-amber-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Destacados</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-0.5">{featuredCount}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex items-center gap-5 shadow-sm">
            <div className="rounded-xl bg-purple-50 dark:bg-purple-950/50 p-3.5 text-purple-600 dark:text-purple-400">
              <MousePointerClick className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Cliques nos Links</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-0.5">{clicksCount}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex items-center gap-5 shadow-sm">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 p-3.5 text-emerald-600 dark:text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Leads de Alunos</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-0.5">{leadsCount}</p>
            </div>
          </div>
        </div>

        {/* Primeiros passos */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 md:p-8">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Como funciona o programa de parceiros?</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-semibold text-neutral-950 dark:text-white">Cadastre seus cursos</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Adicione as informações básicas como título, área de atuação, link oficial de inscrição, cupons de desconto e modalidade.
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-semibold text-neutral-950 dark:text-white">Adquira um pacote</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Compre créditos de destaque na aba "Destaques & Planos" via Mercado Pago com liberação automática.
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-semibold text-neutral-950 dark:text-white">Destaque e receba cliques</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Destaque seus cursos para colocá-los no topo das buscas dos candidatos e receba leads qualificados diretamente no seu painel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PartnerShell>
  );
}
