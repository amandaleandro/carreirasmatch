"use client";

import { useEffect, useState } from "react";
import {
  Smile,
  Zap,
  CheckCircle2,
  ChevronDown,
  ThumbsUp,
} from "lucide-react";
import {
  EMPLOYMENT_STATUS_CONFIG,
  EmploymentStatusKey,
  getDailyMotivation,
} from "@/lib/daily-motivation";
import type { DailyMotivationProfile } from "@/lib/daily-motivation";

interface DailyMotivationCardProps {
  initialStatus?: string | null;
  profile?: DailyMotivationProfile;
  mood?: string | null;
  onStatusChange?: (newStatus: string) => Promise<void>;
}

export function DailyMotivationCard({
  initialStatus,
  profile,
  mood,
  onStatusChange,
}: DailyMotivationCardProps) {
  const [currentStatus, setCurrentStatus] = useState<EmploymentStatusKey>(
    (initialStatus as EmploymentStatusKey) || "unemployed_active"
  );
  const [showMeme, setShowMeme] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [today, setToday] = useState(() => new Date().toDateString());

  useEffect(() => {
    function refreshIfNewDay() {
      const current = new Date().toDateString();
      setToday((prev) => (prev === current ? prev : current));
    }
    // PWAs instalados costumam voltar de segundo plano sem recarregar a
    // página (bfcache), então o app precisa checar a data ao ganhar foco
    // para não travar a frase do dia anterior na tela.
    document.addEventListener("visibilitychange", refreshIfNewDay);
    window.addEventListener("focus", refreshIfNewDay);
    return () => {
      document.removeEventListener("visibilitychange", refreshIfNewDay);
      window.removeEventListener("focus", refreshIfNewDay);
    };
  }, []);

  const motivation = getDailyMotivation(currentStatus, profile, mood);
  const config = EMPLOYMENT_STATUS_CONFIG[currentStatus] || EMPLOYMENT_STATUS_CONFIG.unemployed_active;

  async function handleSelectStatus(statusKey: EmploymentStatusKey) {
    setCurrentStatus(statusKey);
    setDropdownOpen(false);
    if (onStatusChange) {
      setIsUpdating(true);
      try {
        await onStatusChange(statusKey);
      } catch (err) {
        console.error("Failed to update status", err);
      } finally {
        setIsUpdating(false);
      }
    }
  }

  return (
    <div key={today} className="rounded-2xl border border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-6 space-y-5">
      {/* Header com Situação Atual e Seletor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-neutral-800/80">
        <div>
          <h3 className="font-title font-bold text-base text-slate-900 dark:text-white">
            Motivação do dia
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            Conteúdo diário para o seu momento profissional
          </p>
        </div>

        {/* Seletor de Situação */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={isUpdating}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${config.badgeColor} hover:opacity-90 active:scale-95`}
          >
            <span>{config.icon}</span>
            <span>{config.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                Selecione seu contexto atual:
              </div>
              {(Object.keys(EMPLOYMENT_STATUS_CONFIG) as EmploymentStatusKey[]).map((key) => {
                const item = EMPLOYMENT_STATUS_CONFIG[key];
                const isSelected = key === currentStatus;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectStatus(key)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-neutral-800/60 transition-colors ${
                      isSelected ? "font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30" : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Card da Frase Inspiradora */}
      <div className="rounded-xl border-l-2 border-blue-500/40 bg-slate-50 dark:bg-neutral-800/40 pl-4 pr-3 py-3 space-y-1.5">
        <p className="text-sm font-medium italic text-slate-800 dark:text-slate-200 leading-relaxed">
          &ldquo;{motivation.quote}&rdquo;
        </p>
        <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
          — {motivation.author}
        </p>
      </div>

      {/* Dica Prática do Dia */}
      <div className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-100 dark:border-neutral-800 p-3.5">
        <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-neutral-300 space-y-0.5">
          <span className="font-bold text-slate-900 dark:text-white mr-1">Dica prática de hoje:</span>
          <span>{motivation.tip}</span>
        </div>
      </div>

      {/* Seção Meme do Dia */}
      <div className="pt-1">
        {!showMeme ? (
          <button
            onClick={() => setShowMeme(true)}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-neutral-700 hover:border-amber-500/50 text-slate-600 dark:text-neutral-300 hover:text-amber-700 dark:hover:text-amber-400 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Smile className="w-4 h-4" />
            <span>Ver piada do dia</span>
          </button>
        ) : (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                {motivation.memeTag}
              </span>
              <button
                onClick={() => setShowMeme(false)}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200"
              >
                Ocultar
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {motivation.memeTitle}
              </h4>
              <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 font-mono bg-white/80 dark:bg-neutral-900/80 p-3 rounded-lg border border-amber-500/10">
                <p className="font-medium text-slate-600 dark:text-neutral-400">{motivation.memeSetup}</p>
                <p className="font-bold text-amber-700 dark:text-amber-300 pt-1 border-t border-amber-500/10">
                  {motivation.memePunchline}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setLiked(!liked)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
                  liked
                    ? "bg-amber-500 text-white"
                    : "bg-white/60 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{liked ? "Curtiu" : "Curtiu?"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
