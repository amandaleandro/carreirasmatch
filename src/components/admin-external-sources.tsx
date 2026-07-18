"use client";

import { useCallback, useEffect, useState } from "react";

type Source = {
  id: string;
  name: string;
  url: string;
  kind: string;
  state: string;
  city: string;
  active: boolean;
  official: boolean;
  itemCount: number;
  lastSuccessAt: string | null;
  lastError: string;
};

export function AdminExternalSources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", url: "", state: "", city: "", kind: "job" });

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/opportunity-sources");
    const data = await response.json();
    if (response.ok) setSources(data.sources);
  }, []);

  useEffect(() => {
    // A lista vem de um sistema externo ao React e precisa ser carregada ao montar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function sync() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/external-sources/sync", { method: "POST" });
      const data = await response.json();
      if (!response.ok && response.status !== 207) throw new Error(data.error ?? "Falha na coleta.");
      setMessage(`${data.courses} cursos, ${data.bulletins} boletins e ${data.opportunities ?? 0} oportunidades atualizados.`);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha na coleta.");
    } finally {
      setLoading(false);
    }
  }

  async function addSource(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/admin/opportunity-sources", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...form, parser: "links", official: true }),
    });
    const data = await response.json();
    setMessage(response.ok ? "Fonte cadastrada." : data.error ?? "Não foi possível cadastrar.");
    if (response.ok) {
      setForm({ name: "", url: "", state: "", city: "", kind: "job" });
      await load();
    }
    setLoading(false);
  }

  async function toggle(source: Source) {
    await fetch(`/api/admin/opportunity-sources/${source.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ active: !source.active }),
    });
    await load();
  }

  return (
    <div className="space-y-5">
      <button type="button" onClick={sync} disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
        {loading ? "Processando..." : "Atualizar todas as fontes agora"}
      </button>
      {message && <p className="text-sm text-neutral-600 dark:text-neutral-400">{message}</p>}

      <form onSubmit={addSource} className="grid gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800 md:grid-cols-2">
        <input required placeholder="Nome da fonte" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="rounded-lg border bg-transparent px-3 py-2 text-sm dark:border-neutral-700" />
        <input required type="url" placeholder="https://portal.oficial.gov.br/vagas" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} className="rounded-lg border bg-transparent px-3 py-2 text-sm dark:border-neutral-700" />
        <select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value })} className="rounded-lg border bg-transparent px-3 py-2 text-sm dark:border-neutral-700">
          <option value="job">Vagas / oportunidades</option>
          <option value="course">Cursos (com UF/cidade = presencial)</option>
        </select>
        <input maxLength={2} placeholder="UF" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value.toUpperCase() })} className="rounded-lg border bg-transparent px-3 py-2 text-sm dark:border-neutral-700" />
        <input placeholder="Cidade, opcional" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} className="rounded-lg border bg-transparent px-3 py-2 text-sm dark:border-neutral-700" />
        <button disabled={loading} className="rounded-lg border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 dark:border-blue-800 dark:text-blue-300 md:col-span-2">
          Cadastrar portal oficial
        </button>
      </form>

      <div className="space-y-2">
        {sources.map((source) => (
          <div key={source.id} className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold">
                {source.name} {source.state ? `• ${source.state}` : ""}
                <span className="ml-2 rounded-full border border-neutral-300 px-2 py-0.5 text-[10px] font-medium uppercase text-neutral-500 dark:border-neutral-700">
                  {source.kind === "course" ? "Curso" : "Vaga"}
                </span>
              </p>
              <p className="truncate text-xs text-neutral-500">{source.url}</p>
              <p className="mt-1 text-xs text-neutral-500">
                {source.itemCount} itens • {source.lastSuccessAt ? `atualizada em ${new Date(source.lastSuccessAt).toLocaleString("pt-BR")}` : "ainda não atualizada"}
              </p>
              {source.lastError && <p className="mt-1 text-xs text-red-600">{source.lastError}</p>}
            </div>
            <button type="button" onClick={() => toggle(source)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold dark:border-neutral-700">
              {source.active ? "Pausar" : "Ativar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
