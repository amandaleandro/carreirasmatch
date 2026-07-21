"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { Search, Trophy, RotateCcw, ArrowLeft, Timer } from "lucide-react";
import Link from "next/link";

const WORDS: Record<string, string[]> = {
  tecnologia: ["REACT", "PYTHON", "DOCKER", "GITHUB", "SERVIDOR", "DEBUG", "NUVEM", "CODIGO"],
  carreira: ["CURRICULO", "ENTREVISTA", "NETWORKING", "SALARIO", "VAGA", "FEEDBACK", "CARREIRA", "RECRUTADOR"],
  negocios: ["MARKETING", "VENDAS", "CLIENTE", "LIDERANCA", "ESTRATEGIA", "GESTAO", "PROJETO", "EQUIPE"],
};

const GRID_SIZE = 12;
const ROUND_SECONDS = 120;
const DIRECTIONS = [
  [0, 1], [0, -1], [1, 0], [-1, 0],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

type Cell = { r: number; c: number };
type Placement = { word: string; cells: Cell[] };

function randLetter() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

function buildGrid(words: string[]): { grid: string[][]; placements: Placement[] } {
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(""));
  const placements: Placement[] = [];

  const sorted = [...words].sort((a, b) => b.length - a.length);

  for (const word of sorted) {
    let placed = false;
    for (let attempt = 0; attempt < 300 && !placed; attempt++) {
      const [dr, dc] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const maxR = dr === 1 ? GRID_SIZE - word.length : dr === -1 ? word.length - 1 : GRID_SIZE - 1;
      const minR = dr === -1 ? word.length - 1 : 0;
      const maxC = dc === 1 ? GRID_SIZE - word.length : dc === -1 ? word.length - 1 : GRID_SIZE - 1;
      const minC = dc === -1 ? word.length - 1 : 0;
      if (maxR < minR || maxC < minC) continue;
      const r = minR + Math.floor(Math.random() * (maxR - minR + 1));
      const c = minC + Math.floor(Math.random() * (maxC - minC + 1));

      const cells: Cell[] = [];
      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const rr = r + dr * i;
        const cc = c + dc * i;
        const existing = grid[rr][cc];
        if (existing && existing !== word[i]) {
          fits = false;
          break;
        }
        cells.push({ r: rr, c: cc });
      }
      if (!fits) continue;

      cells.forEach((cell, i) => {
        grid[cell.r][cell.c] = word[i];
      });
      placements.push({ word, cells });
      placed = true;
    }
  }

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!grid[r][c]) grid[r][c] = randLetter();
    }
  }

  return { grid, placements };
}

function cellsToLine(a: Cell, b: Cell): Cell[] | null {
  const dr = b.r - a.r;
  const dc = b.c - a.c;
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  if (steps === 0) return [a];
  const sr = dr === 0 ? 0 : dr / Math.abs(dr);
  const sc = dc === 0 ? 0 : dc / Math.abs(dc);
  const cells: Cell[] = [];
  for (let i = 0; i <= steps; i++) {
    cells.push({ r: a.r + sr * i, c: a.c + sc * i });
  }
  return cells;
}

export default function CacaPalavrasPage() {
  const [area, setArea] = useState("tecnologia");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [grid, setGrid] = useState<string[][]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [anchor, setAnchor] = useState<Cell | null>(null);
  const [hover, setHover] = useState<Cell | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);

  const foundCells = useMemo(() => {
    const set = new Set<string>();
    placements.forEach((p) => {
      if (found.has(p.word)) p.cells.forEach((c) => set.add(`${c.r}-${c.c}`));
    });
    return set;
  }, [placements, found]);

  const previewCells = useMemo(() => {
    if (!anchor || !hover) return new Set<string>();
    const line = cellsToLine(anchor, hover);
    if (!line) return new Set<string>();
    return new Set(line.map((c) => `${c.r}-${c.c}`));
  }, [anchor, hover]);

  async function saveScore(s: number) {
    try {
      await fetch("/api/jogos/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "cacapalavras", area, score: s }),
      });
    } catch {
      /* deslogado */
    }
  }

  const finish = useCallback(
    (finalScore: number) => {
      setFinished(true);
      setStarted(false);
      void saveScore(finalScore);
    },
    [area]
  );

  function start() {
    const wordList = WORDS[area] ?? WORDS.tecnologia;
    const { grid: g, placements: p } = buildGrid(wordList);
    setGrid(g);
    setPlacements(p);
    setFound(new Set());
    setAnchor(null);
    setHover(null);
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setFinished(false);
    setStarted(true);
  }

  useEffect(() => {
    if (!started) return;
    if (timeLeft <= 0) {
      finish(score);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [started, timeLeft, finish, score]);

  function handleCellClick(cell: Cell) {
    if (!started) return;
    if (!anchor) {
      setAnchor(cell);
      setHover(cell);
      return;
    }
    const line = cellsToLine(anchor, cell);
    if (line) {
      const forward = line.map((c) => grid[c.r][c.c]).join("");
      const backward = [...forward].reverse().join("");
      const match = placements.find(
        (p) => !found.has(p.word) && (p.word === forward || p.word === backward)
      );
      if (match) {
        const nextFound = new Set(found);
        nextFound.add(match.word);
        setFound(nextFound);
        const gained = 100 + timeLeft * 2;
        const ns = score + gained;
        setScore(ns);
        if (nextFound.size === placements.length) {
          finish(ns);
        }
      }
    }
    setAnchor(null);
    setHover(null);
  }

  const allFound = placements.length > 0 && found.size === placements.length;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50">
      <PublicSiteHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 space-y-6">
        <header className="flex items-center justify-between">
          <Link href="/jogos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Hub
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-300 px-3 py-1 text-xs font-bold border border-orange-200 dark:border-orange-900/50">
            <Search className="h-3.5 w-3.5" />
            Caça-Palavras
          </div>
        </header>

        {!started && !finished && (
          <div className="space-y-6">
            <section className="flex flex-wrap gap-2 justify-center bg-neutral-200/40 dark:bg-neutral-900/40 p-1.5 rounded-2xl w-fit mx-auto border border-neutral-200 dark:border-neutral-800">
              {Object.keys(WORDS).map((k) => (
                <button key={k} onClick={() => setArea(k)} className={`rounded-xl px-4 py-2 text-xs font-bold transition-all uppercase tracking-wider ${area === k ? "bg-orange-500 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"}`}>
                  {k}
                </button>
              ))}
            </section>
            <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center space-y-4 shadow-sm">
              <p className="text-sm text-neutral-500">Encontre todas as palavras escondidas na grade em até <span className="font-bold">{ROUND_SECONDS}s</span>. Clique na primeira letra e depois na última letra da palavra.</p>
              <button onClick={start} className="w-full rounded-2xl bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 text-sm font-bold transition-all">
                Começar
              </button>
            </div>
          </div>
        )}

        {started && grid.length > 0 && (
          <div className="space-y-5">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="inline-flex items-center gap-1.5 text-orange-600 dark:text-orange-400"><Timer className="h-4 w-4" />{timeLeft}s</span>
              <span>{score} pts</span>
              <span className="text-neutral-500 font-semibold">{found.size}/{placements.length} palavras</span>
            </div>

            <div
              className="grid gap-0.5 select-none mx-auto w-fit"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
            >
              {grid.map((row, r) =>
                row.map((letter, c) => {
                  const key = `${r}-${c}`;
                  const isFound = foundCells.has(key);
                  const isPreview = previewCells.has(key);
                  return (
                    <button
                      key={key}
                      onClick={() => handleCellClick({ r, c })}
                      className={`h-7 w-7 md:h-8 md:w-8 text-xs md:text-sm font-bold rounded-md border transition-colors flex items-center justify-center ${
                        isFound
                          ? "bg-emerald-500 text-white border-emerald-600"
                          : isPreview
                          ? "bg-orange-200 dark:bg-orange-900/60 border-orange-400"
                          : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-orange-400"
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {placements.map((p) => (
                <span
                  key={p.word}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    found.has(p.word)
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-300 line-through"
                      : "bg-neutral-100 dark:bg-neutral-900 text-neutral-500 border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  {p.word}
                </span>
              ))}
            </div>
          </div>
        )}

        {finished && (
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center space-y-4 shadow-sm">
            <div className="h-14 w-14 rounded-full bg-orange-50 dark:bg-orange-950/50 text-orange-500 flex items-center justify-center mx-auto">
              <Trophy className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-black">{allFound ? "Todas encontradas!" : "Tempo esgotado!"}</h2>
            <p className="text-sm text-neutral-500">Você fez <span className="font-bold text-orange-600">{score}</span> pontos, encontrando {found.size} de {placements.length} palavras.</p>
            <button onClick={start} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 text-sm font-bold transition-all">
              <RotateCcw className="h-4 w-4" />
              Jogar de novo
            </button>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
