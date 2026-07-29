"use client";

import { useState, useEffect } from "react";
import {
  getGamificationState,
  calculateLevel,
  claimQuestReward,
  DailyQuest,
} from "@/lib/gamification";
import { Flame, Trophy, CheckCircle, Sparkles, Award } from "lucide-react";

export function DailyQuestsCard() {
  const [mounted, setMounted] = useState(false);
  const [totalXp, setTotalXp] = useState(450);
  const [streakDays, setStreakDays] = useState(4);
  const [quests, setQuests] = useState<DailyQuest[]>([]);

  useEffect(() => {
    queueMicrotask(() => {
      const state = getGamificationState();
      setTotalXp(state.totalXp);
      setStreakDays(state.streakDays);
      setQuests(state.quests);
      setMounted(true);
    });
  }, []);

  if (!mounted) return null;

  const levelInfo = calculateLevel(totalXp);

  function handleClaim(questId: string) {
    const updatedState = claimQuestReward(questId);
    setTotalXp(updatedState.totalXp);
    setQuests([...updatedState.quests]);
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 text-white rounded-2xl p-5 sm:p-6 space-y-6">
      {/* Top Banner: Level + Streak */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
            {levelInfo.level}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Nível {levelInfo.level}
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                <Award className="h-2.5 w-2.5 inline mr-1" />
                {levelInfo.title}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white mt-0.5">
              {totalXp} XP Total Acumulado
            </h3>
          </div>
        </div>

        {/* Badge de Sequência de Fogo (Streak) */}
        <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-amber-400 px-4 py-2 rounded-xl shrink-0">
          <Flame className="h-5 w-5 text-orange-500 fill-orange-500" />
          <div>
            <div className="text-[10px] uppercase font-bold text-orange-300 leading-tight">
              Sequência Ativa
            </div>
            <div className="text-xs font-bold text-amber-300">
              {streakDays} Dias Seguidos!
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Progresso do Próximo Nível */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>Próximo Nível ({levelInfo.level + 1})</span>
          <span className="font-bold text-neutral-200">
            {levelInfo.currentXp} / {levelInfo.xpForNextLevel} XP
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-neutral-800 overflow-hidden border border-neutral-700/50">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 rounded-full"
            style={{ width: `${levelInfo.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Missões Diárias */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5 text-amber-400" />
          Missões do Dia (+XP)
        </h4>

        <div className="grid gap-2.5 sm:grid-cols-3">
          {quests.map((q) => (
            <div
              key={q.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 text-xs ${
                q.claimed
                  ? "bg-neutral-900/40 border-neutral-800 text-neutral-500 opacity-70"
                  : q.completed
                  ? "bg-blue-950/40 border-blue-500/40 text-blue-100"
                  : "bg-neutral-800/40 border-neutral-800 text-neutral-300"
              }`}
            >
              <div>
                <div className="font-bold text-white mb-0.5 flex items-center justify-between">
                  <span>{q.title}</span>
                  <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    +{q.rewardXp} XP
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-snug">{q.description}</p>
              </div>

              {q.claimed ? (
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <CheckCircle className="h-3.5 w-3.5" /> Recompensa Resgatada
                </div>
              ) : q.completed ? (
                <button
                  onClick={() => handleClaim(q.id)}
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 text-[11px] shadow-sm transition-all flex items-center justify-center gap-1 active:scale-95"
                >
                  <Sparkles className="h-3 w-3" /> Resgatar +{q.rewardXp} XP
                </button>
              ) : (
                <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Em Andamento...
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
