"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { WORK_MODELS, SENIORITIES, JOB_TYPES } from "@/lib/vaga-fields";

export function NewVagaForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [state, setState] = useState("");
  const [workModel, setWorkModel] = useState("");
  const [seniority, setSeniority] = useState("");
  const [jobType, setJobType] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [publishToFeed, setPublishToFeed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function generateDescription() {
    if (!title.trim()) {
      setError("Informe o cargo da vaga primeiro.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/empresa/vagas/descricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, notes: description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível gerar agora.");
      setDescription(data.description as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !description.trim()) {
      setError("Preencha o cargo e a descrição da vaga.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/empresa/vagas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          area,
          state,
          workModel,
          seniority,
          jobType,
          salaryMin,
          publishedToFeed: publishToFeed,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao cadastrar a vaga.");
      router.push(`/empresa/vagas/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors";
  const labelClass = "block text-sm font-medium mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
      <div>
        <label className={labelClass}>Cargo da vaga</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Vendedor(a) externo(a), Analista de RH..."
          className={inputClass}
          maxLength={140}
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium">Descrição da vaga</label>
          <button
            type="button"
            onClick={generateDescription}
            disabled={generating}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
          >
            {generating ? "Gerando..." : "✨ Gerar com IA"}
          </button>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Requisitos, responsabilidades e o perfil desejado. Ou clique em Gerar com IA."
          rows={6}
          className={inputClass}
          maxLength={5000}
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelClass}>Filtrar por área (opcional)</label>
          <input type="text" value={area} onChange={(e) => setArea(e.target.value)} className={inputClass} placeholder="Ex: Administração" />
        </div>
        <div className="w-24">
          <label className={labelClass}>UF (opcional)</label>
          <input type="text" value={state} onChange={(e) => setState(e.target.value.toUpperCase())} maxLength={2} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Modelo</label>
          <select value={workModel} onChange={(e) => setWorkModel(e.target.value)} className={inputClass}>
            <option value="">Não informar</option>
            {WORK_MODELS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Senioridade</label>
          <select value={seniority} onChange={(e) => setSeniority(e.target.value)} className={inputClass}>
            <option value="">Não informar</option>
            {SENIORITIES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Tipo</label>
          <select value={jobType} onChange={(e) => setJobType(e.target.value)} className={inputClass}>
            <option value="">Não informar</option>
            {JOB_TYPES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Salário mínimo (R$)</label>
          <input type="number" min={0} step={100} value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} className={inputClass} placeholder="Ex: 2500" />
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 cursor-pointer">
        <input
          type="checkbox"
          checked={publishToFeed}
          onChange={(e) => setPublishToFeed(e.target.checked)}
          className="mt-0.5 accent-blue-600"
        />
        <span>
          <span className="text-sm font-medium">Publicar no feed de vagas</span>
          <span className="block text-xs text-neutral-500">
            A vaga aparece para os candidatos no feed público e eles podem se candidatar. Você pode
            mudar isso depois.
          </span>
        </span>
      </label>

      {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Buscando candidatos..." : "Cadastrar vaga e buscar candidatos"}
      </button>
      {loading && (
        <p className="text-xs text-center text-neutral-500">
          Estamos varrendo o banco de talentos e ranqueando por aderência. Pode levar alguns segundos.
        </p>
      )}
    </form>
  );
}
