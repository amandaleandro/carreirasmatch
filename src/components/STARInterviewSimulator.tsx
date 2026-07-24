"use client";

import { useState } from "react";
import { Sparkles, CheckCircle2, AlertCircle, Award, RefreshCw, Send } from "lucide-react";

interface STARFeedback {
  situationScore: number;
  situationFeedback: string;
  taskScore: number;
  taskFeedback: string;
  actionScore: number;
  actionFeedback: string;
  resultScore: number;
  resultFeedback: string;
  overallScore: number;
  overallVerdict: string;
  improvedAnswer: string;
}

interface STARInterviewSimulatorProps {
  question: string;
  jobTitle?: string;
}

export function STARInterviewSimulator({ question, jobTitle = "Profissional" }: STARInterviewSimulatorProps) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<STARFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleEvaluate() {
    if (!answer.trim()) {
      setError("Por favor, digite sua resposta para receber a avaliação no formato STAR.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/tools/star-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, jobTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao avaliar resposta.");
      setFeedback(data.feedback);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro na avaliação STAR.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-purple-200 dark:border-purple-900/50 bg-gradient-to-b from-purple-50/30 via-white to-white dark:from-purple-950/20 dark:via-neutral-900 dark:to-neutral-900 p-5 md:p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-title font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>Treinador de Respostas STAR</span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-normal uppercase">
                Metodologia STAR
              </span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Pratique sua resposta estruturada em Situação, Tarefa, Ação e Resultado
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
          Pergunta da Entrevista
        </span>
        <p className="text-xs font-semibold text-neutral-900 dark:text-white leading-relaxed">
          &quot;{question}&quot;
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
          <span>Sua Resposta no Treino:</span>
          <span className="text-[10px] text-neutral-400 font-normal">Ex: &quot;Em 2023, enfrentei um problema no projeto X...&quot;</span>
        </label>
        <textarea
          rows={4}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Descreva a situação, a tarefa que você precisava cumprir, as ações que você tomou e o resultado final alcançado..."
          className="w-full p-3.5 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
        />
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>

      <button
        onClick={handleEvaluate}
        disabled={loading}
        className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" /> Avaliando Metodologia STAR...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> Avaliar Minha Resposta no Modelo STAR
          </>
        )}
      </button>

      {/* Result Section */}
      {feedback && (
        <div className="space-y-5 pt-3 border-t border-purple-100 dark:border-purple-900/40 animate-in fade-in">
          {/* Header Score */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Pontuação STAR Geral
                </span>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                  {feedback.overallVerdict}
                </p>
              </div>
            </div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400 font-mono">
              {feedback.overallScore}/100
            </div>
          </div>

          {/* STAR 4 Pillar Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Situation */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-neutral-900 dark:text-white">S — Situação</span>
                <span className="text-purple-600 dark:text-purple-400 font-mono">{feedback.situationScore}%</span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {feedback.situationFeedback}
              </p>
            </div>

            {/* Task */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-neutral-900 dark:text-white">T — Tarefa / Desafio</span>
                <span className="text-purple-600 dark:text-purple-400 font-mono">{feedback.taskScore}%</span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {feedback.taskFeedback}
              </p>
            </div>

            {/* Action */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-neutral-900 dark:text-white">A — Ação Tomada</span>
                <span className="text-purple-600 dark:text-purple-400 font-mono">{feedback.actionScore}%</span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {feedback.actionFeedback}
              </p>
            </div>

            {/* Result */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-neutral-900 dark:text-white">R — Resultado Mensurável</span>
                <span className="text-purple-600 dark:text-purple-400 font-mono">{feedback.resultScore}%</span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {feedback.resultFeedback}
              </p>
            </div>
          </div>

          {/* Improved Answer Suggestion */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/50 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Exemplo de Resposta Otimizada no Nível Recrutador:</span>
            </div>
            <p className="text-neutral-800 dark:text-neutral-200 font-mono text-[11px] leading-relaxed bg-white dark:bg-neutral-900 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              &quot;{feedback.improvedAnswer}&quot;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
