"use client";

import { useState } from "react";
import { Trophy, Flame, Zap, Award, Sparkles } from "lucide-react";

export function EnsinoMedioGamification() {
  const [xp] = useState(350);
  const [streak] = useState(3);

  // Calcula nível baseado em XP (100 XP por nível)
  const level = Math.floor(xp / 100) + 1;
  const currentLevelXp = xp % 100;

  const badges = [
    { title: "Foco Total", desc: "Completou 3 blocos de Pomodoro", icon: Flame, unlocked: true },
    { title: "Nota 1000", desc: "Avaliou a primeira redação no Corretor ENEM", icon: Award, unlocked: true },
    { title: "Mestre do 1º Ano", desc: "Estudou matérias de 3 disciplinas diferentes", icon: Trophy, unlocked: true },
    { title: "Desafiante", desc: "Respondeu à Questão do Dia", icon: Zap, unlocked: false },
  ];

  return (
    <div
      className="text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
      style={{ background: "linear-gradient(to right, #1e3a8a, #312e81, #581c87)" }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold text-xl shadow-md shrink-0">
            {level}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold">Estudante Nível {level}</h3>
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                {level >= 5 ? "Veterano" : "Em Evolução ⚡"}
              </span>
            </div>
            <p className="text-xs text-blue-200">
              {xp} XP Acumulados • Sequência de {streak} Dias Seguidos!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15 text-xs font-bold shrink-0">
          <Flame className="h-4 w-4 text-amber-400 fill-amber-400" />
          <span>{streak} dias de sequência</span>
        </div>
      </div>

      {/* Barra de Progresso de XP */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-blue-200">
          <span>Progresso para o Nível {level + 1}</span>
          <span>{currentLevelXp} / 100 XP</span>
        </div>
        <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${currentLevelXp}%` }}
          />
        </div>
      </div>

      {/* Grid de Conquistas & Insígnias */}
      <div className="space-y-3 pt-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Insígnias Desbloqueadas:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className={`p-3 rounded-2xl border transition-all ${
                  b.unlocked
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-white/5 border-white/10 text-blue-300/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 shrink-0 ${b.unlocked ? "text-amber-300" : "text-neutral-500"}`} />
                  <p className="text-xs font-extrabold truncate">{b.title}</p>
                </div>
                <p className="text-[10px] text-blue-200/80 mt-1 leading-snug line-clamp-2">
                  {b.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
