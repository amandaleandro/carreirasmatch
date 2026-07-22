"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

const TOTAL_QUESTIONS = 5;

type Feedback = {
  score: number;
  strengths: string[];
  gaps: string[];
  improvedAnswer: string;
};

type Turn = { question: string; answer: string; feedback: Feedback };

type AnswerResponse = Feedback & { nextQuestion: string | null };

const INPUT_CLASS =
  "w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors";

function scoreClass(score: number) {
  if (score >= 8) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300";
  if (score >= 5) return "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300";
  return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
}

export function InterviewSimulatorForm() {
  const [targetRole, setTargetRole] = useState("");
  const [area, setArea] = useState("");
  const [seniority, setSeniority] = useState("Júnior");

  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const finished = started && currentQuestion === null;

  function startSpeechRecognition() {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de fala. Por favor, use o Google Chrome ou Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setAnswer((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  }

  async function callApi(history: { question: string; answer: string }[]) {
    const res = await fetch("/api/tools/interview-simulator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetRole, area, seniority, history }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");
    return data;
  }

  async function handleStart(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!targetRole.trim()) {
      setError("Informe o cargo-alvo da entrevista.");
      return;
    }

    setLoading(true);
    try {
      const data = (await callApi([])) as { question: string };
      setCurrentQuestion(data.question);
      setStarted(true);
      setTurns([]);
      setAnswer("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswer(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!answer.trim() || !currentQuestion) {
      setError("Escreva ou fale sua resposta antes de enviar.");
      return;
    }

    setLoading(true);
    try {
      const history = [
        ...turns.map((turn) => ({ question: turn.question, answer: turn.answer })),
        { question: currentQuestion, answer },
      ];
      const data = (await callApi(history)) as AnswerResponse;

      setTurns([
        ...turns,
        {
          question: currentQuestion,
          answer,
          feedback: {
            score: data.score,
            strengths: data.strengths,
            gaps: data.gaps,
            improvedAnswer: data.improvedAnswer,
          },
        },
      ]);
      setCurrentQuestion(data.nextQuestion);
      setAnswer("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  function handleRestart() {
    setStarted(false);
    setCurrentQuestion(null);
    setTurns([]);
    setAnswer("");
    setError(null);
  }

  const averageScore =
    turns.length > 0
      ? Math.round((turns.reduce((sum, turn) => sum + turn.feedback.score, 0) / turns.length) * 10) / 10
      : 0;

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-5 font-sans">
      <Link href="/tools" className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] inline-flex items-center gap-1">
        ← Voltar para ferramentas
      </Link>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-neutral-800 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/15">
            Treinamento de Carreira
          </span>
          <h1 className="text-xl md:text-2xl font-title font-bold text-[#071827] dark:text-white mt-1">Simulador de Entrevista</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Pratique com {TOTAL_QUESTIONS} perguntas reais do seu cargo, com nota e feedback a cada resposta.
          </p>
        </div>
      </div>

      {!started && (
        <form onSubmit={handleStart} className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-850 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">Cargo-alvo</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Ex: Enfermeiro plantonista ou Programador Front-end"
              className={INPUT_CLASS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">Área (opcional)</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Ex: Saúde ou Tecnologia"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">Nível</label>
              <select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                className={INPUT_CLASS}
              >
                <option>Estágio</option>
                <option>Júnior</option>
                <option>Pleno</option>
                <option>Sênior</option>
              </select>
            </div>
          </div>

          {error && <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold px-4 py-2.5 shadow-sm shadow-[#2563EB]/25 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? "Preparando simulação..." : "Iniciar simulação"}
          </button>
        </form>
      )}

      {started && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-[#64748B]">
              {finished
                ? `Entrevista concluída · ${turns.length} de ${TOTAL_QUESTIONS} perguntas`
                : `Pergunta ${turns.length + 1} de ${TOTAL_QUESTIONS}`}
            </span>
            <button
              type="button"
              onClick={handleRestart}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Recomeçar simulação
            </button>
          </div>

          {turns.map((turn, index) => (
            <div
              key={index}
              className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-850 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-4"
            >
              <div className="flex items-start justify-between gap-3 pb-2 border-b border-neutral-100 dark:border-neutral-850">
                <p className="text-xs font-bold text-[#071827] dark:text-white leading-normal">{turn.question}</p>
                <span
                  className={`shrink-0 text-[10px] font-black uppercase tracking-wider rounded px-2 py-0.5 ${scoreClass(turn.feedback.score)}`}
                >
                  Nota: {turn.feedback.score}/10
                </span>
              </div>

              <div className="text-xs text-[#64748B] dark:text-neutral-300 leading-relaxed font-semibold italic bg-[#F8FAFC]/50 dark:bg-neutral-950 p-3 rounded-2xl border border-neutral-100/50 dark:border-neutral-800/50">
                Sua resposta: &quot;{turn.answer}&quot;
              </div>

              {turn.feedback.strengths.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    Pontos Fortes
                  </h4>
                  <ul className="space-y-1 list-disc list-inside text-xs text-[#64748B] dark:text-neutral-300">
                    {turn.feedback.strengths.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {turn.feedback.gaps.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    Pontos a Melhorar
                  </h4>
                  <ul className="space-y-1 list-disc list-inside text-xs text-[#64748B] dark:text-neutral-300">
                    {turn.feedback.gaps.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-1.5 pt-3 border-t border-neutral-100 dark:border-neutral-850">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                  Sugestão de Resposta Ideal
                </h4>
                <p className="text-xs text-[#64748B] dark:text-neutral-300 leading-relaxed">
                  {turn.feedback.improvedAnswer}
                </p>
              </div>
            </div>
          ))}

          {currentQuestion && (
            <form
              onSubmit={handleAnswer}
              className="rounded-3xl border border-[#2563EB]/20 bg-gradient-to-r from-[#2563EB]/5 to-indigo-500/5 p-5 space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-[#071827] dark:text-white leading-normal">{currentQuestion}</p>
                <button
                  type="button"
                  onClick={startSpeechRecognition}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    isRecording
                      ? "bg-rose-600 text-white animate-pulse border border-rose-400 shadow-rose-500/30"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>{isRecording ? "🔴 Gravando voz (fale em voz alta)..." : "🎙️ Responder por voz com IA"}</span>
                </button>
              </div>

              {isRecording && (
                <div className="rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2 animate-pulse">
                  <span className="shrink-0 text-base">🎤</span>
                  <span>Ouvindo sua resposta em português... O texto aparecerá na caixa abaixo em tempo real.</span>
                </div>
              )}
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4}
                placeholder="Digite sua resposta ou clique em 'Responder por voz'..."
                className={INPUT_CLASS}
              />
              {error && <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold px-4 py-2.5 shadow-sm shadow-[#2563EB]/25 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? "Avaliando..." : "Enviar resposta"}
              </button>
            </form>
          )}

          {finished && (
            <div className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-850 bg-[#FFFFFF] dark:bg-neutral-900/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] text-center space-y-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Média da entrevista</p>
              <p className="text-3xl font-extrabold text-blue-600">{averageScore}/10</p>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
                Revise os pontos que faltaram acima e refaça a simulação - as perguntas mudam a cada rodada.
              </p>
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center justify-center rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold px-5 py-2.5 shadow-sm transition-all cursor-pointer active:scale-[0.98]"
              >
                Nova simulação
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
