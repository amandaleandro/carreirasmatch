"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { FREELANCE_CATEGORIES, type PortfolioItem } from "@/lib/freelance";

export interface FreelancerProfileInitial {
  headline: string;
  bio: string;
  category: string;
  skills: string[];
  hourlyRate: string;
  portfolio: PortfolioItem[];
  available: boolean;
  published: boolean;
}

const inputClass =
  "w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors";
const labelClass = "block text-sm font-medium mb-1.5";

export function FreelancerProfileForm({ initial }: { initial: FreelancerProfileInitial }) {
  const router = useRouter();
  const [headline, setHeadline] = useState(initial.headline);
  const [bio, setBio] = useState(initial.bio);
  const [category, setCategory] = useState(initial.category);
  const [skills, setSkills] = useState<string[]>(initial.skills);
  const [skillInput, setSkillInput] = useState("");
  const [hourlyRate, setHourlyRate] = useState(initial.hourlyRate);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(initial.portfolio);
  const [available, setAvailable] = useState(initial.available);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function addSkill() {
    const s = skillInput.trim();
    if (!s) return;
    if (!skills.some((x) => x.toLowerCase() === s.toLowerCase()) && skills.length < 30) {
      setSkills([...skills, s]);
    }
    setSkillInput("");
  }

  function onSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  }

  function updatePortfolio(idx: number, field: keyof PortfolioItem, value: string) {
    setPortfolio((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  }

  function addPortfolioItem() {
    if (portfolio.length >= 12) return;
    setPortfolio([...portfolio, { title: "", url: "", imageUrl: "", description: "" }]);
  }

  async function save(publish: boolean) {
    setError(null);
    setSavedMsg(null);
    if (publish && !headline.trim()) {
      setError("Escreva um título profissional antes de publicar.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/freelance/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          bio,
          category,
          skills,
          hourlyRate,
          portfolio: portfolio.filter((p) => p.title.trim() || p.url.trim()),
          available,
          published: publish,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar o perfil.");
      setSavedMsg(publish ? "Perfil publicado!" : "Rascunho salvo.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    save(initial.published);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
      <div>
        <label className={labelClass}>Título profissional</label>
        <input
          type="text"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="Ex: Designer de marcas e identidade visual"
          className={inputClass}
          maxLength={140}
        />
      </div>

      <div>
        <label className={labelClass}>Categoria principal</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
          <option value="">Selecione...</option>
          {FREELANCE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Sobre você</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Conte sua experiência, o tipo de trabalho que faz e o que te diferencia."
          rows={6}
          className={inputClass}
          maxLength={3000}
        />
      </div>

      <div>
        <label className={labelClass}>Habilidades</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {skills.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
              {s}
              <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))} className="text-blue-400 hover:text-blue-600" aria-label={`Remover ${s}`}>
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={onSkillKeyDown}
            placeholder="Digite e pressione Enter (ex: Figma, React, SEO)"
            className={inputClass}
            maxLength={40}
          />
          <button type="button" onClick={addSkill} className="shrink-0 rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-white/5">
            Adicionar
          </button>
        </div>
      </div>

      <div>
        <label className={labelClass}>Valor por hora (R$) — opcional</label>
        <input
          type="number"
          min={0}
          step={10}
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
          placeholder="Deixe em branco para 'a combinar'"
          className={inputClass}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium">Portfólio</label>
          <button type="button" onClick={addPortfolioItem} disabled={portfolio.length >= 12} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50">
            + Adicionar item
          </button>
        </div>
        <div className="space-y-3">
          {portfolio.length === 0 && (
            <p className="text-xs text-neutral-500">Adicione trabalhos anteriores com link e uma breve descrição.</p>
          )}
          {portfolio.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 space-y-2">
              <div className="flex gap-2">
                <input type="text" value={item.title} onChange={(e) => updatePortfolio(idx, "title", e.target.value)} placeholder="Título do trabalho" className={inputClass} maxLength={120} />
                <button type="button" onClick={() => setPortfolio(portfolio.filter((_, i) => i !== idx))} className="shrink-0 rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 text-sm hover:bg-neutral-50 dark:hover:bg-white/5" aria-label="Remover item">
                  ×
                </button>
              </div>
              <input type="url" value={item.url} onChange={(e) => updatePortfolio(idx, "url", e.target.value)} placeholder="https://link-do-trabalho.com" className={inputClass} maxLength={500} />
              <input type="text" value={item.description} onChange={(e) => updatePortfolio(idx, "description", e.target.value)} placeholder="Descrição breve (opcional)" className={inputClass} maxLength={500} />
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 cursor-pointer">
        <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} className="mt-0.5 accent-blue-600" />
        <span>
          <span className="text-sm font-medium">Disponível para novos projetos</span>
          <span className="block text-xs text-neutral-500">Quando desmarcado, seu perfil fica oculto na vitrine, mas continua salvo.</span>
        </span>
      </label>

      {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
      {savedMsg && <p className="text-sm font-semibold text-green-600 dark:text-green-400">{savedMsg}</p>}

      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={() => save(false)} disabled={loading} className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-700 px-6 py-3 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-white/5 disabled:opacity-50">
          Salvar rascunho
        </button>
        <button type="button" onClick={() => save(true)} disabled={loading} className="flex-1 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Salvando..." : "Publicar perfil"}
        </button>
      </div>
    </form>
  );
}
