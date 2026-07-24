"use client";

import { useState } from "react";
import { Copy, Check, Sparkles, X, FileText, CheckCircle2 } from "lucide-react";

type ATSPlatform = "gupy" | "greenhouse" | "workday" | "lever";

interface ATSHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  suggestedSummary: string;
  keywordsFound: string[];
  experienceSuggestions?: Array<{
    role: string;
    company: string;
    suggested: string;
  }>;
}

export function ATSHelperModal({
  isOpen,
  onClose,
  jobTitle,
  suggestedSummary,
  keywordsFound,
  experienceSuggestions = [],
}: ATSHelperModalProps) {
  const [platform, setPlatform] = useState<ATSPlatform>("gupy");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Format texts specifically tailored for each ATS platform
  const getFormattedSummary = () => {
    switch (platform) {
      case "gupy":
        return `Resumo Profissional (${jobTitle}):\n${suggestedSummary}\n\nPrincipais Competências Otimizadas para Gupy:\n• ${keywordsFound.slice(0, 8).join("\n• ")}`;
      case "greenhouse":
        return `${suggestedSummary}\n\nCore Competencies: ${keywordsFound.join(", ")}`;
      case "workday":
        return `Summary of Qualifications:\n${suggestedSummary}`;
      case "lever":
        return `${suggestedSummary}`;
      default:
        return suggestedSummary;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Assistente de Formulários ATS
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Respostas prontas formatadas para os campos das plataformas de contratação
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex border-b border-neutral-100 dark:border-neutral-800 px-6 bg-neutral-50/30 dark:bg-neutral-950/30 overflow-x-auto gap-2 py-3">
          {[
            { id: "gupy", label: "Modo Gupy", color: "from-blue-600 to-indigo-600" },
            { id: "greenhouse", label: "Greenhouse", color: "from-emerald-600 to-teal-600" },
            { id: "workday", label: "Workday", color: "from-amber-600 to-orange-600" },
            { id: "lever", label: "Lever", color: "from-purple-600 to-pink-600" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id as ATSPlatform)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                platform === p.id
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                  : "bg-neutral-100 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
              }`}
            >
              <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${p.color}`} />
              {p.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Instructions Box */}
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 text-purple-950 dark:text-purple-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="font-semibold block mb-0.5">Dica de Preenchimento ({platform.toUpperCase()}):</strong>
              Copie o texto otimizado abaixo e cole diretamente no campo &quot;Resumo/Sobre você&quot; do formulário da vaga. O formato inclui termos-chave exigidos pelos robôs de triagem.
            </div>
          </div>

          {/* Section 1: Formatted Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                Campo: Resumo Profissional / Sobre
              </label>
              <button
                onClick={() => copyToClipboard(getFormattedSummary(), "summary")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                {copiedKey === "summary" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copiar Texto
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              rows={4}
              value={getFormattedSummary()}
              className="w-full p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none resize-none"
            />
          </div>

          {/* Section 2: Experience Bullets formatted */}
          {experienceSuggestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Campos de Descrição de Experiência
              </h3>
              <div className="space-y-3">
                {experienceSuggestions.map((exp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                        {exp.role} — <span className="text-neutral-500">{exp.company}</span>
                      </span>
                      <button
                        onClick={() => copyToClipboard(exp.suggested, `exp-${idx}`)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1"
                      >
                        {copiedKey === `exp-${idx}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" /> Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copiar
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-mono bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800">
                      {exp.suggested}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
}
