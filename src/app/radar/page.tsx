import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { JobAlertManager } from "@/components/job-alert-manager";

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
    <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 w-full space-y-6">
      <header className="border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
          Personalize sua busca
        </span>
        <h1 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">Alertas de vagas</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          Crie alertas por cargo e localização para receber um resumo das novas oportunidades sem precisar procurar todos os dias.
        </p>
      </header>

      <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-900 dark:bg-blue-950/20">
        <div className="grid gap-4 text-sm sm:grid-cols-3">
          <div><p className="font-semibold text-blue-950 dark:text-blue-100">1. Defina o foco</p><p className="mt-1 text-blue-900/70 dark:text-blue-200/70">Informe cargo, cidade ou estado.</p></div>
          <div><p className="font-semibold text-blue-950 dark:text-blue-100">2. Escolha a frequência</p><p className="mt-1 text-blue-900/70 dark:text-blue-200/70">Receba um resumo diário ou semanal.</p></div>
          <div><p className="font-semibold text-blue-950 dark:text-blue-100">3. Acompanhe no feed</p><p className="mt-1 text-blue-900/70 dark:text-blue-200/70">Use o feed para analisar e salvar as vagas.</p></div>
        </div>
      </section>

      <JobAlertManager initialAlerts={alerts} />

      <section className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-semibold">Quer procurar agora?</h2>
          <p className="mt-1 text-sm text-neutral-500">Veja as vagas atuais e compare a aderência ao seu perfil.</p>
        </div>
        <Link href="/feed" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Abrir feed de vagas</Link>
      </section>
    </main>
  );
}
