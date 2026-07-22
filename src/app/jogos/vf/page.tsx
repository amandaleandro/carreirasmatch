"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { Scale, Trophy, RotateCcw, ArrowLeft, Check, X, Timer } from "lucide-react";
import Link from "next/link";
import { ShareGameCard } from "@/components/share-game-card";

type Fact = { s: string; t: boolean; e: string };

const FACTS: Record<string, Fact[]> = {
  carreira: [
    { s: "Colocar hobbies no currículo é sempre obrigatório.", t: false, e: "É opcional; só ajuda se for relevante para a vaga." },
    { s: "Enviar carta de apresentação pode aumentar suas chances em algumas vagas.", t: true, e: "Demonstra interesse e contextualiza sua candidatura." },
    { s: "Mentir sobre experiência é uma estratégia segura para conseguir emprego.", t: false, e: "Costuma ser descoberto e queima sua reputação." },
    { s: "Fazer perguntas ao entrevistador demonstra interesse.", t: true, e: "Mostra preparo e engajamento com a vaga." },
    { s: "O LinkedIn é irrelevante para recrutadores hoje em dia.", t: false, e: "É uma das principais ferramentas de recrutamento." },
    { s: "Networking pode abrir portas que uma candidatura tradicional não abre.", t: true, e: "Boa parte das vagas é preenchida por indicação." },
  ],
  tecnologia: [
    { s: "HTML é uma linguagem de programação completa.", t: false, e: "HTML é linguagem de marcação, não de programação." },
    { s: "Um bom teste automatizado ajuda a evitar regressões.", t: true, e: "Testes pegam quebras antes de chegarem à produção." },
    { s: "HTTPS criptografa a comunicação entre navegador e servidor.", t: true, e: "Usa TLS para proteger os dados em trânsito." },
    { s: "Mais linhas de código sempre significam software melhor.", t: false, e: "Simplicidade e clareza geralmente valem mais." },
    { s: "Git serve para versionar e colaborar no código.", t: true, e: "É o sistema de controle de versão mais usado." },
  ],
  mercado: [
    { s: "Salário é o único fator que importa ao escolher um emprego.", t: false, e: "Cultura, crescimento e equilíbrio também pesam muito." },
    { s: "Soft skills são cada vez mais valorizadas pelas empresas.", t: true, e: "Comunicação e colaboração são diferenciais." },
    { s: "Trabalho remoto eliminou totalmente as vagas presenciais.", t: false, e: "Modelos híbrido e presencial seguem fortes." },
    { s: "Aprender continuamente é importante em quase toda carreira.", t: true, e: "O mercado muda rápido e exige atualização." },
  ],
};

const ROUND_SECONDS = 45;

export default function VfPage() {
  const [area, setArea] = useState("carreira");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [fact, setFact] = useState<Fact | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState<null | { ok: boolean; e: string }>(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const scoreRef = useRef(0);

  const pick = useCallback(
    (a: string) => {
      const list = FACTS[a] ?? FACTS.carreira;
      setFact(list[Math.floor(Math.random() * list.length)]);
    },
    []
  );

  async function saveScore(s: number) {
    try {
      await fetch("/api/jogos/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "vf", area, score: s }),
      });
    } catch {
      /* deslogado */
    }
  }

  const finish = useCallback(() => {
    setFinished(true);
    setStarted(false);
    void saveScore(scoreRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area]);

  function start() {
    setScore(0);
    scoreRef.current = 0;
    setCombo(0);
    setBest(0);
    setFeedback(null);
    setTimeLeft(ROUND_SECONDS);
    setFinished(false);
    setStarted(true);
    pick(area);
  }

  useEffect(() => {
    if (!started) return;
    if (timeLeft <= 0) {
      finish();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [started, timeLeft, finish]);

  function answer(choice: boolean) {
    if (!fact || feedback) return;
    const ok = choice === fact.t;
    if (ok) {
      const gained = 100 + combo * 20;
      const ns = score + gained;
      setScore(ns);
      scoreRef.current = ns;
      const nc = combo + 1;
      setCombo(nc);
      setBest((b) => Math.max(b, nc));
    } else {
      setCombo(0);
    }
    setFeedback({ ok, e: fact.e });
    setTimeout(() => {
      setFeedback(null);
      pick(area);
    }, 900);
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
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 px-3 py-1 text-xs font-bold border border-indigo-200 dark:border-indigo-900/50">
            <Scale className="h-3.5 w-3.5" />
            Verdadeiro ou Falso
          </div>
        </header>

        {!started && !finished && (
          <div className="space-y-6">
            <section className="flex flex-wrap gap-2 justify-center bg-neutral-200/40 dark:bg-neutral-900/40 p-1.5 rounded-2xl w-fit mx-auto border border-neutral-200 dark:border-neutral-800">
              {Object.keys(FACTS).map((k) => (
                <button key={k} onClick={() => setArea(k)} className={`rounded-xl px-4 py-2 text-xs font-bold transition-all uppercase tracking-wider ${area === k ? "bg-indigo-500 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"}`}>
                  {k}
                </button>
              ))}
            </section>
            <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center space-y-4 shadow-sm">
              <p className="text-sm text-neutral-500">Responda o máximo de afirmações em <span className="font-bold">{ROUND_SECONDS}s</span>. Acertos em sequência valem mais!</p>
              <button onClick={start} className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 text-sm font-bold transition-all">
                Começar
              </button>
            </div>
          </div>
        )}

        {started && fact && (
          <div className="space-y-5">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400"><Timer className="h-4 w-4" />{timeLeft}s</span>
              <span>{score} pts</span>
              <span className="text-amber-500">🔥 x{combo}</span>
            </div>
            <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 min-h-[9rem] flex items-center justify-center text-center shadow-sm">
              <p className="text-lg font-bold leading-snug">{fact.s}</p>
            </div>
            {feedback ? (
              <div className={`rounded-2xl p-4 text-center text-sm font-semibold ${feedback.ok ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300" : "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300"}`}>
                {feedback.ok ? "Certo!" : "Errou!"} <span className="font-normal text-neutral-500 dark:text-neutral-400">{feedback.e}</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => answer(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-4 text-base font-bold transition-all">
                  <Check className="h-5 w-5" /> Verdadeiro
                </button>
                <button onClick={() => answer(false)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white py-4 text-base font-bold transition-all">
                  <X className="h-5 w-5" /> Falso
                </button>
              </div>
            )}
          </div>
        )}

        {finished && (
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center space-y-4 shadow-sm">
            <div className="h-14 w-14 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center mx-auto">
              <Trophy className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-black">Tempo!</h2>
            <p className="text-sm text-neutral-500">Você fez <span className="font-bold text-indigo-600">{score}</span> pontos. Melhor sequência: <span className="font-bold">{best}</span>.</p>
            <button onClick={start} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 text-sm font-bold transition-all">
              <RotateCcw className="h-4 w-4" />
              Jogar de novo
            </button>

            <ShareGameCard gameLabel="Verdadeiro ou Falso" score={score} scoreSuffix="pts" accentColor="#6366F1" />
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
