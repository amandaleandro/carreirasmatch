"use client";

import { useState } from "react";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnsinoMedioToolsNav } from "@/components/ensino-medio-tools-nav";
import { HIGH_SCHOOL_SUBJECTS, HIGH_SCHOOL_YEARS, YearId } from "@/lib/ensino-medio-types";
import { GeneratedSimulado } from "@/app/api/ensino-medio/simulado/gerar/route";
import {
  Trophy,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  Brain,
  GraduationCap,
  Flame,
  ArrowRight,
} from "lucide-react";

export default function SimuladoPorAnoPage() {
  const [selectedSubject, setSelectedSubject] = useState("todas");
  const [selectedYear, setSelectedYear] = useState<YearId>("1o-ano");
  const [numQuestions, setNumQuestions] = useState(5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulado, setSimulado] = useState<GeneratedSimulado | null>(null);

  // Respostas do usuário e resultado
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState<number>(0);

  const handleGenerateSimulado = async () => {
    setLoading(true);
    setError(null);
    setSimulado(null);
    setUserAnswers({});
    setFinished(false);
    setScore(0);

    try {
      const res = await fetch("/api/ensino-medio/simulado/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectSlug: selectedSubject,
          yearId: selectedYear,
          numQuestions,
        }),
      });

      if (!res.ok) {
        throw new Error("Erro ao gerar simulado");
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSimulado(data);
    } catch (err) {
      console.error(err);
      setError("Não foi possível gerar o simulado agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionId: number, optionIdx: number) => {
    if (finished) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleFinish = () => {
    if (!simulado) return;
    let hits = 0;
    simulado.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswerIndex) {
        hits++;
      }
    });
    setScore(hits);
    setFinished(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans">
      <PublicSiteHeader />
      <EnsinoMedioToolsNav />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-8 py-10 space-y-8">
        {/* Header */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Trophy className="h-3.5 w-3.5" />
            Simulado por Ano Escolar
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
            Simulado Personalizado do Ensino Médio
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Monte testes focados na grade curricular do **1º Ano**, **2º Ano** ou **3º Ano & ENEM**. Responda as questões e receba diagnósticos com dicas da Gemini AI.
          </p>
        </header>

        {/* Form de Configuração do Simulado */}
        {!simulado && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            {/* Escolha do Ano */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                1. Escolha a Série Escolar:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {HIGH_SCHOOL_YEARS.map((y) => (
                  <button
                    key={y.id}
                    type="button"
                    onClick={() => setSelectedYear(y.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedYear === y.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm font-bold"
                        : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-blue-400"
                    }`}
                  >
                    <p className="text-xs font-extrabold">{y.label}</p>
                    <p className={`text-[10px] ${selectedYear === y.id ? "text-blue-100" : "text-neutral-400"}`}>
                      {y.badge}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Escolha da Matéria */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                2. Selecione a Matéria:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubject("todas")}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                    selectedSubject === "todas"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-emerald-400"
                  }`}
                >
                  🌐 Todas as Matérias
                </button>
                {HIGH_SCHOOL_SUBJECTS.map((s) => (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => setSelectedSubject(s.slug)}
                    className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                      selectedSubject === s.slug
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-emerald-400"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantidade de Questões */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-500" />
                3. Quantidade de Questões:
              </label>

              <div className="flex gap-3">
                {[5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNumQuestions(num)}
                    className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      numQuestions === num
                        ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                        : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-amber-400"
                    }`}
                  >
                    {num} Questões
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-800">
                {error}
              </p>
            )}

            {/* Botão Gerar */}
            <button
              onClick={handleGenerateSimulado}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles className="h-5 w-5 animate-spin" />
                  Gerando Simulado Inédito com IA...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  Iniciar Simulado Agora
                </>
              )}
            </button>
          </div>
        )}

        {/* Exibição do Simulado Ativo */}
        {simulado && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-full">
                    {simulado.yearLabel}
                  </span>
                  <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white mt-1">
                    {simulado.title}
                  </h2>
                </div>

                <button
                  onClick={handleGenerateSimulado}
                  className="text-xs font-extrabold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Novo Simulado
                </button>
              </div>

              {/* Lista de Questões */}
              <div className="space-y-8 pt-2">
                {simulado.questions.map((q, idx) => {
                  const selectedIdx = userAnswers[q.id];
                  const isCorrect = selectedIdx === q.correctAnswerIndex;

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-400">
                          Questão {idx + 1} de {simulado.questions.length} • {q.subjectName}
                        </span>
                        {q.topic && (
                          <span className="text-[10px] font-extrabold text-neutral-500 bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded">
                            {q.topic}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-neutral-900 dark:text-white leading-relaxed">
                        {q.question}
                      </p>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selectedIdx === optIdx;
                          const isOptionCorrect = optIdx === q.correctAnswerIndex;

                          let buttonStyle = "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:border-blue-400";

                          if (finished) {
                            if (isOptionCorrect) {
                              buttonStyle = "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold";
                            } else if (isOptionSelected && !isCorrect) {
                              buttonStyle = "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 font-bold";
                            }
                          } else if (isOptionSelected) {
                            buttonStyle = "bg-blue-600 text-white border-blue-600 font-bold shadow-xs";
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleOptionSelect(q.id, optIdx)}
                              disabled={finished}
                              className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all flex items-start gap-3 ${buttonStyle}`}
                            >
                              <span className="font-mono font-extrabold uppercase shrink-0">
                                {String.fromCharCode(65 + optIdx)})
                              </span>
                              <span className="leading-relaxed">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Gabarito e Explicação após finalizar */}
                      {finished && (
                        <div className="mt-4 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
                          <p className="font-bold flex items-center gap-1.5 text-neutral-900 dark:text-white">
                            {isCorrect ? (
                              <span className="text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4" /> Correto!
                              </span>
                            ) : (
                              <span className="text-rose-600 flex items-center gap-1">
                                <XCircle className="h-4 w-4" /> Incorreto
                              </span>
                            )}
                          </p>

                          <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                            <strong className="text-neutral-900 dark:text-white">Resolução:</strong> {q.explanation}
                          </p>

                          {q.enemTip && (
                            <p className="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/50 text-[11px] leading-relaxed">
                              💡 <strong>Dica ENEM/Vestibular:</strong> {q.enemTip}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Ações Inferiores */}
              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                {!finished ? (
                  <button
                    onClick={handleFinish}
                    disabled={Object.keys(userAnswers).length < simulado.questions.length}
                    className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Finalizar Simulado ({Object.keys(userAnswers).length}/{simulado.questions.length})
                  </button>
                ) : (
                  <div className="w-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-blue-900 dark:text-blue-200 font-extrabold">
                        Resultado do Simulado: {score} de {simulado.questions.length} acertos (
                        {Math.round((score / simulado.questions.length) * 100)}%)
                      </p>
                      <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                        {score === simulado.questions.length
                          ? "Desempenho perfeito! Parabéns!"
                          : score >= simulado.questions.length / 2
                          ? "Bom resultado! Revise os pontos fracos acima."
                          : "Continue praticando! O importante é manter a rotina de estudos."}
                      </p>
                    </div>

                    <button
                      onClick={handleGenerateSimulado}
                      className="shrink-0 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      Refazer outro simulado <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
