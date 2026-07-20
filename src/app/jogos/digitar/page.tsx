"use client";

import { useState, useEffect, useRef } from "react";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { Keyboard, RotateCcw, AlertTriangle, Flame, ArrowLeft } from "lucide-react";
import Link from "next/link";

const SNIPPETS: Record<string, { label: string; text: string }[]> = {
  tecnologia: [
    {
      label: "JavaScript Array Map",
      text: "const activeUsers = users.filter(u => u.active).map(u => u.name); console.log(activeUsers);",
    },
    {
      label: "SQL User Join query",
      text: "SELECT u.id, u.name, p.credits FROM Partner u JOIN PartnerPayment p ON u.id = p.partnerId WHERE p.status = 'paid';",
    },
    {
      label: "Python Class Definition",
      text: "class Developer(Employee):\n    def __init__(self, name, skills):\n        self.name = name\n        self.skills = skills",
    },
  ],
  negocios: [
    {
      label: "E-mail de Feedback Comercial",
      text: "Prezado parceiro, analisamos as métricas de conversão dos leads deste trimestre e identificamos um aumento de vinte por cento nos cliques.",
    },
    {
      label: "Fórmulas Excel de Faturamento",
      text: "=SE(SOMA(A1:A10) > 1000; 'Meta Atingida'; 'Revisar Orcamento')",
    },
  ],
  marketing: [
    {
      label: "Headline de Lançamento",
      text: "Quer alavancar sua carreira? Inscreva-se hoje mesmo nos cursos gratuitos com certificado do CarreirasMatch e destaque seu curriculo!",
    },
    {
      label: "Copywriting de Call to Action",
      text: "Aproveite esta oportunidade unica com desconto de trinta por cento por tempo limitado. Clique no botao para resgatar seu cupom.",
    },
  ],
  geral: [
    {
      label: "Dica de Entrevista",
      text: "Pesquise bastante sobre a cultura e os valores da empresa antes da entrevista. Faça perguntas inteligentes sobre o time.",
    },
  ],
};

export default function SpeedTyperPage() {
  const [area, setArea] = useState<string>("tecnologia");
  const [snippetIndex, setSnippetIndex] = useState<number>(0);
  const [inputVal, setInputVal] = useState<string>("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [finished, setFinished] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(60);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const targetText = SNIPPETS[area]?.[snippetIndex]?.text ?? "";
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Reiniciar jogo
  function restartGame(newArea = area, newIndex = 0) {
    setArea(newArea);
    setSnippetIndex(newIndex);
    setInputVal("");
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setFinished(false);
    setSeconds(60);
    setTimerActive(false);
  }

  async function saveScore(finalWpm: number) {
    try {
      await fetch("/api/jogos/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "typer", area, score: finalWpm }),
      });
    } catch (err) {
      console.error(err);
    }
  }

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && seconds > 0 && !finished) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setFinished(true);
      setTimerActive(false);
      void saveScore(wpm);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, seconds, finished]);

  // Capturar digitação
  function handleInputChange(val: string) {
    if (finished) return;

    if (!timerActive && val.length > 0) {
      setStartTime(Date.now());
      setTimerActive(true);
    }

    setInputVal(val);

    // Calcular erros e acurácia
    let errors = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== targetText[i]) {
        errors++;
      }
    }
    const calculatedAccuracy = val.length > 0 ? Math.max(0, Math.round(((val.length - errors) / val.length) * 100)) : 100;
    setAccuracy(calculatedAccuracy);

    // Calcular WPM (1 palavra = 5 caracteres)
    let currentWpm = wpm;
    if (startTime) {
      const minutesElapsed = (Date.now() - startTime) / 1000 / 60;
      if (minutesElapsed > 0) {
        const correctChars = val.length - errors;
        const calculatedWpm = Math.round(correctChars / 5 / minutesElapsed);
        setWpm(calculatedWpm);
        currentWpm = calculatedWpm;
      }
    }

    // Verificar se acabou
    if (val === targetText) {
      setFinished(true);
      setTimerActive(false);
      void saveScore(currentWpm);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50">
      <PublicSiteHeader />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        <header className="flex items-center justify-between">
          <Link
            href="/jogos"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Hub
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 px-3 py-1 text-xs font-bold border border-blue-200 dark:border-blue-900/50">
            <Keyboard className="h-3.5 w-3.5" />
            Speed Typer
          </div>
        </header>

        {/* Escolha da área */}
        <section className="flex flex-wrap gap-2 justify-center bg-neutral-200/40 dark:bg-neutral-900/40 p-1.5 rounded-2xl w-fit mx-auto border border-neutral-200 dark:border-neutral-800">
          {Object.keys(SNIPPETS).map((k) => (
            <button
              key={k}
              onClick={() => restartGame(k, 0)}
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

        {/* Estatísticas no Topo do Painel */}
        <section className="grid grid-cols-4 gap-4 max-w-2xl mx-auto text-center">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <p className="text-[10px] uppercase font-bold text-neutral-400">Tempo</p>
            <p className="text-2xl font-black mt-1 text-neutral-900 dark:text-white">
              {seconds}s
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <p className="text-[10px] uppercase font-bold text-neutral-400">PPM (WPM)</p>
            <p className="text-2xl font-black mt-1 text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1">
              <Flame className="h-5 w-5 fill-blue-600" />
              {wpm}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <p className="text-[10px] uppercase font-bold text-neutral-400">Acurácia</p>
            <p className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
              {accuracy}%
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <p className="text-[10px] uppercase font-bold text-neutral-400">Progresso</p>
            <p className="text-2xl font-black mt-1 text-neutral-700 dark:text-neutral-300">
              {Math.min(100, Math.round((inputVal.length / targetText.length) * 100))}%
            </p>
          </div>
        </section>

        {/* Caixa de Texto do Jogo */}
        <section className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 md:p-8 space-y-6 shadow-sm relative">
          <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <span>Snippet: <span className="font-bold text-neutral-600 dark:text-neutral-200">{SNIPPETS[area]?.[snippetIndex]?.label}</span></span>
            <button
              onClick={() => {
                const nextIndex = (snippetIndex + 1) % (SNIPPETS[area]?.length ?? 1);
                restartGame(area, nextIndex);
              }}
              className="text-blue-600 font-bold hover:underline"
            >
              Mudar Snippet
            </button>
          </div>

          {/* Texto de Referência com Destaque de Letras Digitadas */}
          <div className="text-lg font-mono leading-relaxed bg-neutral-50 dark:bg-neutral-950 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-left select-none max-h-48 overflow-y-auto whitespace-pre-wrap">
            {targetText.split("").map((char, index) => {
              let colorClass = "text-neutral-400 dark:text-neutral-600";
              if (index < inputVal.length) {
                colorClass =
                  inputVal[index] === char
                    ? "text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-red-500 bg-red-100 dark:bg-red-950/40 rounded font-semibold";
              }
              return (
                <span key={index} className={colorClass}>
                  {char}
                </span>
              );
            })}
          </div>

          {/* Caixa de Entrada de Texto */}
          <div className="relative">
            <textarea
              ref={inputRef}
              disabled={finished}
              value={inputVal}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={timerActive ? "Digite o texto acima..." : "Clique aqui e comece a digitar para iniciar o cronômetro!"}
              className="w-full h-28 font-mono p-4 rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm leading-relaxed"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-4 items-center justify-between">
            <button
              onClick={() => restartGame(area, snippetIndex)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 px-5 py-3 text-xs font-bold hover:bg-neutral-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Recomeçar Desafio
            </button>

            {finished && (
              <div className="text-right">
                <p className="text-xs text-neutral-400">Resultado:</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                  {seconds === 0 ? "O tempo acabou!" : "Concluído com sucesso!"}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Dicas de Digitação */}
        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/40 p-5 text-left text-xs leading-relaxed text-neutral-500 flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-neutral-900 dark:text-white">Dicas para melhor performance:</p>
            <ul className="list-disc list-inside mt-1.5 space-y-1">
              <li>Mantenha as mãos posicionadas na linha central do teclado.</li>
              <li>A precisão de digitação é mais importante no WPM do que a velocidade bruta, pois cada erro desconta do resultado.</li>
              <li>Tente ler uma palavra à frente enquanto digita para obter fluidez.</li>
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
