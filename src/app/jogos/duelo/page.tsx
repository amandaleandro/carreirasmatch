"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PublicSiteHeader } from "@/components/public-site-header";
import { CareerGameContext } from "@/components/career-game-context";
import { SiteFooter } from "@/components/site-footer";
import {
  Swords,
  Bot,
  UserCheck,
  Trophy,
  RotateCcw,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { ShareGameCard } from "@/components/share-game-card";
import { addXp } from "@/lib/gamification";
import { gameAreaFromSlug } from "@/lib/game-area";
import { normalizeGamePhase } from "@/lib/game-progression";

type Question = {
  q: string;
  options: string[];
  correct: number;
};

const DUEL_QUESTIONS: Question[] = [
  {
    q: "Qual conceito representa a capacidade de se adaptar a mudanças e superar adversidades no trabalho?",
    options: ["Resiliência", "Procrastinação", "Inércia", "Intransigência"],
    correct: 0,
  },
  {
    q: "Em metodologias ágeis (Scrum), como é chamada a reunião diária rápida de 15 minutos?",
    options: ["Sprint Review", "Daily Meeting / Standup", "Backlog Grooming", "Retrospectiva"],
    correct: 1,
  },
  {
    q: "O que a sigla KPI significa na gestão de desempenho corporativo?",
    options: [
      "Key Performance Indicator",
      "Knowledge Process Interface",
      "Kernel Programming Index",
      "Key Protocol Instance",
    ],
    correct: 0,
  },
  {
    q: "Qual postura é recomendada em uma entrevista de emprego ao falar sobre empregos anteriores?",
    options: [
      "Criticar abertamente ex-chefes",
      "Focar nas lições aprendidas, conquistas e crescimento",
      "Inventar experiências falsas",
      "Evitar dar qualquer detalhe de projetos",
    ],
    correct: 1,
  },
  {
    q: "No Marketing Digital, qual métrica mede a taxa de rejeição de visitantes de uma página web?",
    options: ["Bounce Rate", "CTR", "ROAS", "LTV"],
    correct: 0,
  },
  {
    q: "Qual atitude ajuda a transformar um feedback em melhoria prática?",
    options: ["Ignorar o comentário", "Definir uma ação e acompanhar o resultado", "Culpar outra pessoa", "Evitar novas avaliações"],
    correct: 1,
  },
  {
    q: "Em uma planilha, qual recurso ajuda a encontrar rapidamente um valor relacionado a uma chave?",
    options: ["Filtro ou busca", "Alterar a cor da aba", "Fechar o arquivo", "Aumentar o zoom"],
    correct: 0,
  },
  {
    q: "O que uma boa comunicação profissional deve fazer quando há um atraso?",
    options: ["Esconder o problema", "Avisar o impacto e propor um novo prazo", "Esperar alguém descobrir", "Cancelar sem explicar"],
    correct: 1,
  },
  {
    q: "Qual é uma evidência forte de uma habilidade no currículo?",
    options: ["Um adjetivo sem exemplo", "Um projeto ou resultado concreto", "Uma lista enorme de interesses", "Uma promessa de aprendizado"],
    correct: 1,
  },
  {
    q: "Antes de executar uma tarefa importante, qual prática reduz retrabalho?",
    options: ["Confirmar objetivo e critérios de entrega", "Começar sem ler o pedido", "Fazer várias versões sem prioridade", "Evitar perguntas"],
    correct: 0,
  },
];

export default function DueloGamePage() {
  const searchParams = useSearchParams();
  const [area] = useState(() => gameAreaFromSlug(searchParams.get("area"), "carreira"));
  const [phase] = useState(() => normalizeGamePhase(searchParams.get("fase")));
  const [personalizedQuestions, setPersonalizedQuestions] = useState<Question[] | null>(null);
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [botHp, setBotHp] = useState<number>(100);

  const [roundIdx, setRoundIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);

  const [statusMessage, setStatusMessage] = useState<string>("Escolha seu ataque!");

  useEffect(() => {
    let active = true;
    fetch(`/api/jogos/personalizados?game=duelo&fase=${phase}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data: { questions?: Question[] } | null) => {
        // Guard against short packs (generic areas without a full term bank)
        // repeating mid-duel and feeling like a stuck phase.
        if (active && data?.questions && data.questions.length >= 4) {
          setPersonalizedQuestions(data.questions);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [phase]);

  // Fase sobe a dificuldade: menos rodadas para vencer e contra-ataques mais fortes do bot.
  const roundsForPhase = phase === 1 ? 6 : phase === 2 ? 8 : 10;
  const botDamageForPhase = phase === 1 ? 20 : phase === 2 ? 25 : 34;

  const allQuestions = personalizedQuestions ?? DUEL_QUESTIONS;
  const questions = allQuestions.slice(0, roundsForPhase);
  const currentQ = questions[roundIdx % questions.length];

  function startDuel() {
    setPlayerHp(100);
    setBotHp(100);
    setRoundIdx(0);
    setSelectedOpt(null);
    setAnswered(false);
    setFinished(false);
    setStatusMessage("Duelo iniciado! Responda mais rápido que a IA!");
  }

  function handleOptionClick(index: number) {
    if (answered) return;
    setSelectedOpt(index);
    setAnswered(true);

    if (index === currentQ.correct) {
      // Player Hit Bot
      const nextBotHp = Math.max(0, botHp - 25);
      setBotHp(nextBotHp);
      setStatusMessage("⚡ ATAQUE CRÍTICO! Você acertou e causou 25 de dano ao MatchBot!");

      if (nextBotHp <= 0) {
        endGame(true);
        return;
      }
    } else {
      // Bot Hit Player
      const nextPlayerHp = Math.max(0, playerHp - botDamageForPhase);
      setPlayerHp(nextPlayerHp);
      setStatusMessage(`💥 CONTRA-ATAQUE! O MatchBot aproveitou seu erro e te causou ${botDamageForPhase} de dano!`);

      if (nextPlayerHp <= 0) {
        endGame(false);
        return;
      }
    }
  }

  function handleNextRound() {
    setSelectedOpt(null);
    setAnswered(false);

    if (roundIdx + 1 < questions.length && playerHp > 0 && botHp > 0) {
      setRoundIdx((r) => r + 1);
      setStatusMessage("Nova Rodada! Concentre-se no próximo golpe.");
    } else {
      endGame(playerHp > botHp);
    }
  }

  function endGame(playerWon: boolean) {
    setFinished(true);
    void fetch("/api/jogos/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game: "duelo", area, score: playerWon ? 300 : 100 }),
    }).catch(() => {});
    if (playerWon) {
      addXp(300);
    } else {
      addXp(100);
    }
  }

  const isPlayerWinner = playerHp > botHp;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-white font-sans">
      <PublicSiteHeader />
      <div className="mx-auto w-full max-w-lg px-4 pt-4">
        <CareerGameContext game="duelo" />
      </div>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link
            href="/jogos"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Jogos
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Swords className="h-3.5 w-3.5" />
            Batalha 1v1 vs IA
          </div>
        </header>

        {/* Arena de Duelo (HP Bars em Tempo Real) */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="grid grid-cols-2 gap-4 items-center">
            {/* Player */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4" /> Você
                </span>
                <span>{playerHp} HP</span>
              </div>
              <div className="h-3 rounded-full bg-neutral-800 overflow-hidden border border-neutral-700/50">
                <div
                  className="h-full bg-blue-500 transition-all duration-500 rounded-full"
                  style={{ width: `${playerHp}%` }}
                />
              </div>
            </div>

            {/* MatchBot IA */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                <span className="flex items-center gap-1.5">
                  <Bot className="h-4 w-4" /> MatchBot IA
                </span>
                <span>{botHp} HP</span>
              </div>
              <div className="h-3 rounded-full bg-neutral-800 overflow-hidden border border-neutral-700/50">
                <div
                  className="h-full bg-rose-500 transition-all duration-500 rounded-full"
                  style={{ width: `${botHp}%` }}
                />
              </div>
            </div>
          </div>

          {/* Banner de Status do Duelo */}
          <div className="text-center bg-neutral-950/60 py-2.5 px-4 rounded-2xl border border-neutral-800 text-xs font-extrabold text-amber-400">
            {statusMessage}
          </div>
        </section>

        {/* Conteúdo do Duelo */}
        {!finished ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <header className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-3">
              <span>Rodada {roundIdx + 1} de {questions.length}</span>
              <span className="font-bold text-purple-400 uppercase">Perguntas Relâmpago</span>
            </header>

            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {currentQ.q}
            </h3>

            <div className="grid gap-3 pt-2">
              {currentQ.options.map((opt, i) => {
                let borderClass = "border-neutral-800 hover:border-purple-500";
                let bgClass = "bg-neutral-950";
                let icon = null;

                if (answered) {
                  if (i === currentQ.correct) {
                    borderClass = "border-emerald-500";
                    bgClass = "bg-emerald-950/30";
                    icon = <CheckCircle className="h-5 w-5 text-emerald-400" />;
                  } else if (i === selectedOpt) {
                    borderClass = "border-rose-500";
                    bgClass = "bg-rose-950/30";
                    icon = <XCircle className="h-5 w-5 text-rose-400" />;
                  } else {
                    borderClass = "border-neutral-800 opacity-50";
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={answered}
                    onClick={() => handleOptionClick(i)}
                    className={`rounded-2xl border p-4 text-left font-medium text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${borderClass} ${bgClass}`}
                  >
                    <span>{opt}</span>
                    {icon}
                  </button>
                );
              })}
            </div>

            {answered && (
              <button
                onClick={handleNextRound}
                className="w-full rounded-2xl bg-purple-600 hover:bg-purple-500 text-white py-3 text-sm font-bold shadow-lg transition-all text-center cursor-pointer"
              >
                {roundIdx + 1 === questions.length ? "Ver Vencedor da Batalha" : "Próximo Golpe"}
              </button>
            )}
          </div>
        ) : (
          /* Game Over Screen */
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto text-3xl font-bold border border-purple-500/20">
              <Trophy className="h-8 w-8 text-amber-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">
                {isPlayerWinner ? "Vitória Épica! 🏆" : "Derrota no Duelo!"}
              </h2>
              <p className="text-neutral-400 text-xs">
                {isPlayerWinner
                  ? "Você derrotou o MatchBot IA e conquistou +300 Bônus de XP para seu nível de perfil!"
                  : "O MatchBot venceu desta vez. Treine seus conhecimentos e tente novamente!"}
              </p>
            </div>

            <button
              onClick={startDuel}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white px-5 py-3.5 text-sm font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Revanche contra a IA
            </button>

            <ShareGameCard
              gameLabel="Batalha 1v1 vs IA"
              score={isPlayerWinner ? 300 : 100}
              scoreSuffix="XP"
              accentColor="#A855F7"
            />
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
