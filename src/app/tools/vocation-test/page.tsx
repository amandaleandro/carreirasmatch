import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { VOCATION_AREAS } from "@/lib/vocation-areas";
import { getAreaOfTheDayExplanation } from "@/lib/area-of-the-day";

export default async function VocationTestHubPage() {
  const session = await auth();

  const results = session?.user?.id
    ? await prisma.vocationTestResult.findMany({
        where: { userId: session.user.id },
        select: { areaSlug: true },
      })
    : [];
  const testedSlugs = new Set(results.map((r) => r.areaSlug));

  let areaOfTheDay: Awaited<ReturnType<typeof getAreaOfTheDayExplanation>> | null = null;
  try {
    areaOfTheDay = await getAreaOfTheDayExplanation();
  } catch (error) {
    console.error("Erro ao gerar área do dia:", error);
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 w-full">
      <Link href="/tools" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar para ferramentas
      </Link>
      <header className="mt-4 mb-10">
        <span className="inline-block text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-full px-2.5 py-1 mb-3">
          Gratuito · para estudantes do ensino médio
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Teste vocacional</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Escolha por onde começar: descubra sua área, escolha o caminho dentro de uma área
          que já conhece, ou vá direto para a especialização se já faz faculdade.
        </p>
        <Link
          href="/tools/vocation-test/exam-archive"
          className="inline-block mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Ver provas anteriores do ENEM, ITA e UFSC →
        </Link>
      </header>

      <section className="mb-10 grid sm:grid-cols-2 gap-4">
        <Link
          href="/tools/vocation-test/discover"
          className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-blue-500 transition-colors"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Etapa 1
          </span>
          <h2 className="font-semibold mt-1 mb-1.5">Ainda não sei minha área</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Responda um quiz rápido e descubra quais áreas combinam com você, e se o caminho é
            faculdade, técnico, ou os dois.
          </p>
        </Link>
        <Link
          href="/tools/vocation-test/college"
          className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-blue-500 transition-colors"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Já na faculdade
          </span>
          <h2 className="font-semibold mt-1 mb-1.5">Já faço faculdade</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Você já escolheu seu curso — vá direto para descobrir sua especialização dentro
            dele.
          </p>
        </Link>
      </section>

      {areaOfTheDay && (
        <section className="mb-10 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Área do dia
            </span>
            <span className="text-xs rounded-full px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
              {areaOfTheDay.area.label}
            </span>
          </div>
          <div className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            <p>{areaOfTheDay.explanation.whatItIs}</p>
            <p>
              <span className="font-medium">Rotina: </span>
              {areaOfTheDay.explanation.dailyRoutine}
            </p>
            <p>
              <span className="font-medium">Faculdade x técnico: </span>
              {areaOfTheDay.explanation.educationPath}
            </p>
            <p>
              <span className="font-medium">Mercado: </span>
              {areaOfTheDay.explanation.marketOutlook}
            </p>
            <p className="italic text-neutral-500 dark:text-neutral-400">
              {areaOfTheDay.explanation.funFact}
            </p>
          </div>
          <Link
            href={`/tools/vocation-test/${areaOfTheDay.area.slug}`}
            className="inline-block mt-3 text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline"
          >
            Fazer o teste de {areaOfTheDay.area.label} →
          </Link>
        </section>
      )}

      <div className="mb-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Etapa 2
        </span>
        <h2 className="font-semibold mt-1">
          Já sei minha área, quero saber meu caminho dentro dela
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {VOCATION_AREAS.map((area) => (
          <Link
            key={area.slug}
            href={`/tools/vocation-test/${area.slug}`}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-blue-500 transition-colors"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <h2 className="font-semibold">{area.label}</h2>
              {testedSlugs.has(area.slug) && (
                <span className="text-xs rounded-full px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 shrink-0">
                  Já testado
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{area.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
