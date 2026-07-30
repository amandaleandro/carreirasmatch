import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { JobAlertManager } from "@/components/job-alert-manager";
import { ArrowLeft, Radar, Search, Bell, Rss } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RadarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const alerts = await prisma.jobAlert.findMany({
    where: { userId: session.user.id, active: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, query: true, city: true, state: true, frequency: true },
  });

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 w-full space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Painel</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
          <Radar className="w-3.5 h-3.5 text-slate-500" />
          <span>Radar de Oportunidades</span>
        </span>
      </div>

      {/* Header Section */}
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Alertas de Vagas
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
          Crie monitoramentos inteligentes por cargo e localização para receber resumos das novas oportunidades direto no seu e-mail.
        </p>
      </header>

      {/* How it works Card */}
      <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-6 shadow-sm">
        <div className="grid gap-6 text-sm sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">1. Defina o Foco</p>
              <p className="mt-1 text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Informe cargo, palavra-chave, cidade ou UF.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">2. Frequência</p>
              <p className="mt-1 text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Receba um resumo consolidado diário ou semanal.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm shrink-0">
              <Rss className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">3. Direct no Feed</p>
              <p className="mt-1 text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Acompanhe e analise no feed sempre que quiser.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Alert Manager Component */}
      <JobAlertManager initialAlerts={alerts} />

      {/* Bottom Callout */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">Quer buscar vagas agora?</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">Explore as vagas disponíveis em tempo real e meça seu score de aderência.</p>
        </div>
        <Link
          href="/feed"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-2.5 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm shrink-0"
        >
          Abrir Feed de Vagas
        </Link>
      </section>
    </main>
  );
}
