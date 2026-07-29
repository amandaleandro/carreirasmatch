"use client";

import { useState } from "react";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnsinoMedioToolsNav } from "@/components/ensino-medio-tools-nav";
import { HIGH_SCHOOL_SUBJECTS, HIGH_SCHOOL_YEARS, YearId } from "@/lib/ensino-medio-types";
import { GeneratedFlashcardDeck } from "@/app/api/ensino-medio/flashcards/gerar/route";
import {
  Sparkles,
  RotateCcw,
  Brain,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

export default function Flashcards3DPage() {
  const [selectedSubject, setSelectedSubject] = useState("matematica");
  const [selectedYear, setSelectedYear] = useState<YearId>("1o-ano");
  const [customTopic, setCustomTopic] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deck, setDeck] = useState<GeneratedFlashcardDeck | null>(null);

  // Estado do visualizador de flashcards
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Record<number, boolean>>({});

  const handleGenerateDeck = async () => {
    setLoading(true);
    setError(null);
    setDeck(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredCards({});

    try {
      const res = await fetch("/api/ensino-medio/flashcards/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectSlug: selectedSubject,
          yearId: selectedYear,
          customTopic,
        }),
      });

      if (!res.ok) throw new Error("Erro ao gerar flashcards");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setDeck(data);
    } catch (err) {
      console.error(err);
      setError("Não foi possível gerar o baralho agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMastered = (cardId: number, status: boolean) => {
    setMasteredCards((prev) => ({ ...prev, [cardId]: status }));
  };

  const currentCard = deck?.cards[currentIndex];
  const masteredCount = Object.values(masteredCards).filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans">
      <PublicSiteHeader />
      <EnsinoMedioToolsNav />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-8 py-10 space-y-8">
        {/* Header */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <Zap className="h-3.5 w-3.5" />
            Memorização Rápida • Flashcards 3D
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Flashcards Interativos por Série
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Revise fórmulas, conceitos e regras em cartões 3D com técnica de repetição espaçada para o **1º, 2º e 3º Ano & ENEM**.
          </p>
        </header>

        {/* Form de geração de Flashcards */}
        {!deck && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            {/* Escolha do Ano */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                1. Série Escolar:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {HIGH_SCHOOL_YEARS.map((y) => (
                  <button
                    key={y.id}
                    type="button"
                    onClick={() => setSelectedYear(y.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedYear === y.id
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm font-bold"
                        : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-purple-400"
                    }`}
                  >
                    <p className="text-xs font-extrabold">{y.label}</p>
                    <p className={`text-[10px] ${selectedYear === y.id ? "text-purple-100" : "text-neutral-400"}`}>
                      {y.badge}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Escolha da Matéria */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                2. Selecione a Matéria:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {HIGH_SCHOOL_SUBJECTS.map((s) => (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => setSelectedSubject(s.slug)}
                    className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                      selectedSubject === s.slug
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                        : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-purple-400"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tópico opcional */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                3. Tópico Específico (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ex: Fórmulas de Geometria Plana, Leis de Newton, Reações Orgânicas..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-800">
                {error}
              </p>
            )}

            <button
              onClick={handleGenerateDeck}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles className="h-5 w-5 animate-spin" />
                  Gerando Baralho 3D com Gemini...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  Gerar Baralho 3D de Flashcards
                </>
              )}
            </button>
          </div>
        )}

        {/* Visualizador de Flashcards 3D */}
        {deck && currentCard && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 rounded-full">
                  {deck.subjectName} • {deck.yearLabel}
                </span>
                <p className="text-xs text-neutral-500 mt-1 font-medium">
                  Cartão {currentIndex + 1} de {deck.cards.length} • Dominados: {masteredCount}/{deck.cards.length}
                </p>
              </div>

              <button
                onClick={handleGenerateDeck}
                className="text-xs font-extrabold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Novo Baralho
              </button>
            </div>

            {/* Cartão 3D Virável */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full min-h-[280px] sm:min-h-[320px] rounded-3xl bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 hover:border-purple-500 dark:hover:border-purple-500 p-8 shadow-lg cursor-pointer flex flex-col justify-between transition-all hover:scale-[1.01] relative overflow-hidden select-none"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-3 py-1 rounded-full">
                  {currentCard.category || "Conceito"}
                </span>

                <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-widest">
                  {isFlipped ? "Verso (Resposta)" : "Frente (Clique para virar 🔄)"}
                </span>
              </div>

              <div className="my-auto text-center px-4">
                {!isFlipped ? (
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white leading-relaxed">
                    {currentCard.front}
                  </h3>
                ) : (
                  <div className="space-y-4">
                    <p className="text-base sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 leading-relaxed">
                      {currentCard.back}
                    </p>
                    {currentCard.tip && (
                      <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50 leading-relaxed">
                        💡 <strong>Dica de Memorização:</strong> {currentCard.tip}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="text-center text-xs text-neutral-400 font-semibold">
                {isFlipped ? "Clique para voltar para a frente" : "Clique em qualquer lugar no cartão para ver a resposta"}
              </div>
            </div>

            {/* Controles de Navegação do Baralho */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleMastered(currentCard.id, true)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    masteredCards[currentCard.id]
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white dark:bg-neutral-900 text-emerald-600 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {masteredCards[currentCard.id] ? "Dominado! 🎉" : "Marcar como Dominado"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : deck.cards.length - 1));
                  }}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 font-bold text-xs"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="text-xs font-extrabold text-neutral-500 px-2">
                  {currentIndex + 1} / {deck.cards.length}
                </span>

                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentIndex((prev) => (prev < deck.cards.length - 1 ? prev + 1 : 0));
                  }}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  Próximo <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
