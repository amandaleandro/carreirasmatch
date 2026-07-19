"use client";

import { useCallback, useEffect, useState } from "react";

type Source = {
  id: string;
  name: string;
  url: string;
  kind: "job" | "course";
  state: string;
  active: boolean;
  itemCount: number;
  lastSuccessAt: string | null;
  lastError: string | null;
};

type Message = {
  text: string;
  tone: "success" | "error" | "warning";
};

type SyncResult = {
  courses?: number;
  bulletins?: number;
  opportunities?: number;
  videos?: number;
  errors?: string[];
  error?: string;
};

type SourceForm = {
  name: string;
  url: string;
  state: string;
  city: string;
  kind: Source["kind"];
};

const initialForm: SourceForm = { name: "", url: "", state: "", city: "", kind: "job" };

async function readJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error("O servidor retornou uma resposta inválida.");
  }
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function AdminExternalSources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [form, setForm] = useState(initialForm);

  const load = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await fetch("/api/admin/opportunity-sources");
      const data = await readJson<{ sources?: Source[]; error?: string }>(response);
      if (!response.ok) throw new Error(data.error ?? "Não foi possível carregar as fontes.");
      if (!Array.isArray(data.sources)) throw new Error("A lista de fontes retornada é inválida.");
      setSources(data.sources);
      return true;
    } catch (error) {
      setMessage({ text: errorMessage(error, "Não foi possível carregar as fontes."), tone: "error" });
      return false;
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    // A lista vem de um sistema externo ao React e precisa ser carregada ao montar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function sync() {
    setSyncing(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/external-sources/sync", { method: "POST" });
      const data = await readJson<SyncResult>(response);
      if (!response.ok && response.status !== 207) throw new Error(data.error ?? "Falha na coleta.");

      const summary = `${data.courses ?? 0} cursos, ${data.bulletins ?? 0} boletins, ${data.opportunities ?? 0} oportunidades e ${data.videos ?? 0} vídeos atualizados.`;
      const errors = Array.isArray(data.errors) ? data.errors.filter(Boolean) : [];
      setMessage({
        text: errors.length ? `${summary} ${errors.length} fonte(s) falharam: ${errors.join(" | ")}` : summary,
        tone: errors.length ? "warning" : "success",
      });
      await load();
    } catch (error) {
      setMessage({ text: errorMessage(error, "Falha na coleta."), tone: "error" });
    } finally {
      setSyncing(false);
    }
  }

  async function addSource(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/opportunity-sources", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, parser: "links", official: true }),
      });
      const data = await readJson<{ error?: string }>(response);
      if (!response.ok) throw new Error(data.error ?? "Não foi possível cadastrar.");

      setMessage({ text: "Fonte cadastrada.", tone: "success" });
      setForm(initialForm);
      await load();
    } catch (error) {
      setMessage({ text: errorMessage(error, "Não foi possível cadastrar."), tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  async function toggle(source: Source) {
    setTogglingId(source.id);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/opportunity-sources/${source.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ active: !source.active }),
      });
      const data = await readJson<{ error?: string }>(response);
      if (!response.ok) throw new Error(data.error ?? "Não foi possível alterar a fonte.");

      setMessage({ text: source.active ? "Fonte pausada." : "Fonte ativada.", tone: "success" });
      await load();
    } catch (error) {
      setMessage({ text: errorMessage(error, "Não foi possível alterar a fonte."), tone: "error" });
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <button type="button" onClick={sync} disabled={syncing} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
        {syncing ? "Atualizando fontes..." : "Atualizar todas as fontes agora"}
      </button>
      {message && (
        <p
          aria-live="polite"
          role={message.tone === "error" ? "alert" : "status"}
          className={`text-sm ${
            message.tone === "error"
              ? "text-red-600 dark:text-red-400"
              : message.tone === "warning"
                ? "text-amber-700 dark:text-amber-400"
                : "text-green-700 dark:text-green-400"
          }`}
        >
          {message.text}
        </p>
      )}

      <form onSubmit={addSource} className="grid gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800 md:grid-cols-2">
        <label className="grid gap-1 text-sm" htmlFor="source-name">
          Nome da fonte
          <input id="source-name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="rounded-lg border bg-transparent px-3 py-2 dark:border-neutral-700" />
        </label>
        <label className="grid gap-1 text-sm" htmlFor="source-url">
          Endereço do portal
          <input id="source-url" required type="url" placeholder="https://portal.oficial.gov.br/vagas" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} className="rounded-lg border bg-transparent px-3 py-2 dark:border-neutral-700" />
        </label>
        <label className="grid gap-1 text-sm" htmlFor="source-kind">
          Tipo
          <select id="source-kind" value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value as Source["kind"] })} className="rounded-lg border bg-transparent px-3 py-2 dark:border-neutral-700">
            <option value="job">Vagas / oportunidades</option>
            <option value="course">Cursos (com UF/cidade = presencial)</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm" htmlFor="source-state">
          UF (opcional)
          <input id="source-state" maxLength={2} value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value.toUpperCase() })} className="rounded-lg border bg-transparent px-3 py-2 dark:border-neutral-700" />
        </label>
        <label className="grid gap-1 text-sm md:col-span-2" htmlFor="source-city">
          Cidade (opcional)
          <input id="source-city" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} className="rounded-lg border bg-transparent px-3 py-2 dark:border-neutral-700" />
        </label>
        <button disabled={submitting} className="rounded-lg border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 disabled:opacity-50 dark:border-blue-800 dark:text-blue-300 md:col-span-2">
          {submitting ? "Cadastrando..." : "Cadastrar portal oficial"}
        </button>
      </form>

      <div className="space-y-2">
        {loadingList && sources.length === 0 && <p className="text-sm text-neutral-500">Carregando fontes...</p>}
        {!loadingList && sources.length === 0 && <p className="text-sm text-neutral-500">Nenhuma fonte cadastrada.</p>}
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
            <button type="button" onClick={() => toggle(source)} disabled={togglingId === source.id} className="rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 dark:border-neutral-700">
              {togglingId === source.id ? "Salvando..." : source.active ? "Pausar" : "Ativar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
