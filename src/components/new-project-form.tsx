"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { FREELANCE_CATEGORIES, BUDGET_TYPES, PROJECT_WORK_MODELS } from "@/lib/freelance";

const inputClass =
  "w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors";
const labelClass = "block text-sm font-medium mb-1.5";

export function NewProjectForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [budgetType, setBudgetType] = useState("fixed");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [workModel, setWorkModel] = useState("remoto");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.some((x) => x.toLowerCase() === s.toLowerCase()) && skills.length < 30) {
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !description.trim()) {
      setError("Preencha o título e a descrição do projeto.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/freelance/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category, skills, budgetType, budgetMin, budgetMax, workModel, deadline }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao publicar o projeto.");
      router.push(`/projetos/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
      <div>
        <label className={labelClass}>Título do projeto</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Logo e identidade visual para cafeteria" className={inputClass} maxLength={140} />
      </div>

      <div>
        <label className={labelClass}>Categoria</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
          <option value="">Selecione...</option>
          {FREELANCE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Descrição</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva o que precisa, os entregáveis, referências e o contexto." rows={7} className={inputClass} maxLength={8000} />
      </div>

      <div>
        <label className={labelClass}>Habilidades desejadas</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {skills.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
              {s}
              <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))} className="text-blue-400 hover:text-blue-600" aria-label={`Remover ${s}`}>×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={onSkillKeyDown} placeholder="Digite e pressione Enter" className={inputClass} maxLength={40} />
          <button type="button" onClick={addSkill} className="shrink-0 rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-white/5">Adicionar</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Tipo de orçamento</label>
          <select value={budgetType} onChange={(e) => setBudgetType(e.target.value)} className={inputClass}>
            {BUDGET_TYPES.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Modelo</label>
          <select value={workModel} onChange={(e) => setWorkModel(e.target.value)} className={inputClass}>
            {PROJECT_WORK_MODELS.map((w) => (
              <option key={w.value} value={w.value}>{w.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Orçamento mín. (R$)</label>
          <input type="number" min={0} step={50} value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} className={inputClass} placeholder="Opcional" />
        </div>
        <div>
          <label className={labelClass}>Orçamento máx. (R$)</label>
          <input type="number" min={0} step={50} value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} className={inputClass} placeholder="Opcional" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Prazo desejado, opcional</label>
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClass} />
      </div>

      {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

      <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50">
        {loading ? "Publicando..." : "Publicar projeto"}
      </button>
    </form>
  );
}
