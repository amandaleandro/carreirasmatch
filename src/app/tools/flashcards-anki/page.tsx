"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Flashcard {
  front: string;
  back: string;
  mnemonicTip?: string;
}

export default function FlashcardsAnkiPage() {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!subject.trim()) return;
    setLoading(true);
    setError("");
    setFlashcards([]);
    setCurrentIndex(0);
    setIsFlipped(false);

    try {
      const res = await fetch("/api/tools/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic, quantity: 6 }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao gerar flashcards.");
      } else {
        setFlashcards(data.flashcards);
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const currentCard = flashcards[currentIndex];

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <Link href="/tools" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar para Ferramentas
      </Link>

      <header className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-100/60 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full">
          🧠 Nicho Concurseiro, OAB & Vestibular
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Gerador de Flashcards de Revisão (ANKI)
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Crie cartões interativos de Pergunta & Resposta por inteligência artificial para fixar legislação, conceitos e fórmulas.
        </p>
      </header>

      <div className="space-y-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
              Disciplina / Matéria *
            </label>
            <input
              type="text"
              placeholder="Ex: Direito Constitucional, RLM, Português..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-3 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
              Tópico Específico (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Remédios Constitucionais, Crase, Art. 5º..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-3 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {error && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading || !subject.trim()}
          className="w-full py-3 px-4 font-bold text-sm rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50"
        >
          {loading ? "Gerando flashcards com IA..." : "⚡ Criar Deck de Flashcards"}
        </button>
      </div>

      {flashcards.length > 0 && currentCard && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
            <span>Cartão {currentIndex + 1} de {flashcards.length}</span>
            <span>Clique no cartão para virar</span>
          </div>

          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[220px] p-8 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 dark:from-indigo-950/30 dark:via-neutral-900 dark:to-purple-950/20 flex flex-col items-center justify-center text-center shadow-md hover:border-indigo-400 transition-all"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
              {isFlipped ? "RESPOSTA / VERSO" : "PERGUNTA / FRENTE"}
            </span>

            <p className="text-base md:text-lg font-bold text-neutral-900 dark:text-white">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>

            {isFlipped && currentCard.mnemonicTip && (
              <p className="mt-4 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-100/60 dark:bg-purple-950/40 px-3 py-1.5 rounded-lg">
                💡 Dica de Memorização: {currentCard.mnemonicTip}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => {
                setCurrentIndex((prev) => Math.max(0, prev - 1));
                setIsFlipped(false);
              }}
              disabled={currentIndex === 0}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 disabled:opacity-30"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 transition-colors"
            >
              🔄 Virar Cartão
            </button>
            <button
              onClick={() => {
                setCurrentIndex((prev) => Math.min(flashcards.length - 1, prev + 1));
                setIsFlipped(false);
              }}
              disabled={currentIndex === flashcards.length - 1}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 disabled:opacity-30"
            >
              Próximo →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
