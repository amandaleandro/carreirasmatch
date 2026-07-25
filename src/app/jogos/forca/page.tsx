"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { Skull, Trophy, RotateCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ShareGameCard } from "@/components/share-game-card";
import { gameAreaFromSlug } from "@/lib/game-area";

// Termos (sem acento) + dica, por área. Espaços são revelados automaticamente.
const TERMS: Record<string, { word: string; hint: string }[]> = {
  tecnologia: [
    { word: "ALGORITMO", hint: "Sequência de passos para resolver um problema" },
    { word: "SERVIDOR", hint: "Máquina que hospeda aplicações e responde requisições" },
    { word: "BANCO DE DADOS", hint: "Onde os dados ficam armazenados de forma estruturada" },
    { word: "FRONTEND", hint: "A parte visual com que o usuário interage" },
    { word: "DEPLOY", hint: "Colocar a aplicação em produção" },
    { word: "VERSIONAMENTO", hint: "Controle de mudanças no código (ex: Git)" },
  ],
  negocios: [
    { word: "FLUXO DE CAIXA", hint: "Entradas e saídas de dinheiro da empresa" },
    { word: "MARGEM", hint: "Diferença entre preço de venda e custo" },
    { word: "INVESTIDOR", hint: "Quem aporta capital esperando retorno" },
    { word: "PROSPECCAO", hint: "Busca ativa por novos clientes" },
    { word: "FRANQUIA", hint: "Modelo de expansão licenciando a marca" },
  ],
  marketing: [
    { word: "PERSONA", hint: "Representação semifictícia do cliente ideal" },
    { word: "ENGAJAMENTO", hint: "Interação do público com o conteúdo" },
    { word: "CONVERSAO", hint: "Quando o visitante realiza a ação desejada" },
    { word: "INFLUENCIADOR", hint: "Criador que promove marcas para sua audiência" },
    { word: "ORGANICO", hint: "Alcance sem investir em anúncios" },
  ],
};

const MAX_WRONG = 6;
const ROUND = 5;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZÇ";

export default function ForcaPage() {
  const searchParams = useSearchParams();
  const [area, setArea] = useState(() => gameAreaFromSlug(searchParams.get("area")));
  const [pool, setPool] = useState<{ word: string; hint: string }[]>([]);
  const [idx, setIdx] = useState(0);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState(0);
  const [total, setTotal] = useState(0);
  const [finished, setFinished] = useState(false);

  const startRound = useCallback((a: string) => {
    const list = [...(TERMS[a] ?? TERMS.tecnologia)].sort(() => Math.random() - 0.5).slice(0, ROUND);
    setPool(list);
    setIdx(0);
    setGuessed(new Set());
    setWrong(0);
    setTotal(0);
    setFinished(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => startRound(area));
  }, [area, startRound]);

  async function saveScore(score: number) {
    try {
      await fetch("/api/jogos/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "forca", area, score }),
      });
    } catch {
      /* deslogado: segue sem salvar */
    }
  }

  const currentWord = pool[idx]?.word ?? "";
  const letters = currentWord.replace(/ /g, "").split("");
  const solved = letters.every((l) => guessed.has(l));
  const dead = wrong >= MAX_WRONG;
  const roundDone = solved || dead;

  function guess(letter: string) {
    if (roundDone || guessed.has(letter)) return;
    const next = new Set(guessed);
    next.add(letter);
    setGuessed(next);
    if (!currentWord.includes(letter)) setWrong((w) => w + 1);
  }

  function nextWord() {
    // Pontua a palavra recém-resolvida: menos erros = mais pontos.
    const gained = solved ? Math.max(200, 1000 - wrong * 150) : 0;
    const newTotal = total + gained;
    setTotal(newTotal);
    if (idx + 1 >= pool.length) {
      setFinished(true);
      void saveScore(newTotal);
    } else {
      setIdx((i) => i + 1);
      setGuessed(new Set());
      setWrong(0);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50">
      <PublicSiteHeader />
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-8 space-y-6">
        <header className="flex items-center justify-between">
          <Link href="/jogos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Hub
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 px-3 py-1 text-xs font-bold border border-rose-200 dark:border-rose-900/50">
            <Skull className="h-3.5 w-3.5" />
            Forca
          </div>
        </header>

        <section className="flex flex-wrap gap-2 justify-center bg-neutral-200/40 dark:bg-neutral-900/40 p-1.5 rounded-2xl w-fit mx-auto border border-neutral-200 dark:border-neutral-800">
          {Object.keys(TERMS).map((k) => (
            <button key={k} onClick={() => setArea(k)} className={`rounded-xl px-4 py-2 text-xs font-bold transition-all uppercase tracking-wider ${area === k ? "bg-rose-500 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"}`}>
              {k}
            </button>
          ))}
        </section>

        {finished ? (
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center space-y-4 shadow-sm">
            <div className="h-14 w-14 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mx-auto">
              <Trophy className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-black">Fim da rodada!</h2>
            <p className="text-sm text-neutral-500">Você fez <span className="font-bold text-rose-600">{total}</span> pontos em {pool.length} palavras.</p>
            <button onClick={() => startRound(area)} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 text-sm font-bold transition-all">
              <RotateCcw className="h-4 w-4" />
              Jogar de novo
            </button>

            <ShareGameCard gameLabel="Forca Profissional" score={total} scoreSuffix="pts" accentColor="#F43F5E" />
          </div>
        ) : (
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-5 shadow-sm">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>Palavra {idx + 1} de {pool.length}</span>
              <span>Erros: <span className={wrong >= MAX_WRONG - 1 ? "text-rose-500 font-bold" : "font-bold"}>{wrong}/{MAX_WRONG}</span> · {total} pts</span>
            </div>

            {/* Bonequinho por erros */}
            <div className="text-center text-4xl h-10">{"❌".repeat(wrong)}{"⭕".repeat(Math.max(0, MAX_WRONG - wrong))}</div>

            <p className="text-center text-xs text-neutral-500 italic">Dica: {pool[idx]?.hint}</p>

            {/* Palavra */}
            <div className="flex flex-wrap gap-1.5 justify-center py-2">
              {currentWord.split("").map((ch, i) =>
                ch === " " ? (
                  <div key={i} className="w-4" />
                ) : (
                  <div key={i} className="h-11 w-9 border-b-4 border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-2xl font-black">
                    {guessed.has(ch) || roundDone ? ch : ""}
                  </div>
                )
              )}
            </div>

            {roundDone ? (
              <div className="text-center space-y-3">
                <p className={`font-bold ${solved ? "text-emerald-600" : "text-rose-600"}`}>{solved ? "Acertou! ✅" : `Era: ${currentWord}`}</p>
                <button onClick={nextWord} className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm font-bold transition-colors">
                  {idx + 1 >= pool.length ? "Ver resultado" : "Próxima palavra"}
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 justify-center">
                {ALPHABET.split("").map((l) => {
                  const used = guessed.has(l);
                  const hit = used && currentWord.includes(l);
                  return (
                    <button
                      key={l}
                      onClick={() => guess(l)}
                      disabled={used}
                      className={`h-9 w-9 rounded-lg text-sm font-bold transition-colors ${used ? (hit ? "bg-emerald-500 text-white" : "bg-neutral-300 dark:bg-neutral-800 text-neutral-400") : "bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-100 dark:hover:bg-rose-950/40"}`}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
