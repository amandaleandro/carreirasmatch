import Link from "next/link";
import { Award, Flame, Target, Zap } from "lucide-react";
import {
  getDailyChallenge,
  getGameBadges,
  getGameLevel,
  getGameStreak,
  getLevelProgress,
  type EngagementScore,
} from "@/lib/game-engagement";

export function GamesProgressPanel({ scores, area }: { scores: EngagementScore[]; area: string | null }) {
  const xp = scores.reduce((total, item) => total + Math.max(0, item.score), 0);
  const level = getGameLevel(xp);
  const progress = getLevelProgress(xp);
  const streak = getGameStreak(scores);
  const badges = getGameBadges(scores);
  const challenge = getDailyChallenge(scores);
  const challengePath = challenge.game === "typer" ? "digitar" : challenge.game;

  return (
    <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-[#071827] p-6 text-white shadow-[0_14px_30px_-12px_rgba(7,24,39,0.45)] sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-20 -z-10 h-56 w-56 rounded-full bg-blue-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 -z-10 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">
              <Zap className="h-3.5 w-3.5 text-amber-300" />
              Sua evolução
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Nível {level}</h2>
            <p className="mt-1 text-sm text-slate-300">{area ? `Trilha: ${area}` : "Complete seu perfil para personalizar sua trilha"}</p>
          </div>
          <div className="hidden rounded-2xl border border-white/10 bg-white/10 p-3 sm:block">
            <Zap className="h-6 w-6 text-amber-300" />
          </div>
        </div>

        <div className="mt-7">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Progresso para o próximo nível</span>
            <span className="text-white">{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.06]">
          <div className="px-3 py-3 sm:px-4">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">XP acumulado</p>
            <p className="mt-1 text-base font-bold text-white">{xp}</p>
          </div>
          <div className="px-3 py-3 sm:px-4">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Sequência</p>
            <p className="mt-1 flex items-center gap-1 text-base font-bold text-white"><Flame className="h-3.5 w-3.5 text-orange-300" />{streak} dias</p>
          </div>
          <div className="px-3 py-3 sm:px-4">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Partidas</p>
            <p className="mt-1 text-base font-bold text-white">{scores.length}</p>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[1.75rem] border border-amber-200/80 bg-[#FFF9E8] p-6 shadow-[0_10px_24px_-18px_rgba(146,64,14,0.45)] sm:p-7 dark:border-amber-900/50 dark:bg-amber-950/25">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-200/40 blur-2xl dark:bg-amber-500/10" />
        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">Desafio de hoje</p>
              <h2 className="mt-3 max-w-[18rem] text-xl font-extrabold leading-tight tracking-tight text-amber-950 dark:text-amber-100">{challenge.title}</h2>
            </div>
            <div className="rounded-2xl bg-amber-100 p-2.5 text-amber-500 dark:bg-amber-900/40">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-amber-900/70 dark:text-amber-200/70">Vale <strong>{challenge.reward} XP</strong> para manter sua evolução.</p>
          <Link href={`/jogos/${challengePath}`} className="mt-auto inline-flex w-fit rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-amber-500/20 transition hover:bg-amber-600">
            {challenge.completed ? "Revisar desafio" : "Começar agora"}
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
        <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-sm font-bold"><Award className="h-4 w-4 text-violet-500" />Medalhas da sua jornada</h2><span className="text-[11px] text-neutral-400">Continue jogando para desbloquear</span></div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3 md:grid-cols-4">{(badges.length ? badges : [{ icon: "🔒", label: "Primeira partida", description: "Jogue para desbloquear" }]).map((badge) => <div key={badge.label} className="rounded-2xl bg-neutral-50 p-3 dark:bg-neutral-950"><span className="text-xl">{badge.icon}</span><p className="mt-1 text-xs font-bold">{badge.label}</p><p className="mt-0.5 text-[10px] text-neutral-500">{badge.description}</p></div>)}</div>
      </div>
    </section>
  );
}
