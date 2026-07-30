"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, DollarSign } from "lucide-react";
import { FREELANCE_CATEGORIES } from "@/lib/freelance";

type Suggestion = {
  hourlyMinReais: number;
  hourlyMaxReais: number;
  fixedMinReais: number;
  fixedMaxReais: number;
  reasoning: string;
  negotiationTips: string[];
};

const INPUT_CLASS =
  "w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors";

const EXPERIENCE_LEVELS = ["Iniciante", "Intermediário", "Experiente", "Especialista"];

function formatReais(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

export function PricingForm({ initialCategory, initialSkills }: { initialCategory: string; initialSkills: string[] }) {
  const [category, setCategory] = useState(initialCategory);
  const [experienceLevel, setExperienceLevel] = useState("Intermediário");
  const [projectScope, setProjectScope] = useState("");
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!projectScope.trim()) {
      setError("Descreva o escopo do projeto.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/freelance/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, skills: initialSkills, experienceLevel, projectScope }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar sugestão.");
      setSuggestion(data.suggestion);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 md:px-8 py-6 space-y-6 font-sans">
      <Link href="/freelancer" className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
        ← Painel freelancer
      </Link>
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-blue-600" />
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Precificação inteligente</h1>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 -mt-4">
        Descubra uma faixa de preço justa e competitiva antes de enviar sua próxima proposta.
      </p>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Categoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={INPUT_CLASS}>
              <option value="">Selecione</option>
              {FREELANCE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nível de experiência</label>
            <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className={INPUT_CLASS}>
              {EXPERIENCE_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Escopo do projeto</label>
          <textarea
            value={projectScope}
            onChange={(e) => setProjectScope(e.target.value)}
            rows={4}
            placeholder="Descreva o que precisa ser entregue, prazo esperado e complexidade..."
            className={INPUT_CLASS}
          />
        </div>

        {error && <p className="text-xs font-bold text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 disabled:opacity-50">
          <Sparkles className="h-3.5 w-3.5" />
          {loading ? "Calculando..." : "Sugerir faixa de preço"}
        </button>
      </form>

      {suggestion && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Por hora</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {formatReais(suggestion.hourlyMinReais)} – {formatReais(suggestion.hourlyMaxReais)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Preço fechado</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {formatReais(suggestion.fixedMinReais)} – {formatReais(suggestion.fixedMaxReais)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{suggestion.reasoning}</p>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Como defender esse preço</p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                {suggestion.negotiationTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
