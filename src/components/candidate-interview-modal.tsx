"use client";

import React from "react";

export interface InterviewScriptData {
  keyQuestions: Array<{ question: string; objective: string; idealAnswer: string }>;
  technicalProbes: string[];
  behavioralScenarios: string[];
  redFlagsToInvestigate: string[];
}

interface CandidateInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  jobTitle: string;
  loading: boolean;
  scriptData: InterviewScriptData | null;
}

export function CandidateInterviewModal({
  isOpen,
  onClose,
  candidateName,
  jobTitle,
  loading,
  scriptData,
}: CandidateInterviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl">
        <header className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100/60 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
              🎙️ Script de Entrevista por IA
            </span>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mt-1">
              Roteiro para {candidateName}
            </h3>
            <p className="text-xs text-neutral-500">Vaga: {jobTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            ✕
          </button>
        </header>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-neutral-800 dark:text-neutral-200">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
              <p className="text-xs font-semibold text-neutral-500">
                Gerando perguntas personalizadas com IA...
              </p>
            </div>
          )}

          {!loading && scriptData && (
            <>
              {scriptData.keyQuestions?.length > 0 && (
                <section className="space-y-3">
                  <h4 className="font-bold text-neutral-900 dark:text-white text-xs uppercase tracking-wider text-purple-700 dark:text-purple-400">
                    Perguntas-Chave de Aderência
                  </h4>
                  <div className="space-y-3">
                    {scriptData.keyQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 space-y-1.5"
                      >
                        <p className="font-bold text-neutral-900 dark:text-neutral-100">
                          {idx + 1}. "{q.question}"
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          <strong className="text-purple-600 dark:text-purple-400">Objetivo:</strong> {q.objective}
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 p-2 rounded-lg">
                          <strong className="font-semibold">Resposta ideal esperada:</strong> {q.idealAnswer}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {scriptData.technicalProbes?.length > 0 && (
                <section className="space-y-2">
                  <h4 className="font-bold text-neutral-900 dark:text-white text-xs uppercase tracking-wider text-blue-700 dark:text-blue-400">
                    Sondagem de Competência Técnica
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                    {scriptData.technicalProbes.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}

              {scriptData.redFlagsToInvestigate?.length > 0 && (
                <section className="space-y-2">
                  <h4 className="font-bold text-neutral-900 dark:text-white text-xs uppercase tracking-wider text-red-700 dark:text-red-400">
                    Pontos de Atenção a Investigar (Red Flags)
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-xs text-red-700 dark:text-red-300 bg-red-50/50 dark:bg-red-950/30 p-3 rounded-xl border border-red-100 dark:border-red-900/40">
                    {scriptData.redFlagsToInvestigate.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>

        <footer className="p-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            Fechar Roteiro
          </button>
        </footer>
      </div>
    </div>
  );
}
