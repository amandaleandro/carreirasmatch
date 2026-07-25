"use client";

import { useState } from "react";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";
import { ArrowRight, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, X } from "lucide-react";

export function ReanalysisModal({
  isOpen,
  onClose,
  analysisId,
  jobTitle,
  previousScore,
  currentResumeText = "",
  onReanalysisComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  analysisId: string;
  jobTitle: string;
  previousScore: number;
  currentResumeText?: string;
  onReanalysisComplete?: (updatedScore: number) => void;
}) {
  const [updatedText, setUpdatedText] = useState(currentResumeText);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    overallScore: number;
    atsScore: number;
    keywordsFound: string[];
    keywordsMissing: string[];
    fixes: string[];
  } | null>(null);

  if (!isOpen) return null;

  async function handleReanalyze() {
    if (!updatedText.trim()) {
      setError("Insira o texto atualizado do seu currículo.");
      return;
    }
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze/reanalyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId, updatedText }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha ao processar reanálise.");
      }

      const data = await res.json();
      setResult(data);
      track(ANALYTICS_EVENTS.ANALYSIS_REANALYZED, {
        analysisId,
        scoreDelta: data.overallScore - previousScore,
      });

      if (onReanalysisComplete) {
        onReanalysisComplete(data.overallScore);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Ocorreu um erro ao comparar seu currículo.";
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <RefreshCw className={`w-5 h-5 ${isAnalyzing ? "animate-spin" : ""}`} />
            </div>
            <div>
              <h2 className="font-title font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Reanálise Rápida de Aderência
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vaga: <strong className="text-slate-800 dark:text-slate-200">{jobTitle}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {!result ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Cole abaixo a versão editada do seu currículo para recalcular instantaneamente seu score de match frente às exigências desta vaga:
            </p>

            <textarea
              value={updatedText}
              onChange={(e) => setUpdatedText(e.target.value)}
              placeholder="Cole aqui o texto atualizado do seu currículo..."
              rows={8}
              className="w-full rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 p-4 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleReanalyze}
                disabled={isAnalyzing || !updatedText.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-2.5 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Recalculando Match...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Comparar Novamente com a Vaga</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Result comparison screen */
          <div className="space-y-6 animate-in fade-in">
            {/* Score Comparison Hero */}
            <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-center">
              <div className="space-y-1 border-r border-slate-200 dark:border-neutral-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Score Anterior</span>
                <p className="text-3xl font-black text-slate-600 dark:text-slate-400">{previousScore}%</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Novo Score Atualizado</span>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{result.overallScore}%</p>
                  {result.overallScore > previousScore && (
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      +{result.overallScore - previousScore}% 🚀
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mudanças & Palavras-Chave Capturadas */}
            {result.keywordsFound.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Palavras-Chave Confirmadas no Novo Texto</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywordsFound.map((kw, i) => (
                    <span key={i} className="text-[10px] font-bold rounded-full px-2.5 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Lacunas ainda abertas */}
            {result.keywordsMissing.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Lacunas Ainda Abertas</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywordsMissing.map((kw, i) => (
                    <span key={i} className="text-[10px] font-bold rounded-full px-2.5 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      ! {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="rounded-xl border border-slate-200 dark:border-neutral-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Tentar Nova Edição
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs px-5 py-2.5 shadow-md hover:bg-slate-800 transition-all"
              >
                <span>Concluir</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
