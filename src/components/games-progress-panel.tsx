import Link from "next/link";
import { Award, Flame, Target, Zap } from "lucide-react";
import { getDailyChallenge, getGameBadges, getGameLevel, getGameStreak, getLevelProgress, type EngagementScore } from "@/lib/game-engagement";

export function GamesProgressPanel({ scores, area }: { scores: EngagementScore[]; area: string | null }) {
  const xp = scores.reduce((total, item) => total + Math.max(0, item.score), 0);
  const level = getGameLevel(xp);
  const progress = getLevelProgress(xp);
  const streak = getGameStreak(scores);
  const badges = getGameBadges(scores);
  const challenge = getDailyChallenge(scores);
  const challengePath = challenge.game === "typer" ? "digitar" : challenge.game;

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-3xl bg-gradient-to-br from-[#071827] via-[#101d42] to-[#312e81] p-5 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Sua evolução</p><h2 className="mt-1 text-2xl font-bold">Nível {level}</h2><p className="mt-1 text-xs text-blue-100/75">{area ? `Treinando para ${area}` : "Complete seu perfil para personalizar ainda mais"}</p></div><div className="rounded-2xl bg-white/10 p-3"><Zap className="h-5 w-5 text-amber-300" /></div></div>
        <div className="mt-5 flex items-center justify-between text-[11px] font-bold text-blue-100/80"><span>Próximo nível</span><span>{progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400" style={{ width: `${progress}%` }} /></div>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold"><span className="rounded-full bg-white/10 px-3 py-1.5">{xp} XP acumulado</span><span className="rounded-full bg-orange-400/20 px-3 py-1.5 text-orange-200"><Flame className="mr-1 inline h-3.5 w-3.5" />{streak} dias</span><span className="rounded-full bg-white/10 px-3 py-1.5">{scores.length} partidas</span></div>
      </div>
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">Desafio de hoje</p><h2 className="mt-1 text-lg font-bold text-amber-950 dark:text-amber-100">{challenge.title}</h2></div><Target className="h-5 w-5 text-amber-500" /></div><p className="mt-2 text-xs leading-relaxed text-amber-900/70 dark:text-amber-200/70">Vale <strong>{challenge.reward} XP</strong> para manter sua evolução.</p><Link href={`/jogos/${challengePath}`} className="mt-4 inline-flex rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-600">{challenge.completed ? "Revisar desafio" : "Começar agora"}</Link></div>
      <div className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2"><div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-sm font-bold"><Award className="h-4 w-4 text-violet-500" />Medalhas da sua jornada</h2><span className="text-[11px] text-neutral-400">Continue jogando para desbloquear</span></div><div className="mt-4 grid gap-2 sm:grid-cols-3 md:grid-cols-4">{(badges.length ? badges : [{ icon: "🔒", label: "Primeira partida", description: "Jogue para desbloquear" }]).map((badge) => <div key={badge.label} className="rounded-2xl bg-neutral-50 p-3 dark:bg-neutral-950"><span className="text-xl">{badge.icon}</span><p className="mt-1 text-xs font-bold">{badge.label}</p><p className="mt-0.5 text-[10px] text-neutral-500">{badge.description}</p></div>)}</div></div>
    </section>
  );
}
