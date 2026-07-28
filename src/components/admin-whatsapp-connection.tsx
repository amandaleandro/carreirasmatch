"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ConnectionState = "open" | "connecting" | "close" | "unknown";

type Instance = {
  id: string;
  label: string;
  instanceName: string;
  state: ConnectionState;
};

const STATE_LABELS: Record<ConnectionState, string> = {
  open: "Conectado",
  connecting: "Aguardando leitura do QR code",
  close: "Desconectado",
  unknown: "Estado desconhecido",
};

const STATE_CLASSES: Record<ConnectionState, string> = {
  open: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  connecting: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  close: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
  unknown: "bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400",
};

export function AdminWhatsappConnection() {
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [addingBusy, setAddingBusy] = useState(false);
  const [qrById, setQrById] = useState<Record<string, { base64: string; pairingCode: string | null }>>({});
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/whatsapp/instances");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao consultar números.");
      setConfigured(Boolean(data.configured));
      setInstances((data.instances ?? []) as Instance[]);
      if ((data.instances ?? []).every((i: Instance) => i.state !== "connecting")) stopPolling();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao consultar números.");
    } finally {
      setLoading(false);
    }
  }, [stopPolling]);

  useEffect(() => {
    // O status vem de um sistema externo ao React e precisa ser carregado ao montar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addInstance(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    setAddingBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/whatsapp/instances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao cadastrar o número.");
      setNewLabel("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao cadastrar o número.");
    } finally {
      setAddingBusy(false);
    }
  }

  async function generateQr(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/whatsapp/instances/${id}/connect`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar QR code.");
      setQrById((prev) => ({ ...prev, [id]: { base64: data.base64, pairingCode: data.pairingCode ?? null } }));

      stopPolling();
      // O QR do Baileys expira em segundos; ficamos de olho no status pra
      // saber assim que o celular escanear e a instância abrir a sessão.
      pollRef.current = setInterval(() => void refresh(), 4000);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao gerar QR code.");
    } finally {
      setBusyId(null);
    }
  }

  async function disconnect(id: string) {
    if (!confirm("Desconectar esse número? Ele para de receber envios até reparear.")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/whatsapp/instances/${id}/logout`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao desconectar.");
      setQrById((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao desconectar.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string, label: string) {
    if (!confirm(`Remover o número "${label}"? Ele para de ser usado pro envio (rodízio/failover).`)) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/whatsapp/instances/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Erro ao remover o número.");
      }
      setQrById((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao remover o número.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-neutral-500">Verificando…</p>;
  }

  if (!configured) {
    return (
      <p className="text-sm text-neutral-500">
        Defina EVOLUTION_API_URL e EVOLUTION_API_KEY no ambiente do servidor pra habilitar.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Vários números cadastrados são usados em rodízio pro envio de marketing e servem de failover: se um for
        desconectado ou banido, os outros continuam funcionando.
      </p>

      <div className="space-y-3">
        {instances.length === 0 && (
          <p className="text-sm text-neutral-500">Nenhum número cadastrado ainda.</p>
        )}
        {instances.map((instance) => (
          <div key={instance.id} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="text-sm font-semibold">{instance.label}</p>
                <p className="text-xs text-neutral-500">{instance.instanceName}</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATE_CLASSES[instance.state]}`}>
                {STATE_LABELS[instance.state]}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {instance.state !== "open" && (
                <button
                  type="button"
                  onClick={() => void generateQr(instance.id)}
                  disabled={busyId === instance.id}
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {busyId === instance.id ? "Gerando…" : "Gerar QR code"}
                </button>
              )}
              {instance.state === "open" && (
                <button
                  type="button"
                  onClick={() => void disconnect(instance.id)}
                  disabled={busyId === instance.id}
                  className="rounded-md border border-red-300 text-red-700 dark:border-red-900 dark:text-red-300 px-3 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50"
                >
                  {busyId === instance.id ? "Desconectando…" : "Desconectar"}
                </button>
              )}
              <button
                type="button"
                onClick={() => void remove(instance.id, instance.label)}
                disabled={busyId === instance.id}
                className="text-xs text-neutral-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
              >
                Remover
              </button>
            </div>

            {qrById[instance.id] && instance.state !== "open" && (
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  No celular dessa linha: WhatsApp → Aparelhos conectados → Conectar um aparelho, e aponte a câmera
                  pra este código. Ele expira em segundos — se der erro, gere outro.
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrById[instance.id].base64}
                  alt="QR code de pareamento do WhatsApp"
                  className="w-56 h-56 rounded-md border border-neutral-200 dark:border-neutral-800"
                />
                {qrById[instance.id].pairingCode && (
                  <p className="text-xs text-neutral-500">
                    Código de pareamento alternativo: <strong>{qrById[instance.id].pairingCode}</strong>
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={addInstance} className="flex items-center gap-2 flex-wrap">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Nome pra identificar o número (ex.: Marketing 2)"
          className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 min-w-[240px]"
        />
        <button
          type="submit"
          disabled={addingBusy || !newLabel.trim()}
          className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-50"
        >
          {addingBusy ? "Adicionando…" : "Adicionar número"}
        </button>
      </form>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
