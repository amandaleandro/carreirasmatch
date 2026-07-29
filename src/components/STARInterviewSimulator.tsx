"use client";

import { useState } from "react";
import { Sparkles, Award, RefreshCw, Send } from "lucide-react";
import { ChatBubble } from "@/components/ui/chat-bubble";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";

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
    <Card className="p-5 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Simulador de Entrevista STAR</span>
              <Badge variant="brand" size="sm">Metodologia STAR</Badge>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pratique sua resposta estruturada em Situação, Tarefa, Ação e Resultado
            </p>
          </div>
        </div>
      </div>

      {/* WhatsApp Chat Style Simulation */}
      <div className="space-y-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-4">
        {/* Recruiter Question */}
        <ChatBubble sender="ai" senderName="Recrutador Virtual">
          <p className="font-semibold text-slate-900 dark:text-white mb-1">Pergunta da entrevista:</p>
          <p>&ldquo;{question}&rdquo;</p>
        </ChatBubble>

        {/* User Response if typed */}
        {answer && (
          <ChatBubble sender="user" senderName="Você">
            <p>{answer}</p>
          </ChatBubble>
        )}
      </div>

      <div className="space-y-2">
        <Textarea
          rows={4}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Descreva a situação, a tarefa que você precisava cumprir, as ações que você tomou e o resultado final alcançado..."
          error={error || undefined}
        />
      </div>

      <Button
        onClick={handleEvaluate}
        isLoading={loading}
        variant="primary"
        className="w-full"
        pill
      >
        <Send className="w-4 h-4" /> Avaliar Resposta no Modelo STAR
      </Button>

      {/* Result Section */}
      {feedback && (
        <div className="space-y-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Pontuação STAR Geral
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {feedback.overallVerdict}
                </p>
              </div>
            </div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono">
              {feedback.overallScore}/100
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-900 dark:text-white">S — Situação</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono">{feedback.situationScore}%</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {feedback.situationFeedback}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-900 dark:text-white">T — Tarefa</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono">{feedback.taskScore}%</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {feedback.taskFeedback}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-900 dark:text-white">A — Ação</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono">{feedback.actionScore}%</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {feedback.actionFeedback}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-900 dark:text-white">R — Resultado</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono">{feedback.resultScore}%</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {feedback.resultFeedback}
              </p>
            </div>
          </div>

          {feedback.improvedAnswer && (
            <ChatBubble sender="ai" senderName="Sugestão da IA (Versão Aprimorada)">
              <p className="font-semibold text-xs text-slate-900 dark:text-white mb-1">Resposta Otimizada:</p>
              <p className="text-xs italic text-slate-700 dark:text-slate-300">&ldquo;{feedback.improvedAnswer}&rdquo;</p>
            </ChatBubble>
          )}
        </div>
      )}
    </Card>
  );
}
