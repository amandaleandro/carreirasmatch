"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Link from "next/link";
import { Search, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { triggerConfetti } from "@/lib/confetti";

export function HeroInstantScanner() {
  const [roleQuery, setRoleQuery] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{
    role: string;
    score: number;
    skills: string[];
    gaps: string[];
  } | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Contador animado via requestAnimationFrame sincronizado com `result`: não dá
  // pra substituir por state derivado porque o valor evolui quadro a quadro ao
  // longo do tempo, não é uma função pura de `result`.
  useEffect(() => {
    if (!result) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayScore(0);
      return;
    }
    if (reduceMotionRef.current) {
      setDisplayScore(result.score);
      return;
    }

    const durationMs = 700;
    const start = performance.now();
    let frame: number;

    function step(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      setDisplayScore(Math.round(result!.score * progress));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    }

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [result]);

  function handleScan(e: FormEvent) {
    e.preventDefault();
    if (!roleQuery.trim()) return;

    setScanning(true);
    setResult(null);

    setTimeout(() => {
      const query = roleQuery.trim().toLowerCase();
      let score = 78;
      let skills = ["Comunicação Clara", "Trabalho em Equipe", "Resolução de Problemas"];
      let gaps = ["Palavras-chave técnicas da vaga", "Métricas quantitativas no histórico"];

      if (query.includes("dev") || query.includes("front") || query.includes("react") || query.includes("software")) {
        score = 84;
        skills = ["React.js", "TypeScript", "TailwindCSS", "Git & GitHub"];
        gaps = ["Testes Unitários (Jest)", "Métricas de Performance Web"];
      } else if (query.includes("vendas") || query.includes("comercial") || query.includes("atendimento")) {
        score = 80;
        skills = ["Negociação", "Prospecção de Clientes", "CRM", "Foco em Metas"];
        gaps = ["Indicadores de Conversão", "Follow-up Estruturado"];
      } else if (query.includes("admin") || query.includes("gest") || query.includes("gerente")) {
        score = 86;
        skills = ["Gestão de Processos", "Pacote Office / Excel", "Organização", "Liderança"];
        gaps = ["Certificações da Área", "Metodologia Ágil"];
      }

      setResult({
        role: roleQuery.trim(),
        score,
        skills,
        gaps,
      });
      setScanning(false);
      triggerConfetti({ count: 40, originY: 0.5 });
    }, 1200);
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Comece por uma oportunidade real</h3>
        <span className="text-xs text-blue-300 font-medium">
          100% Gratuito
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-slate-300 leading-relaxed">
          Cole uma vaga e veja em poucos segundos onde seu perfil já se destaca e o que merece atenção.
        </p>
      </div>

      <form onSubmit={handleScan} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            data-testid="hero-scanner-input"
            type="text"
            required
            value={roleQuery}
            onChange={(e) => setRoleQuery(e.target.value)}
            placeholder="Cole o link ou a descrição da vaga..."
            className="w-full rounded-full border border-white/20 bg-black/30 pl-10 pr-4 py-3 text-sm text-white placeholder-white/50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 transition-all"
          />
        </div>

        <button
          data-testid="hero-scanner-submit"
          type="submit"
          disabled={scanning}
          className="w-full rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 text-xs sm:text-sm shadow-md transition-all duration-200 disabled:opacity-50 inline-flex items-center justify-center gap-2 active:scale-95"
        >
          {scanning ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Analisando a vaga...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <span>Analisar esta vaga</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </form>
      <p className="text-[11px] text-slate-400 leading-relaxed -mt-1">
        Depois, você enviará seu currículo para calcular a compatibilidade.
      </p>

      {/* Simulated Live Result */}
      {result && (
        <div data-testid="hero-scanner-result" className="rounded-2xl border border-white/15 bg-slate-950/90 p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Vaga analisada</p>
              <h4 className="font-bold text-sm text-white truncate max-w-[12rem] sm:max-w-xs">{result.role}</h4>
            </div>
            <div className="text-right">
              <span data-testid="hero-scanner-score" className="text-2xl font-extrabold text-blue-400 tabular-nums">{displayScore}%</span>
              <span className="block text-[10px] font-semibold text-emerald-400 mt-0.5">
                Excelente alinhamento
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Pontos Relevantes Identificados:</p>
            <div className="flex flex-wrap gap-1.5">
              {result.skills.map((s) => (
                <span key={s} className="rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 text-[11px] font-medium inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">O que pode estar faltando:</p>
            <div className="flex flex-wrap gap-1.5">
              {result.gaps.map((g) => (
                <span key={g} className="rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 text-[11px] font-medium inline-flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  {g}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Link
              href={`/analise?role=${encodeURIComponent(result.role)}`}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 text-xs shadow-sm transition-all"
            >
              <span>Ver análise detalhada do meu currículo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
