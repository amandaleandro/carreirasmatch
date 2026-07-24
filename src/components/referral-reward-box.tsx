"use client";

import React, { useState } from "react";
import { Users, Copy, Check, Gift, Sparkles } from "lucide-react";

interface ReferralRewardBoxProps {
  userId: string;
  totalReferrals: number;
  credits: number;
  referralsNeeded?: number;
  hasActiveSubscription?: boolean;
}

export function ReferralRewardBox({
  userId,
  totalReferrals,
  credits,
  referralsNeeded = 3,
  hasActiveSubscription = false,
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
    <div className="bg-[#FFFFFF] dark:bg-neutral-900 border border-[#E2E8F0] dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-5 relative overflow-hidden animate-in fade-in duration-300">
      
      {/* Cabeçalho do Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-neutral-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-[#2563EB]/10 text-[#2563EB] rounded-2xl border border-[#2563EB]/25">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-title font-bold text-sm text-[#071827] dark:text-white">Recompensa por Indicação</h4>
            <p className="text-[10px] text-[#64748B]">
              {hasActiveSubscription
                ? "Indique amigos e ganhe descontos e benefícios na sua próxima mensalidade"
                : "Indique 3 amigos e ganhe 1 Diagnóstico Completo Grátis + Desconto na Assinatura Mensal"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasActiveSubscription ? (
            <div className="flex items-center gap-1 bg-[#2563EB]/15 text-[#2563EB] font-bold text-[10px] px-3 py-1 rounded-full border border-[#2563EB]/20">
              <Sparkles className="w-3 h-3 text-[#2563EB]" />
              <span>Assinante (Análises Inclusas)</span>
            </div>
          ) : (
            credits > 0 && (
              <div className="flex items-center gap-1 bg-[#22C55E]/15 text-[#22C55E] font-bold text-[10px] px-3 py-1 rounded-full border border-[#22C55E]/20 animate-pulse">
                <Sparkles className="w-3 h-3" />
                <span>{credits} {credits === 1 ? "Análise Grátis Liberada!" : "Análises Grátis Liberadas!"}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Progresso visual (Semáforo/Tema Azul Principal) */}
      <div className="space-y-2.5">
        <div className="flex justify-between text-[11px] font-semibold text-[#64748B]">
          <span>Progresso para a próxima recompensa</span>
          <span className="text-[#071827] dark:text-white font-bold">{currentTierCount} de {referralsNeeded} amigos indicados</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: referralsNeeded }).map((_, idx) => {
            const isFilled = idx < currentTierCount;
            return (
              <div
                key={idx}
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  isFilled
                    ? "bg-[#2563EB] shadow-sm shadow-[#2563EB]/20"
                    : "bg-[#F8FAFC] dark:bg-neutral-800 border border-[#E2E8F0] dark:border-neutral-700"
                }`}
              />
            );
          })}
        </div>

        <p className="text-[11px] text-[#64748B] leading-relaxed">
          {hasActiveSubscription ? (
            referralsNeeded - currentTierCount === 0 ? (
              <span className="text-[#22C55E] font-bold">🎉 Meta atingida! Desconto de renovação ativado na sua assinatura mensal!</span>
            ) : (
              <>
                Como assinante, seus diagnósticos já são ilimitados. Falta(m) <strong className="text-[#071827] dark:text-white font-bold">{referralsNeeded - currentTierCount} amigo(s)</strong> para liberar desconto na sua próxima mensalidade!
              </>
            )
          ) : (
            referralsNeeded - currentTierCount === 0 ? (
              <span className="text-[#22C55E] font-bold">🎉 Meta atingida! 1 Diagnóstico Grátis liberado e desconto ativo para assinar o plano mensal!</span>
            ) : (
              <>
                Falta(m) apenas <strong className="text-[#071827] dark:text-white font-bold">{referralsNeeded - currentTierCount} amigo(s)</strong> para liberar seu diagnóstico grátis e desconto na assinatura.
              </>
            )
          )}
        </p>
      </div>

      {/* Link de Indicação */}
      <div className="space-y-1.5 pt-1">
        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
          Seu Link Exclusivo de Indicação:
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="w-full bg-[#F8FAFC] dark:bg-neutral-950 border border-[#E2E8F0] dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-[#64748B] focus:outline-none select-all font-mono"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-xs shrink-0 active:scale-[0.98] cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white animate-in zoom-in duration-200" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
