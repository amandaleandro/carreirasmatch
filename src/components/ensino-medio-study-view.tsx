"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SubjectMetadata,
  EnsinoMedioGeneratedContent,
} from "@/lib/ensino-medio";
import {
  BookOpen,
  GraduationCap,
  Trophy,
  Brain,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Briefcase,
  Flame,
  Search,
  Check,
} from "lucide-react";

interface Props {
  subject: SubjectMetadata;
}

export function EnsinoMedioStudyView({ subject }: Props) {
  const [selectedTopic, setSelectedTopic] = useState(subject.topics[0] || "");
  const [customTopic, setCustomTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EnsinoMedioGeneratedContent | null>(null);

  // Tabs: "resumo" | "carreira" | "quiz" | "flashcards" | "vf"
  const [activeTab, setActiveTab] = useState<
    "resumo" | "carreira" | "quiz" | "flashcards" | "vf"
  >("resumo");

  // Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // V/F state
  const [vfAnswers, setVfAnswers] = useState<Record<number, boolean>>({});

  const handleGenerate = async (topicToUse?: string) => {
    const topic = topicToUse || customTopic.trim() || selectedTopic;
    if (!topic) return;

    setLoading(true);
    setError(null);
    setUserAnswers({});
    setQuizScore(null);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setVfAnswers({});

    try {
      const res = await fetch("/api/ensino-medio/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectSlug: subject.slug, topic }),
      });

      if (!res.ok) {
        throw new Error("Erro ao consultar a API.");
      }

      const json = await res.json();
      if (json.error) {
        throw new Error(json.error);
      }

      setData(json);
      setActiveTab("resumo");
    } catch (err) {
      console.error(err);
      setError("Não foi possível gerar o material agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (questionId: number, optionIndex: number) => {
    if (quizScore !== null) return; // Finalizado
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleFinishQuiz = () => {
    if (!data) return;
    let correct = 0;
    data.quiz.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswerIndex) {
        correct++;
      }
    });
    setQuizScore(correct);
  };

  const handleVfAnswer = (id: number, val: boolean) => {
    setVfAnswers((prev) => ({ ...prev, [id]: val }));
  };

  return (
    <div className="space-y-8">
      {/* Box de Seleção de Tópico */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Alimentado por Gemini AI
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-neutral-900 dark:text-white">
            Escolha o tópico de {subject.name} para estudar
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-xs md:text-sm mt-1">
            Selecione um dos temas mais cobrados no ENEM ou digite o assunto que deseja praticar hoje.
          </p>
        </div>

        {/* Chips de tópicos pré-definidos */}
        <div className="flex flex-wrap gap-2">
          {subject.topics.map((t) => (
            <button
              key={t}
              onClick={() => {
                setSelectedTopic(t);
                setCustomTopic("");
                handleGenerate(t);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedTopic === t && !customTopic
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Input customizado */}
        <div className="flex flex-col md:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Ou digite outro assunto (ex: Fotossíntese, Leis de Newton...)"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => handleGenerate()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all active:scale-95 shadow-sm"
          >
            {loading ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                Gerando com Gemini...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Gerar Estudo & Jogos
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}
      </div>

      {/* Exibição do Conteúdo e Jogos */}
      {data && (
        <div className="space-y-6">
          {/* Navegação por Abas */}
          <div className="flex flex-wrap gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <button
              onClick={() => setActiveTab("resumo")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${
                activeTab === "resumo"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Resumo & Dicas ENEM
            </button>
            <button
              onClick={() => setActiveTab("carreira")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${
                activeTab === "carreira"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Faculdade vs Técnico
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${
                activeTab === "quiz"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
              }`}
            >
              <Trophy className="h-4 w-4" />
              Quiz Gamificado ({data.quiz.length})
            </button>
            <button
              onClick={() => setActiveTab("flashcards")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${
                activeTab === "flashcards"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
              }`}
            >
              <Brain className="h-4 w-4" />
              Flashcards ({data.flashcards.length})
            </button>
            <button
              onClick={() => setActiveTab("vf")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${
                activeTab === "vf"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Verdadeiro ou Falso ({data.trueOrFalse.length})
            </button>
          </div>

          {/* CONTEÚDO 1: RESUMO */}
          {activeTab === "resumo" && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                  {data.summary.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed mt-3 whitespace-pre-line">
                  {data.summary.introduction}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Pontos Fundamentais de Fixação
                </h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {data.summary.keyPoints.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800"
                    >
                      <div className="rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 p-1 mt-0.5">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs md:text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed font-medium">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-1">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <Flame className="h-4 w-4" />
                  Dica de Prova / ENEM
                </div>
                <p className="text-xs md:text-sm font-medium leading-relaxed">
                  {data.summary.enemTip}
                </p>
              </div>
            </div>
          )}

          {/* CONTEÚDO 2: CARREIRAS (FACULDADE VS TÉCNICO) */}
          {activeTab === "carreira" && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                    <GraduationCap className="h-6 w-6 text-purple-600" />
                    Onde {data.subjectName} se aplica no seu futuro?
                  </h3>
                  <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Compare opções entre **Faculdade (Graduação)** e **Cursos Técnicos** ligados a este assunto.
                  </p>
                </div>
                <Link
                  href="/faculdade-ou-tecnico"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-200 transition-all shrink-0"
                >
                  Fazer Teste Vocacional Completo
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Faculdade */}
                <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 space-y-4">
                  <div className="flex items-center gap-2 font-extrabold text-purple-900 dark:text-purple-200">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    Cursos de Faculdade (Graduação)
                  </div>
                  <div className="space-y-3">
                    {data.careerGuidance.collegePaths.map((path, idx) => (
                      <div
                        key={idx}
                        className="bg-white dark:bg-neutral-900 p-3.5 rounded-xl border border-purple-100 dark:border-purple-900/30 shadow-2xs space-y-1"
                      >
                        <span className="font-bold text-xs md:text-sm text-neutral-900 dark:text-white">
                          {path.name}
                        </span>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          {path.why}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cursos Técnicos */}
                <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 space-y-4">
                  <div className="flex items-center gap-2 font-extrabold text-blue-900 dark:text-blue-200">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Cursos Técnicos (Entrada Rápida)
                  </div>
                  <div className="space-y-3">
                    {data.careerGuidance.technicalPaths.map((path, idx) => (
                      <div
                        key={idx}
                        className="bg-white dark:bg-neutral-900 p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-2xs space-y-1"
                      >
                        <span className="font-bold text-xs md:text-sm text-neutral-900 dark:text-white">
                          {path.name}
                        </span>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          {path.why}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visão de Mercado */}
              <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Visão de Mercado & Carreira
                </span>
                <p className="text-xs md:text-sm text-neutral-700 dark:text-neutral-300">
                  {data.careerGuidance.marketOutlook}
                </p>
              </div>
            </div>
          )}

          {/* CONTEÚDO 3: QUIZ */}
          {activeTab === "quiz" && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-emerald-600" />
                    Quiz do Conhecimento: {data.topic}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Responda às questões e teste seu nível de preparação.
                  </p>
                </div>
                {quizScore !== null && (
                  <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-extrabold text-sm">
                    Pontuação: {quizScore} / {data.quiz.length}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {data.quiz.map((q, qIndex) => {
                  const selectedOpt = userAnswers[q.id];
                  const isFinished = quizScore !== null;

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-4"
                    >
                      <span className="font-extrabold text-xs uppercase tracking-wider text-neutral-400">
                        Questão {qIndex + 1} de {data.quiz.length}
                      </span>
                      <h4 className="text-sm md:text-base font-bold text-neutral-900 dark:text-white">
                        {q.question}
                      </h4>

                      <div className="space-y-2">
                        {q.options.map((opt, optIndex) => {
                          const isSelected = selectedOpt === optIndex;
                          const isCorrect = optIndex === q.correctAnswerIndex;

                          let buttonStyle =
                            "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:border-blue-400";

                          if (isFinished) {
                            if (isCorrect) {
                              buttonStyle =
                                "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold";
                            } else if (isSelected) {
                              buttonStyle =
                                "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-900 dark:text-red-200 line-through";
                            }
                          } else if (isSelected) {
                            buttonStyle =
                              "bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-900 dark:text-blue-100 font-bold";
                          }

                          return (
                            <button
                              key={optIndex}
                              onClick={() => handleQuizAnswer(q.id, optIndex)}
                              disabled={isFinished}
                              className={`w-full text-left p-3.5 rounded-xl border text-xs md:text-sm transition-all flex items-center justify-between ${buttonStyle}`}
                            >
                              <span>{opt}</span>
                              {isFinished && isCorrect && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 ml-2" />
                              )}
                              {isFinished && isSelected && !isCorrect && (
                                <XCircle className="h-4 w-4 text-red-600 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {isFinished && (
                        <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 text-xs text-blue-900 dark:text-blue-200">
                          <strong>Explicação:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {quizScore === null ? (
                <button
                  onClick={handleFinishQuiz}
                  disabled={Object.keys(userAnswers).length === 0}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-all shadow-sm"
                >
                  Concluir Quiz e Ver Resultado
                </button>
              ) : (
                <button
                  onClick={() => {
                    setUserAnswers({});
                    setQuizScore(null);
                  }}
                  className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Refazer Quiz
                </button>
              )}
            </div>
          )}

          {/* CONTEÚDO 4: FLASHCARDS */}
          {activeTab === "flashcards" && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 text-center">
              <div>
                <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white flex items-center justify-center gap-2">
                  <Brain className="h-5 w-5 text-amber-600" />
                  Flashcards de Fixação Rápida
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Clique no cartão para virar e ver a resposta.
                </p>
              </div>

              {/* Card 3D */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer min-h-[220px] p-8 rounded-3xl border-2 border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20 hover:border-amber-500 transition-all flex flex-col items-center justify-center space-y-4 shadow-sm"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {isFlipped ? "Verso (Resposta)" : "Frente (Conceito)"}
                </span>

                <p className="text-base md:text-lg font-bold text-neutral-900 dark:text-white max-w-md">
                  {isFlipped
                    ? data.flashcards[currentCardIndex]?.back
                    : data.flashcards[currentCardIndex]?.front}
                </p>

                <span className="text-[11px] text-neutral-400 font-medium">
                  (Clique para virar)
                </span>
              </div>

              {/* Controles de Navegação */}
              <div className="flex items-center justify-between max-w-xs mx-auto pt-2">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                  }}
                  disabled={currentCardIndex === 0}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="text-xs font-extrabold text-neutral-500">
                  {currentCardIndex + 1} de {data.flashcards.length}
                </span>
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex((prev) =>
                      Math.min(data.flashcards.length - 1, prev + 1)
                    );
                  }}
                  disabled={currentCardIndex === data.flashcards.length - 1}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold disabled:opacity-40"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}

          {/* CONTEÚDO 5: VERDADEIRO OU FALSO */}
          {activeTab === "vf" && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-rose-600" />
                  Verdadeiro ou Falso (V/F)
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Marque V ou F em cada afirmação para testar pegadinhas comuns de prova.
                </p>
              </div>

              <div className="space-y-4">
                {data.trueOrFalse.map((item, idx) => {
                  const userAnswer = vfAnswers[item.id];
                  const hasAnswered = userAnswer !== undefined;
                  const isCorrect = userAnswer === item.isTrue;

                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3"
                    >
                      <span className="font-extrabold text-xs uppercase tracking-wider text-neutral-400">
                        Afirmação {idx + 1}
                      </span>
                      <p className="text-xs md:text-sm font-bold text-neutral-900 dark:text-white">
                        "{item.statement}"
                      </p>

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          onClick={() => handleVfAnswer(item.id, true)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                            userAnswer === true
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                          }`}
                        >
                          Verdadeiro (V)
                        </button>
                        <button
                          onClick={() => handleVfAnswer(item.id, false)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                            userAnswer === false
                              ? "bg-rose-600 text-white border-rose-600"
                              : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                          }`}
                        >
                          Falso (F)
                        </button>
                      </div>

                      {hasAnswered && (
                        <div
                          className={`p-3 rounded-xl text-xs ${
                            isCorrect
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium"
                              : "bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-medium"
                          }`}
                        >
                          <strong>{isCorrect ? "Correto!" : "Incorreto!"}</strong>{" "}
                          (Resposta correta: {item.isTrue ? "Verdadeiro" : "Falso"}) — {item.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
