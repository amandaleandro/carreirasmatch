"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { PublicSiteHeader } from "@/components/public-site-header";
import { CareerGameContext } from "@/components/career-game-context";
import { SiteFooter } from "@/components/site-footer";
import { Type, Trophy, RotateCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ShareGameCard } from "@/components/share-game-card";
import { gameAreaFromSlug } from "@/lib/game-area";
import { normalizeGamePhase } from "@/lib/game-progression";

// Palavras de 5 letras, sem acento (o teclado do jogo é A-Z). Por área.
const WORDS: Record<string, string[]> = {
  tecnologia: ["CACHE", "ARRAY", "LINUX", "PROXY", "TOKEN", "QUERY", "STACK", "DEBUG", "PIXEL", "BYTES"],
  negocios: ["LUCRO", "METAS", "MARCA", "VENDA", "PRAZO", "SOCIO", "CUSTO", "CAIXA", "LEADS", "NICHO"],
  marketing: ["FUNIL", "POSTS", "VIRAL", "BRAND", "LEADS", "COPYS", "ALCAN", "CLICK", "EMAIL", "VIDEO"],
};

const MAX_TRIES = 6;
const WORD_LEN = 5;

type LetterState = "correct" | "present" | "absent" | "empty";

// Avalia uma tentativa contra o alvo, tratando letras repetidas como no Wordle.
function evaluate(guess: string, target: string): LetterState[] {
  const result: LetterState[] = Array(WORD_LEN).fill("absent");
  const counts: Record<string, number> = {};
  for (const ch of target) counts[ch] = (counts[ch] ?? 0) + 1;
  // 1ª passada: acertos exatos
  for (let i = 0; i < WORD_LEN; i++) {
    if (guess[i] === target[i]) {
      result[i] = "correct";
      counts[guess[i]]--;
    }
  }
  // 2ª passada: presentes em outra posição
  for (let i = 0; i < WORD_LEN; i++) {
    if (result[i] === "correct") continue;
    if (counts[guess[i]] > 0) {
      result[i] = "present";
      counts[guess[i]]--;
    }
  }
  return result;
}

const KEYS = ["QWERTYUIOP", "ASDFGHJKLÇ", "ZXCVBNM"];

export default function TermoPage() {
  const searchParams = useSearchParams();
  const [area] = useState(() => gameAreaFromSlug(searchParams.get("area")));
  const [phase] = useState(() => normalizeGamePhase(searchParams.get("fase")));
  const [target, setTarget] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [finished, setFinished] = useState(false);
  const [won, setWon] = useState(false);
  const [msg, setMsg] = useState("");

  const newGame = useCallback((a: string) => {
    const fullList = WORDS[a] ?? WORDS.tecnologia;
    const list = fullList.slice(0, phase === 1 ? 5 : phase === 2 ? 8 : fullList.length);
    setTarget(list[Math.floor(Math.random() * list.length)]);
    setGuesses([]);
    setCurrent("");
    setFinished(false);
    setWon(false);
    setMsg("");
  }, [phase]);

  useEffect(() => {
    queueMicrotask(() => newGame(area));
  }, [area, newGame]);

  async function saveScore(score: number) {
    try {
      await fetch("/api/jogos/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "termo", area, score }),
      });
    } catch {
      /* deslogado: score não salva, jogo segue */
    }
  }

  const submit = useCallback(() => {
    if (finished) return;
    if (current.length !== WORD_LEN) {
      setMsg("A palavra tem 5 letras.");
      return;
    }
    const next = [...guesses, current];
    setGuesses(next);
    setCurrent("");
    setMsg("");
    if (current === target) {
      setWon(true);
      setFinished(true);
      // Menos tentativas = mais pontos (1 tentativa = 1200, 6 = 200).
      void saveScore((MAX_TRIES - next.length + 1) * 200);
    } else if (next.length >= MAX_TRIES) {
      setFinished(true);
      void saveScore(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, guesses, target, finished, area]);

  const press = useCallback(
    (key: string) => {
      if (finished) return;
      if (key === "ENTER") return submit();
      if (key === "DEL") return setCurrent((c) => c.slice(0, -1));
      if (/^[A-ZÇ]$/.test(key)) setCurrent((c) => (c.length < WORD_LEN ? c + key : c));
    },
    [finished, submit]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key.toUpperCase();
      if (k === "ENTER") press("ENTER");
      else if (k === "BACKSPACE") press("DEL");
      else if (/^[A-ZÇ]$/.test(k)) press(k);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  // Estado agregado de cada tecla (pra colorir o teclado).
  const keyState: Record<string, LetterState> = {};
  for (const g of guesses) {
    const ev = evaluate(g, target);
    for (let i = 0; i < WORD_LEN; i++) {
      const prev = keyState[g[i]];
      const s = ev[i];
      if (s === "correct" || (s === "present" && prev !== "correct") || (s === "absent" && !prev)) {
        keyState[g[i]] = s;
      }
    }
  }

  const cellColor = (s: LetterState) =>
    s === "correct"
      ? "bg-emerald-500 border-emerald-500 text-white"
      : s === "present"
        ? "bg-amber-500 border-amber-500 text-white"
        : s === "absent"
          ? "bg-neutral-400 dark:bg-neutral-700 border-neutral-400 dark:border-neutral-700 text-white"
          : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700";

  const keyColor = (k: string) => {
    const s = keyState[k];
    if (!s) return "bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100";
    return cellColor(s);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50">
      <PublicSiteHeader />
      <div className="mx-auto w-full max-w-lg px-4 pt-4">
        <CareerGameContext game="termo" />
      </div>
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-8 space-y-6">
        <header className="flex items-center justify-between">
          <Link href="/jogos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Hub
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 px-3 py-1 text-xs font-bold border border-emerald-200 dark:border-emerald-900/50">
            <Type className="h-3.5 w-3.5" />
            Termo
          </div>
        </header>

        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          Trilha personalizada · {area} · Fase {phase}
        </div>

        {/* Grade */}
        <div className="grid grid-rows-6 gap-1.5 justify-center">
          {Array.from({ length: MAX_TRIES }).map((_, row) => {
            const guess = guesses[row];
            const isCurrent = row === guesses.length && !finished;
            const ev = guess ? evaluate(guess, target) : null;
            return (
              <div key={row} className="flex gap-1.5">
                {Array.from({ length: WORD_LEN }).map((__, col) => {
                  const ch = guess ? guess[col] : isCurrent ? current[col] ?? "" : "";
                  const state: LetterState = ev ? ev[col] : "empty";
                  return (
                    <div key={col} className={`h-12 w-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold uppercase ${cellColor(state)}`}>
                      {ch}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {msg && <p className="text-center text-sm font-semibold text-red-500">{msg}</p>}

        {finished ? (
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 text-center space-y-4 shadow-sm">
            <div className="h-14 w-14 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center mx-auto">
              <Trophy className="h-7 w-7" />
            </div>
            <p className="font-bold text-lg">{won ? "Acertou! 🎉" : "Não foi dessa vez"}</p>
            <p className="text-sm text-neutral-500">A palavra era <span className="font-bold text-neutral-900 dark:text-white">{target}</span>.</p>
            <button onClick={() => newGame(area)} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-sm font-bold transition-all">
              <RotateCcw className="h-4 w-4" />
              Nova Palavra
            </button>

            <ShareGameCard
              gameLabel="Termo"
              score={won ? (MAX_TRIES - guesses.length + 1) * 200 : 0}
              scoreSuffix="pts"
              accentColor="#10B981"
            />
          </div>
        ) : (
          /* Teclado */
          <div className="space-y-1.5">
            {KEYS.map((row, i) => (
              <div key={i} className="flex justify-center gap-1.5">
                {i === 2 && (
                  <button onClick={() => press("ENTER")} className="rounded-lg px-2 text-[10px] font-bold bg-emerald-600 text-white">
                    ENTER
                  </button>
                )}
                {row.split("").map((k) => (
                  <button key={k} onClick={() => press(k)} className={`h-11 w-8 rounded-lg text-sm font-bold transition-colors ${keyColor(k)}`}>
                    {k}
                  </button>
                ))}
                {i === 2 && (
                  <button onClick={() => press("DEL")} className="rounded-lg px-2 text-[10px] font-bold bg-neutral-400 dark:bg-neutral-700 text-white">
                    ⌫
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
