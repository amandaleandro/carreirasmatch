"use client";

import React, { useState } from "react";
import { Users, Copy, Check, Gift, Sparkles, ArrowRight } from "lucide-react";

interface ReferralRewardBoxProps {
  userId: string;
  totalReferrals: number;
  credits: number;
  referralsNeeded?: number;
}

export function ReferralRewardBox({
  userId,
  totalReferrals,
  credits,
  referralsNeeded = 3,
}: ReferralRewardBoxProps) {
  const [copied, setCopied] = useState(false);

  const currentTierCount = totalReferrals % referralsNeeded;
  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/desafio?ref=${userId}`
    : `https://carreirasmatch.com.br/desafio?ref=${userId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800/50 space-y-6 relative overflow-hidden">
      {/* Decoração de fundo */}
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-800/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-base text-white">Recompensa de Indicação</h4>
            <p className="text-xs text-blue-200">Indique amigos e libere Diagnósticos Completos grátis</p>
          </div>
        </div>

        {credits > 0 && (
          <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 font-bold text-xs px-3.5 py-1.5 rounded-full border border-emerald-400/30 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{credits} {credits === 1 ? "Diagnóstico Grátis Liberado!" : "Diagnósticos Grátis Liberados!"}</span>
          </div>
        )}
      </div>

      {/* Progresso visual */}
      <div className="space-y-3">
        <div className="flex justify-between text-xs font-semibold text-blue-200">
          <span>Progresso para o próximo desbloqueio</span>
          <span className="text-white font-bold">{currentTierCount} de {referralsNeeded} amigos indicados</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: referralsNeeded }).map((_, idx) => {
            const isFilled = idx < currentTierCount;
            return (
              <div
                key={idx}
                className={`h-3.5 rounded-full transition-all duration-500 ${
                  isFilled
                    ? "bg-gradient-to-r from-blue-400 to-sky-400 shadow-md shadow-sky-400/30"
                    : "bg-white/10 border border-white/10"
                }`}
              />
            );
          })}
        </div>

        <p className="text-xs text-blue-300 leading-relaxed">
          {referralsNeeded - currentTierCount === 0 ? (
            <span className="text-emerald-300 font-semibold">🎉 Parabéns! Você completou a meta e ganhou 1 Diagnóstico Completo!</span>
          ) : (
            <>Faltam apenas <strong className="text-white font-bold">{referralsNeeded - currentTierCount} amigo(s)</strong> para você ganhar uma Análise Completa sem pagar nada.</>
          )}
        </p>
      </div>

      {/* Caixa do Link de Indicação */}
      <div className="space-y-2 pt-2">
        <label className="text-xs font-semibold text-blue-200 block">
          Seu Link Exclusivo de Indicação:
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="w-full bg-slate-950/60 border border-blue-800/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-400 select-all"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition-all text-xs shrink-0 shadow-md shadow-blue-500/20 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
