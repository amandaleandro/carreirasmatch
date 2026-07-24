"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Search, CheckCircle2, ArrowRight, ShieldCheck, Target, Sparkles } from "lucide-react";
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
    <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6 font-sans">
      {/* Laser Scanning Effect */}
      {scanning && <div className="animate-laser-sweep z-20" />}

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 bg-blue-500/20 text-blue-200 border border-blue-400/30">
          <Target className="w-3.5 h-3.5 text-blue-400" />
          Diagnóstico de Aderência
        </span>
        <span className="text-[11px] text-white/70 font-medium inline-flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
          100% Gratuito
        </span>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl font-bold text-white">Teste seu perfil para a vaga agora</h3>
        <p className="text-xs text-white/80 leading-relaxed">
          Digite o cargo desejado para verificar os requisitos técnicos e o índice de compatibilidade.
        </p>
      </div>

      <form onSubmit={handleScan} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            required
            value={roleQuery}
            onChange={(e) => setRoleQuery(e.target.value)}
            placeholder="Ex: Desenvolvedor Front-end, Vendedor..."
            className="w-full rounded-2xl border border-white/20 bg-black/30 pl-10 pr-4 py-3 text-sm text-white placeholder-white/50 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={scanning}
          className="w-full btn-shine-glow rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3.5 text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all duration-200 disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {scanning ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Calculando aderência do perfil...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <span>Simular Compatibilidade Gratuitamente</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </form>

      {/* Simulated Live Result */}
      {result && (
        <div className="rounded-2xl border border-white/20 bg-slate-950/95 p-5 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/60 font-bold">Cargo Simulado</p>
              <h4 className="font-extrabold text-sm text-white truncate max-w-[12rem] sm:max-w-xs">{result.role}</h4>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-blue-400">{result.score}%</span>
              <span className="block text-[10px] font-bold text-emerald-400 badge-pulse-glow px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 mt-0.5">
                Alta Compatibilidade
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Pontos Fortes Identificados:</p>
            <div className="flex flex-wrap gap-1.5">
              {result.skills.map((s) => (
                <span key={s} className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold inline-flex items-center gap-1 transition-transform hover:scale-105">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Link
              href={`/analise?role=${encodeURIComponent(result.role)}`}
              className="w-full btn-shine-glow inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 text-xs shadow-md transition-all"
            >
              <span>Ver diagnóstico completo do seu currículo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

