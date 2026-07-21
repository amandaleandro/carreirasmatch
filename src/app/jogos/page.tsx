import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import Link from "next/link";
import { Sparkles, Keyboard, Trophy, Brain, Flame, Calendar, CalendarDays, Type, Skull, Scale, ListOrdered } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function GamesHubPage() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [dailyRank, monthlyRank, yearlyRank] = await Promise.all([
    prisma.gameScore.findMany({
      where: { createdAt: { gte: startOfDay } },
      orderBy: { score: "desc" },
      take: 10,
      include: { user: { select: { name: true } } },
    }),
    prisma.gameScore.findMany({
      where: { createdAt: { gte: startOfMonth } },
      orderBy: { score: "desc" },
      take: 10,
      include: { user: { select: { name: true } } },
    }),
    prisma.gameScore.findMany({
      where: { createdAt: { gte: startOfYear } },
      orderBy: { score: "desc" },
      take: 10,
      include: { user: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50">
      <PublicSiteHeader />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-12 space-y-16">
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 px-3 py-1 text-xs font-bold border border-blue-200 dark:border-blue-900/50">
            <Trophy className="h-3.5 w-3.5" />
            CarreirasMatch Playground
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500 dark:from-blue-400 dark:to-amber-400 py-1 leading-tight">
            Divirta-se e Treine Suas Habilidades
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base leading-relaxed">
            Escolha um jogo educativo abaixo para testar seus conhecimentos profissionais, treinar sua agilidade e melhorar seu currículo de forma lúdica.
          </p>
        </header>

        {/* Grid de Seleção de Jogos */}
        <section className="grid gap-6 md:grid-cols-3">
          {/* Card Jogo 1: Speed Typer */}
          <div className="group rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] dark:opacity-[0.04] group-hover:scale-110 transition-transform">
              <Keyboard className="w-40 h-40" />
            </div>
            <div className="space-y-4 relative">
              <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/50 p-3.5 text-blue-600 dark:text-blue-400 w-fit">
                <Keyboard className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Speed Typer
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed">
                Treine sua velocidade de digitação! Escreva snippets de código, e-mails corporativos, termos técnicos ou textos publicitários contra o relógio e meça seu WPM.
              </p>
            </div>
            <Link
              href="/jogos/digitar"
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-all text-center"
            >
              Jogar Agora
            </Link>
          </div>

          {/* Card Jogo 2: Show do Match */}
          <div className="group rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] dark:opacity-[0.04] group-hover:scale-110 transition-transform">
              <Sparkles className="w-40 h-40" />
            </div>
            <div className="space-y-4 relative">
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/50 p-3.5 text-amber-600 dark:text-amber-400 w-fit">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Show do Match (Quiz)
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed">
                O quiz definitivo de carreira e conhecimentos específicos de mercado. Responda perguntas rápidas sobre Tecnologia, Gestão, Marketing, Design ou Saúde!
              </p>
            </div>
            <Link
              href="/jogos/quiz"
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-all text-center"
            >
              Jogar Agora
            </Link>
          </div>

          {/* Card Jogo 3: Jogo da Memória */}
          <div className="group rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] dark:opacity-[0.04] group-hover:scale-110 transition-transform">
              <Brain className="w-40 h-40" />
            </div>
            <div className="space-y-4 relative">
              <div className="rounded-2xl bg-purple-50 dark:bg-purple-950/50 p-3.5 text-purple-600 dark:text-purple-400 w-fit">
                <Brain className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Termos Pareados (Memória)
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed">
                Aprimore seu vocabulário corporativo pareando siglas, conceitos e ferramentas técnicas do seu campo profissional no menor tempo possível.
              </p>
            </div>
            <Link
              href="/jogos/memoria"
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-all text-center"
            >
              Jogar Agora
            </Link>
          </div>

          {/* Card Jogo 4: Termo */}
          <div className="group rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] dark:opacity-[0.04] group-hover:scale-110 transition-transform">
              <Type className="w-40 h-40" />
            </div>
            <div className="space-y-4 relative">
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 p-3.5 text-emerald-600 dark:text-emerald-400 w-fit">
                <Type className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Termo</h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed">
                Adivinhe a palavra profissional de 5 letras em até 6 tentativas, com pistas de cores. Quanto menos tentativas, mais pontos.
              </p>
            </div>
            <Link href="/jogos/termo" className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-all text-center">
              Jogar Agora
            </Link>
          </div>

          {/* Card Jogo 5: Forca */}
          <div className="group rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] dark:opacity-[0.04] group-hover:scale-110 transition-transform">
              <Skull className="w-40 h-40" />
            </div>
            <div className="space-y-4 relative">
              <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/50 p-3.5 text-rose-600 dark:text-rose-400 w-fit">
                <Skull className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Forca Profissional</h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed">
                Descubra termos de carreira e tecnologia letra por letra, guiado por dicas. Erre pouco para pontuar mais em cada palavra.
              </p>
            </div>
            <Link href="/jogos/forca" className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-all text-center">
              Jogar Agora
            </Link>
          </div>

          {/* Card Jogo 6: Verdadeiro ou Falso */}
          <div className="group rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] dark:opacity-[0.04] group-hover:scale-110 transition-transform">
              <Scale className="w-40 h-40" />
            </div>
            <div className="space-y-4 relative">
              <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 p-3.5 text-indigo-600 dark:text-indigo-400 w-fit">
                <Scale className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Verdadeiro ou Falso</h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed">
                Enxurrada de afirmações sobre carreira e mercado contra o relógio. Acerte em sequência para multiplicar sua pontuação.
              </p>
            </div>
            <Link href="/jogos/vf" className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-all text-center">
              Jogar Agora
            </Link>
          </div>

          {/* Card Jogo 7: Ordene o Processo */}
          <div className="group rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] dark:opacity-[0.04] group-hover:scale-110 transition-transform">
              <ListOrdered className="w-40 h-40" />
            </div>
            <div className="space-y-4 relative">
              <div className="rounded-2xl bg-teal-50 dark:bg-teal-950/50 p-3.5 text-teal-600 dark:text-teal-400 w-fit">
                <ListOrdered className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Ordene o Processo</h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed">
                Receba as etapas embaralhadas de um processo real (projeto, contratação, vendas) e as coloque na ordem certa.
              </p>
            </div>
            <Link href="/jogos/ordenar" className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-all text-center">
              Jogar Agora
            </Link>
          </div>
        </section>

        {/* Seção de Rankings */}
        <section className="space-y-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <header className="text-center max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500 fill-amber-500" />
              Tabela de Líderes
            </h2>
            <p className="text-xs text-neutral-500">
              Candidatos no Top 10 mensal ganham selo especial e recomendações premium no dashboard corporativo.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Diário */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 space-y-4">
              <h3 className="font-bold text-sm text-neutral-950 dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <Flame className="h-4 w-4 text-orange-500" />
                Top 10 do Dia
              </h3>
              {dailyRank.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-4">Ainda sem pontuações hoje.</p>
              ) : (
                <ol className="space-y-2 text-xs">
                  {dailyRank.map((r, index) => (
                    <li key={r.id} className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-950 p-2 rounded-lg">
                      <span className="font-semibold text-neutral-500">#{index + 1} {r.user.name}</span>
                      <span className="font-bold text-blue-600">{r.score} pts</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Mensal */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 space-y-4">
              <h3 className="font-bold text-sm text-neutral-950 dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Top 10 do Mês
              </h3>
              {monthlyRank.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-4">Ainda sem pontuações este mês.</p>
              ) : (
                <ol className="space-y-2 text-xs">
                  {monthlyRank.map((r, index) => (
                    <li key={r.id} className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-950 p-2 rounded-lg">
                      <span className="font-semibold text-neutral-500">#{index + 1} {r.user.name}</span>
                      <span className="font-bold text-blue-600">{r.score} pts</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Anual */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 space-y-4">
              <h3 className="font-bold text-sm text-neutral-950 dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <CalendarDays className="h-4 w-4 text-purple-500" />
                Top 10 do Ano
              </h3>
              {yearlyRank.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-4">Ainda sem pontuações este ano.</p>
              ) : (
                <ol className="space-y-2 text-xs">
                  {yearlyRank.map((r, index) => (
                    <li key={r.id} className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-950 p-2 rounded-lg">
                      <span className="font-semibold text-neutral-500">#{index + 1} {r.user.name}</span>
                      <span className="font-bold text-blue-600">{r.score} pts</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
