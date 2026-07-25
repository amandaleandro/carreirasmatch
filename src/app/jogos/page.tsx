import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import Link from "next/link";
import { Sparkles, Keyboard, Trophy, Brain, Flame, Calendar, CalendarDays, Type, Skull, Scale, ListOrdered, Search, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { GamesCatalog } from "@/components/games-catalog";

export const dynamic = "force-dynamic";

const RANKING_OPTIONS = [
  { id: "global", label: "🌟 Rank Global (XP Total)" },
  { id: "dilemas", label: "🎭 Simulador de Dilemas" },
  { id: "inbox", label: "⚡ Inbox Zero" },
  { id: "duelo", label: "⚔️ Batalha 1v1" },
  { id: "typer", label: "Speed Typer" },
  { id: "quiz", label: "Show do Match" },
  { id: "memory", label: "Termos Pareados" },
  { id: "termo", label: "Termo" },
  { id: "forca", label: "Forca Profissional" },
  { id: "vf", label: "Verdadeiro ou Falso" },
  { id: "ordenar", label: "Ordene o Processo" },
  { id: "cacapalavras", label: "Caça-Palavras" },
  { id: "curriculo", label: "Monte o Currículo" },
] as const;

export default async function GamesHubPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string }>;
}) {
  const { game: gameParam } = await searchParams;
  const selectedGame = RANKING_OPTIONS.some((g) => g.id === gameParam) ? gameParam! : RANKING_OPTIONS[0].id;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  async function topScoresByUser(since: Date) {
    const isGlobal = selectedGame === "global";
    const whereCondition = {
      createdAt: { gte: since },
      ...(isGlobal ? {} : { game: selectedGame }),
    };

    if (isGlobal) {
      const grouped = await prisma.gameScore.groupBy({
        by: ["userId"],
        where: whereCondition,
        _sum: { score: true },
        orderBy: { _sum: { score: "desc" } },
        take: 10,
      });

      const users = await prisma.user.findMany({
        where: { id: { in: grouped.map((g) => g.userId) } },
        select: { id: true, name: true },
      });
      const nameById = new Map(users.map((u) => [u.id, u.name]));

      return grouped.map((g) => ({
        id: g.userId,
        score: g._sum.score ?? 0,
        user: { name: nameById.get(g.userId) ?? null },
      }));
    }

    const grouped = await prisma.gameScore.groupBy({
      by: ["userId"],
      where: whereCondition,
      _max: { score: true },
      orderBy: { _max: { score: "desc" } },
      take: 10,
    });

    const users = await prisma.user.findMany({
      where: { id: { in: grouped.map((g) => g.userId) } },
      select: { id: true, name: true },
    });
    const nameById = new Map(users.map((u) => [u.id, u.name]));

    return grouped.map((g) => ({
      id: g.userId,
      score: g._max.score ?? 0,
      user: { name: nameById.get(g.userId) ?? null },
    }));
  }

  const [dailyRank, monthlyRank, yearlyRank] = await Promise.all([
    topScoresByUser(startOfDay),
    topScoresByUser(startOfMonth),
    topScoresByUser(startOfYear),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50 font-sans">
      <PublicSiteHeader />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-8 space-y-12">
        
        {/* Cabeçalho Premium */}
        <header className="text-center max-w-2xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
            <Trophy className="h-3 w-3" />
            Playground CarreirasMatch
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#071827] dark:text-white leading-tight">
            Divirta-se e treine suas habilidades
          </h1>
          <p className="text-[#64748B] text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
            Escolha um jogo educativo abaixo para testar seus conhecimentos profissionais, treinar sua agilidade e melhorar seu currículo de forma lúdica.
          </p>
        </header>

        {/* Banner Ensino Médio & Faculdade vs Técnico */}
        <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white rounded-3xl p-6 md:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-200">
              <Brain className="h-3.5 w-3.5" />
              Novo Módulo de Estudo
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold">
              Ensino Médio, ENEM & Escolha de Faculdade vs Técnico
            </h2>
            <p className="text-xs md:text-sm text-blue-100 leading-relaxed">
              Estude todas as matérias com resumos, quizzes e flashcards gerados por IA Gemini, e conecte seus pontos fortes com cursos técnicos e faculdades.
            </p>
          </div>

          <Link
            href="/ensino-medio"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-blue-50 text-blue-950 font-black text-xs md:text-sm shadow-md transition-all shrink-0 active:scale-95"
          >
            Acessar Ensino Médio
          </Link>
        </section>

        {/* Catálogo de Jogos Segmentado por Trilha & Área */}
        <GamesCatalog />

        {/* Seção de Rankings */}
        <section className="space-y-6 pt-8 border-t border-[#E2E8F0] dark:border-neutral-800">
          <header className="text-center max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-[#071827] dark:text-white flex items-center justify-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500 fill-amber-500" />
              Tabela de Líderes
            </h2>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Candidatos no Top 10 mensal ganham selo especial e recomendações premium no dashboard corporativo.
            </p>
          </header>

          <div className="flex flex-wrap justify-center gap-2">
            {RANKING_OPTIONS.map((g) => (
              <Link
                key={g.id}
                href={`/jogos?game=${g.id}#rankings`}
                className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold border transition-all ${
                  selectedGame === g.id
                    ? "bg-[#2563EB] border-[#2563EB] text-white shadow-sm"
                    : "bg-white dark:bg-neutral-900/40 border-[#E2E8F0] dark:border-neutral-800 text-[#64748B] hover:border-[#2563EB]/50"
                }`}
              >
                {g.label}
              </Link>
            ))}
          </div>

          <div id="rankings" className="grid gap-4 md:grid-cols-3">
            {/* Diário */}
            <div className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-850 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
              <h3 className="font-bold text-xs text-[#071827] dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-850 pb-2.5 uppercase tracking-wider">
                <Flame className="h-4 w-4 text-orange-500" />
                Top 10 do Dia
              </h3>
              {dailyRank.length === 0 ? (
                <p className="text-xs text-[#64748B]/60 text-center py-4">Ainda sem pontuações hoje.</p>
              ) : (
                <ol className="space-y-2 text-xs">
                  {dailyRank.map((r, index) => (
                    <li key={r.id} className="flex justify-between items-center bg-[#F8FAFC]/50 dark:bg-neutral-950 px-2.5 py-2 rounded-xl border border-neutral-100/50 dark:border-neutral-800/50">
                      <span className="font-bold text-[#64748B]">#{index + 1} {r.user.name}</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{r.score} pts</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Mensal */}
            <div className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-850 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
              <h3 className="font-bold text-xs text-[#071827] dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-850 pb-2.5 uppercase tracking-wider">
                <Calendar className="h-4 w-4 text-blue-500" />
                Top 10 do Mês
              </h3>
              {monthlyRank.length === 0 ? (
                <p className="text-xs text-[#64748B]/60 text-center py-4">Ainda sem pontuações este mês.</p>
              ) : (
                <ol className="space-y-2 text-xs">
                  {monthlyRank.map((r, index) => (
                    <li key={r.id} className="flex justify-between items-center bg-[#F8FAFC]/50 dark:bg-neutral-950 px-2.5 py-2 rounded-xl border border-neutral-100/50 dark:border-neutral-800/50">
                      <span className="font-bold text-[#64748B]">#{index + 1} {r.user.name}</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{r.score} pts</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Anual */}
            <div className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-850 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
              <h3 className="font-bold text-xs text-[#071827] dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-850 pb-2.5 uppercase tracking-wider">
                <CalendarDays className="h-4 w-4 text-purple-500" />
                Top 10 do Ano
              </h3>
              {yearlyRank.length === 0 ? (
                <p className="text-xs text-[#64748B]/60 text-center py-4">Ainda sem pontuações este ano.</p>
              ) : (
                <ol className="space-y-2 text-xs">
                  {yearlyRank.map((r, index) => (
                    <li key={r.id} className="flex justify-between items-center bg-[#F8FAFC]/50 dark:bg-neutral-950 px-2.5 py-2 rounded-xl border border-neutral-100/50 dark:border-neutral-800/50">
                      <span className="font-bold text-[#64748B]">#{index + 1} {r.user.name}</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{r.score} pts</span>
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
