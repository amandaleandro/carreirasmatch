"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Vaga = { id: string; title: string; description: string; area: string; state: string };

export function EditVagaForm({ vaga }: { vaga: Vaga }) {
  const router = useRouter();
  const [title, setTitle] = useState(vaga.title);
  const [description, setDescription] = useState(vaga.description);
  const [area, setArea] = useState(vaga.area);
  const [state, setState] = useState(vaga.state);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !description.trim()) {
      setError("Preencha o cargo e a descrição da vaga.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/empresa/vagas/${vaga.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, area, state }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar.");
      router.push(`/empresa/vagas/${vaga.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors";
  const labelClass = "block text-sm font-medium mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
      <div>
        <label className={labelClass}>Cargo da vaga</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} maxLength={140} />
      </div>
      <div>
        <label className={labelClass}>Descrição da vaga</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className={inputClass} maxLength={5000} />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelClass}>Área (opcional)</label>
          <input type="text" value={area} onChange={(e) => setArea(e.target.value)} className={inputClass} />
        </div>
        <div className="w-24">
          <label className={labelClass}>UF (opcional)</label>
          <input type="text" value={state} onChange={(e) => setState(e.target.value.toUpperCase())} maxLength={2} className={inputClass} />
        </div>
      </div>

      {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

      <p className="text-xs text-neutral-500">
        Editar a vaga não refaz a busca automaticamente. Use <strong>Atualizar candidatos</strong> na
        vaga para uma nova varredura com o texto novo.
      </p>

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
