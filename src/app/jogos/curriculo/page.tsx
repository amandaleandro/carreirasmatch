"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { FileText, Trophy, RotateCcw, ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";
import { ShareGameCard } from "@/components/share-game-card";
import { normalizeGamePhase } from "@/lib/game-progression";

// Cada perfil tem as seções na ORDEM IDEAL. O jogo embaralha e o jogador reordena.
const PROFILES: Record<string, { title: string; steps: string[] }[]> = {
  "recem-formado": [
    {
      title: "Currículo de recém-formado",
      steps: ["Dados de contato", "Objetivo profissional", "Formação acadêmica", "Estágios e projetos", "Habilidades", "Idiomas"],
    },
    {
      title: "Currículo de estagiário buscando efetivação",
      steps: ["Dados de contato", "Resumo curto", "Estágio atual", "Formação acadêmica", "Cursos extracurriculares", "Habilidades"],
    },
  ],
  experiente: [
    {
      title: "Currículo de profissional experiente",
      steps: ["Dados de contato", "Resumo profissional", "Experiência profissional", "Formação acadêmica", "Habilidades", "Certificações"],
    },
    {
      title: "Currículo de gestor sênior",
      steps: ["Dados de contato", "Resumo executivo", "Experiência profissional", "Principais resultados", "Formação acadêmica", "Certificações"],
    },
  ],
  transicao: [
    {
      title: "Currículo de transição de carreira",
      steps: ["Dados de contato", "Resumo profissional", "Habilidades transferíveis", "Experiência profissional", "Cursos complementares", "Formação acadêmica"],
    },
    {
      title: "Currículo de quem volta ao mercado",
      steps: ["Dados de contato", "Resumo profissional", "Experiência mais recente", "Habilidades", "Formação acadêmica", "Disponibilidade"],
    },
  ],
};

const ROUND = 3;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CurriculoPage() {
  const searchParams = useSearchParams();
  const [area, setArea] = useState("recem-formado");
  const [phase] = useState(() => normalizeGamePhase(searchParams.get("fase")));
  const [pool, setPool] = useState<{ title: string; steps: string[] }[]>([]);
  const [idx, setIdx] = useState(0);
  const [order, setOrder] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [total, setTotal] = useState(0);
  const [finished, setFinished] = useState(false);

  const startRound = useCallback((a: string) => {
    const source = PROFILES[a] ?? PROFILES["recem-formado"];
    const roundSize = phase === 1 ? 1 : phase === 2 ? 2 : ROUND;
    const list = shuffle(source).slice(0, Math.min(roundSize, source.length));
    setPool(list);
    setIdx(0);
    setOrder(list[0] ? shuffle(list[0].steps) : []);
    setChecked(false);
    setTotal(0);
    setFinished(false);
  }, [phase]);

  useEffect(() => {
    queueMicrotask(() => startRound(area));
  }, [area, startRound]);

  async function saveScore(score: number) {
    try {
      await fetch("/api/jogos/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "curriculo", area, score }),
      });
    } catch {
      /* deslogado */
    }
  }

  const correctSteps = pool[idx]?.steps ?? [];

  function move(from: number, dir: -1 | 1) {
    if (checked) return;
    const to = from + dir;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    [next[from], next[to]] = [next[to], next[from]];
    setOrder(next);
  }

  const correctCount = order.filter((s, i) => s === correctSteps[i]).length;

  function check() {
    setChecked(true);
  }

  function nextProfile() {
    const gained = correctSteps.length ? Math.round((correctCount / correctSteps.length) * 1000) : 0;
    const newTotal = total + gained;
    setTotal(newTotal);
    if (idx + 1 >= pool.length) {
      setFinished(true);
      void saveScore(newTotal);
    } else {
      const ni = idx + 1;
      setIdx(ni);
      setOrder(shuffle(pool[ni].steps));
      setChecked(false);
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
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-300 px-3 py-1 text-xs font-bold border border-cyan-200 dark:border-cyan-900/50">
            <FileText className="h-3.5 w-3.5" />
            Monte o Currículo
          </div>
        </header>

        <section className="hidden">
          {Object.keys(PROFILES).map((k) => (
            <button key={k} onClick={() => setArea(k)} className={`rounded-xl px-4 py-2 text-xs font-bold transition-all uppercase tracking-wider ${area === k ? "bg-cyan-500 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"}`}>
              {k.replace("-", " ")}
            </button>
          ))}
        </section>

        {finished ? (
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center space-y-4 shadow-sm">
            <div className="h-14 w-14 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-cyan-500 flex items-center justify-center mx-auto">
              <Trophy className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-black">Currículo montado!</h2>
            <p className="text-sm text-neutral-500">Você fez <span className="font-bold text-cyan-600">{total}</span> pontos em {pool.length} currículos.</p>
            <button onClick={() => startRound(area)} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-3 text-sm font-bold transition-all">
              <RotateCcw className="h-4 w-4" />
              Jogar de novo
            </button>

            <ShareGameCard gameLabel="Monte o Currículo" score={total} scoreSuffix="pts" accentColor="#06B6D4" />
          </div>
        ) : (
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 shadow-sm">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>Currículo {idx + 1} de {pool.length}</span>
              <span className="font-bold">{total} pts</span>
            </div>
            <h3 className="text-base font-bold text-center">{pool[idx]?.title}</h3>
            <p className="text-center text-xs text-neutral-500">Coloque as seções na ordem ideal.</p>

            <ol className="space-y-2">
              {order.map((step, i) => {
                const right = checked && step === correctSteps[i];
                const wrong = checked && step !== correctSteps[i];
                return (
                  <li key={step} className={`flex items-center gap-2 rounded-xl border p-3 ${right ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20" : wrong ? "border-rose-400 bg-rose-50/50 dark:bg-rose-950/20" : "border-neutral-200 dark:border-neutral-800"}`}>
                    <span className="h-6 w-6 shrink-0 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="flex-1 text-sm font-medium">{step}</span>
                    {!checked && (
                      <span className="flex flex-col">
                        <button onClick={() => move(i, -1)} disabled={i === 0} className="text-neutral-400 hover:text-cyan-600 disabled:opacity-30" aria-label="Subir"><ChevronUp className="h-4 w-4" /></button>
                        <button onClick={() => move(i, 1)} disabled={i === order.length - 1} className="text-neutral-400 hover:text-cyan-600 disabled:opacity-30" aria-label="Descer"><ChevronDown className="h-4 w-4" /></button>
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>

            {checked ? (
              <div className="text-center space-y-3">
                <p className="text-sm font-bold text-cyan-600">{correctCount} de {correctSteps.length} na posição certa</p>
                <button onClick={nextProfile} className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm font-bold transition-colors">
                  {idx + 1 >= pool.length ? "Ver resultado" : "Próximo currículo"}
                </button>
              </div>
            ) : (
              <button onClick={check} className="w-full rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white py-3 text-sm font-bold transition-colors">
                Conferir
              </button>
            )}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
