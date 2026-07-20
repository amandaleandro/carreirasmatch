import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ContentPage } from "@/components/content-page";
import { AllJobsList } from "@/app/feed/AllJobsList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Todas as vagas",
  description:
    "Explore todas as vagas coletadas pelo CarreirasMatch. Crie sua conta grátis para ver a lista completa e receber as vagas que combinam com você.",
};

/** Quantas vagas o visitante deslogado consegue "espiar" antes do bloqueio. */
const PREVIEW_VISIBLE = 6;
/** Cards borrados atrás do overlay, só para dar a sensação de que há mais. */
const PREVIEW_TEASER = 3;

export default async function AllJobsPage() {
  const session = await auth();

  // Quem já tem conta vai direto para o feed real (personalizado quando há currículo).
  if (session?.user?.id) redirect("/feed");

  const [totalJobs, jobs] = await Promise.all([
    prisma.job.count({ where: { active: true } }),
    prisma.job.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: PREVIEW_VISIBLE + PREVIEW_TEASER,
      select: {
        id: true,
        jobTitle: true,
        jobText: true,
        url: true,
        source: true,
        location: true,
      },
    }),
  ]);

  const visible = jobs.slice(0, PREVIEW_VISIBLE);
  const teaser = jobs.slice(PREVIEW_VISIBLE);
  const remaining = Math.max(0, totalJobs - visible.length);

  return (
    <ContentPage
      eyebrow="Banco completo de vagas"
      title="Todas as vagas"
      description={`São ${totalJobs.toLocaleString("pt-BR")} vagas ativas coletadas de várias fontes. Veja uma amostra abaixo e crie sua conta grátis para desbloquear a lista completa.`}
      wide
    >
      <AllJobsList jobs={visible} />

      {teaser.length > 0 && (
        <div className="relative mt-4">
          <div className="pointer-events-none select-none blur-sm" aria-hidden>
            <AllJobsList jobs={teaser} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white dark:via-neutral-950/70 dark:to-neutral-950" />
        </div>
      )}

      <div className="mt-2 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-6 text-center">
        <p className="text-lg font-bold">
          {remaining > 0
            ? `Mais ${remaining.toLocaleString("pt-BR")} vagas esperando por você`
            : "Desbloqueie a lista completa"}
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-lg mx-auto">
          Crie sua conta grátis para ver todas as vagas, salvar as favoritas e
          receber as que mais combinam com o seu currículo.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href="/register"
            className="rounded-xl bg-blue-600 text-white font-semibold px-6 py-2.5 hover:bg-blue-700 transition-colors"
          >
            Criar conta grátis
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 font-semibold px-6 py-2.5 hover:bg-white dark:hover:bg-neutral-900 transition-colors"
          >
            Já tenho conta
          </Link>
        </div>
      </div>
    </ContentPage>
  );
}
