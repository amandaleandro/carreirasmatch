"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { Trophy, RotateCcw, ArrowLeft, Timer, Brain, Code2, BriefcaseBusiness, Megaphone, Palette, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { ShareGameCard } from "@/components/share-game-card";
import { gameAreaFromSlug } from "@/lib/game-area";
import { normalizeGamePhase } from "@/lib/game-progression";

type Card = {
  id: number;
  content: string;
  matchId: number; // Identificador comum do par
  isFlipped: boolean;
  isMatched: boolean;
};

const TERMS: Record<string, { term: string; definition: string }[]> = {
  tecnologia: [
    { term: "React", definition: "Biblioteca Frontend" },
    { term: "SQL", definition: "Banco de Dados Relacional" },
    { term: "Docker", definition: "Containers Virtuais" },
    { term: "Python", definition: "Linguagem de IA" },
    { term: "TypeScript", definition: "Superset do JS" },
    { term: "Git", definition: "Controle de Versão" },
    { term: "API REST", definition: "Comunicação HTTP" },
    { term: "HTML", definition: "Estrutura Web" },
  ],
  negocios: [
    { term: "OKR", definition: "Objetivos e Resultados" },
    { term: "KPI", definition: "Métricas de Sucesso" },
    { term: "Turnover", definition: "Rotatividade de Equipe" },
    { term: "Onboarding", definition: "Integração de Talentos" },
    { term: "WIP", definition: "Trabalho em Progresso" },
    { term: "Sprint", definition: "Ciclo de Trabalho Scrum" },
    { term: "CEO", definition: "Diretor Executivo" },
    { term: "DRE", definition: "Demonstrativo Financeiro" },
  ],
  marketing: [
    { term: "CTR", definition: "Taxa de Cliques" },
    { term: "SEO", definition: "Otimização de Buscas" },
    { term: "CTA", definition: "Chamada para Ação" },
    { term: "Persona", definition: "Cliente Ideal" },
    { term: "Lead", definition: "Cliente em Potencial" },
    { term: "ROI", definition: "Retorno sobre Investimento" },
    { term: "Inbound", definition: "Atração por Conteúdo" },
    { term: "CAC", definition: "Custo de Aquisição" },
  ],
  design: [
    { term: "Figma", definition: "Ferramenta de Protótipo" },
    { term: "UX", definition: "Experiência do Usuário" },
    { term: "UI", definition: "Interface Visual" },
    { term: "Kerning", definition: "Espaço entre Letras" },
    { term: "Grid", definition: "Alinhamento de Layout" },
    { term: "Mockup", definition: "Representação de Produto" },
    { term: "Wireframe", definition: "Esboço Funcional" },
    { term: "RGB", definition: "Esquema Digital de Cores" },
  ],
};

const AREA_VISUALS: Record<string, { icon: LucideIcon; label: string; color: string }> = {
  tecnologia: { icon: Code2, label: "Tecnologia", color: "text-blue-500" },
  negocios: { icon: BriefcaseBusiness, label: "Negócios", color: "text-amber-500" },
  marketing: { icon: Megaphone, label: "Marketing", color: "text-pink-500" },
  design: { icon: Palette, label: "Design", color: "text-violet-500" },
};

export default function MemoryGamePage() {
  const searchParams = useSearchParams();
  const [area, setArea] = useState<string>(() => gameAreaFromSlug(searchParams.get("area")));
  const [phase] = useState(() => normalizeGamePhase(searchParams.get("fase")));
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [seconds, setSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [memorizing, setMemorizing] = useState<boolean>(false);
  const [memorizeSeconds, setMemorizeSeconds] = useState<number>(0);
  const [errors, setErrors] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [personalizedPairs, setPersonalizedPairs] = useState<{ term: string; definition: string }[] | null>(null);
  const [profileContext, setProfileContext] = useState<string | null>(null);
  const areaVisual = AREA_VISUALS[area] ?? AREA_VISUALS.tecnologia;
  const AreaIcon = areaVisual.icon;

  function startNewGame(newArea = area, pairsOverride = personalizedPairs) {
    const allPairs = pairsOverride ?? TERMS[newArea] ?? TERMS.tecnologia;
    const rawPairs = allPairs.slice(0, phase === 1 ? 4 : phase === 2 ? 6 : allPairs.length);
    const initialCards: Card[] = [];

    rawPairs.forEach((pair, idx) => {
      // Adiciona o termo
      initialCards.push({
        id: idx * 2,
        content: pair.term,
        matchId: idx,
        isFlipped: true,
        isMatched: false,
      });
      // Adiciona a definição
      initialCards.push({
        id: idx * 2 + 1,
        content: pair.definition,
        matchId: idx,
        isFlipped: true,
        isMatched: false,
      });
    });

    // Embaralha as cartas
    const shuffled = initialCards.sort(() => Math.random() - 0.5);

    setArea(newArea);
    setCards(shuffled);
    setFlippedCards([]);
    setSeconds(0);
    setTimerActive(false);
    setFinished(false);
    setMemorizing(true);
    setMemorizeSeconds(4);
    setErrors(0);
    setScore(0);
  }

  useEffect(() => {
    queueMicrotask(() => startNewGame());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`/api/jogos/personalizados?game=memory&fase=${phase}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data: { pairs?: { term: string; definition: string }[]; context?: string } | null) => {
        if (!active || !data?.pairs?.length) return;
        setPersonalizedPairs(data.pairs);
        setProfileContext(data.context ?? null);
        startNewGame(area, data.pairs);
      })
      .catch(() => {});
    return () => { active = false; };
    // The personalized pack is intentionally fetched once per phase.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (!memorizing) return;
    const timeout = window.setTimeout(() => {
      if (memorizeSeconds <= 1) {
        setCards((prev) => prev.map((card) => ({ ...card, isFlipped: false })));
        setMemorizing(false);
        setMemorizeSeconds(0);
      } else {
        setMemorizeSeconds((prev) => prev - 1);
      }
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [memorizing, memorizeSeconds]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && !finished) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, finished]);

  async function saveScore(calculatedScore: number) {
    setSubmitting(true);
    try {
      await fetch("/api/jogos/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "memory", area, score: calculatedScore }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCardClick(cardId: number) {
    if (memorizing || finished || flippedCards.length === 2) return;

    const clickedCardIdx = cards.findIndex((c) => c.id === cardId);
    if (cards[clickedCardIdx].isFlipped || cards[clickedCardIdx].isMatched) return;

    if (!timerActive) {
      setTimerActive(true);
    }

    const updatedCards = [...cards];
    updatedCards[clickedCardIdx].isFlipped = true;
    setCards(updatedCards);

    const nextFlipped = [...flippedCards, cardId];
    setFlippedCards(nextFlipped);

    if (nextFlipped.length === 2) {
      const firstCard = cards.find((c) => c.id === nextFlipped[0])!;
      const secondCard = cards.find((c) => c.id === nextFlipped[1])!;

      if (firstCard.matchId === secondCard.matchId) {
        // Encontrou um par!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstCard.id || c.id === secondCard.id
                ? { ...c, isMatched: true, isFlipped: true }
                : c
            )
          );
          setFlippedCards([]);

          // Checa se todas foram combinadas
          const allMatched = updatedCards.every((c) => c.isMatched || c.id === firstCard.id || c.id === secondCard.id);
          if (allMatched) {
            setFinished(true);
            setTimerActive(false);

            // Calcula o score: base 1000 - 5 por segundo - 20 por erro
            const finalScore = Math.max(100, 1000 - seconds * 5 - errors * 20);
            setScore(finalScore);
            void saveScore(finalScore);
          }
        }, 500);
      } else {
        // Erro
        setErrors((prev) => prev + 1);
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstCard.id || c.id === secondCard.id
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50">
      <PublicSiteHeader />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        {profileContext && (
          <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-center text-xs text-violet-900 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-200">
            Memória personalizada: {profileContext}
          </div>
        )}
        <header className="flex items-center justify-between">
          <Link
            href="/jogos"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Hub
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 px-3 py-1 text-xs font-bold border border-blue-200 dark:border-blue-900/50">
            <Brain className="h-3.5 w-3.5" />
            Termos Pareados
          </div>
        </header>

        {/* Seleção de Área */}
        {!timerActive && !finished && !memorizing && (
          <section className="hidden">
            {Object.keys(TERMS).map((k) => (
              <button
                key={k}
                onClick={() => startNewGame(k)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all uppercase tracking-wider ${
                  area === k
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {k}
              </button>
            ))}
          </section>
        )}

        {/* Estatísticas */}
        {memorizing && (
          <div className="mx-auto max-w-xl rounded-3xl border border-violet-200 bg-gradient-to-r from-violet-50 via-blue-50 to-cyan-50 p-4 text-center shadow-sm dark:border-violet-900/60 dark:from-violet-950/40 dark:via-blue-950/30 dark:to-cyan-950/30">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">Memorize os pares</p>
            <p className="mt-1 text-sm font-bold text-violet-950 dark:text-white">Os cards serão virados em {memorizeSeconds}s</p>
            <p className="mt-1 text-xs text-violet-700/80 dark:text-violet-200/80">Observe o termo e sua definição. Depois encontre os pares com o menor número de erros.</p>
          </div>
        )}

        <section className="flex gap-4 justify-center max-w-sm mx-auto text-center">
          <div className="flex-1 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 flex items-center justify-center gap-2">
            <Timer className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold">{seconds}s</span>
          </div>
          <div className="flex-1 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 flex items-center justify-center gap-2">
            <span className="text-xs font-bold uppercase text-neutral-400">Erros:</span>
            <span className="text-sm font-semibold text-red-500">{errors}</span>
          </div>
        </section>

        {/* Tabuleiro do Jogo da Memória */}
        {!finished ? (
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {cards.map((card) => {
              const show = memorizing || card.isFlipped || card.isMatched;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={memorizing}
                  className={`h-24 sm:h-28 rounded-2xl border flex items-center justify-center text-center p-3 font-semibold text-xs sm:text-sm transition-all duration-300 transform relative overflow-hidden ${
                    show
                      ? card.isMatched
                        ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 scale-95"
                        : memorizing
                        ? "border-violet-300 bg-gradient-to-br from-violet-100 via-blue-50 to-cyan-100 text-blue-900 shadow-lg shadow-violet-500/10 dark:border-violet-700 dark:from-violet-950/60 dark:via-blue-950/40 dark:to-cyan-950/40 dark:text-blue-100"
                        : "border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-200 shadow-inner"
                      : "cursor-pointer border-neutral-200 bg-white hover:-translate-y-1 hover:border-blue-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 text-transparent dark:text-transparent"
                  }`}
                >
                  {show && <AreaIcon className={`absolute right-2 top-2 h-4 w-4 ${areaVisual.color} opacity-70`} />}
                  <span className={show ? "scale-100 opacity-100 transition-all" : "scale-50 opacity-0"}>
                    {card.content}
                  </span>
                  {!show && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-neutral-300 dark:text-neutral-700 font-bold text-xl select-none">
                      <AreaIcon className={`h-7 w-7 ${areaVisual.color} opacity-70`} />
                      <span className="text-[9px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600">{areaVisual.label}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </section>
        ) : (
          // Tela de fim de jogo
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center space-y-6 shadow-sm max-w-md mx-auto animate-in zoom-in-95 duration-200">
            <Trophy className="h-14 w-14 text-amber-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold">Excelente Memória!</h2>
              <p className="text-neutral-500 text-sm mt-1">
                Você pareou todos os termos em <span className="font-bold">{seconds}s</span> com {errors} erros.
              </p>
              <div className="mt-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 p-4 border border-blue-100 dark:border-blue-900/30 text-center">
                <span className="text-xs text-neutral-400 font-semibold block uppercase">Pontuação Final</span>
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">
                  {score} pts
                </span>
                {submitting ? (
                  <span className="text-[10px] text-neutral-400 block mt-1">Enviando score...</span>
                ) : (
                  <span className="text-[10px] text-emerald-600 block mt-1 font-bold">✓ Pontuação enviada ao Ranking!</span>
                )}
              </div>
            </div>

            <button
              onClick={() => startNewGame(area)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 text-sm font-bold shadow-sm transition-all text-center cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Jogar Novamente
            </button>

            <ShareGameCard gameLabel="Termos Pareados" score={score} scoreSuffix="pts" accentColor="#3B82F6" />
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
