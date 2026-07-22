"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type State = "loading" | "not_configured" | "open" | "connecting" | "close" | "unknown";

const STATE_LABELS: Record<State, string> = {
  loading: "Verificando…",
  not_configured: "Evolution API não configurada neste ambiente.",
  open: "Conectado",
  connecting: "Aguardando leitura do QR code",
  close: "Desconectado",
  unknown: "Estado desconhecido",
};

const STATE_CLASSES: Record<State, string> = {
  loading: "bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400",
  not_configured: "bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400",
  open: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  connecting: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  close: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
  unknown: "bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400",
};

export function AdminWhatsappConnection() {
  const [state, setState] = useState<State>("loading");
  const [qr, setQr] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/whatsapp/status");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao consultar status.");
      const next: State = !data.configured ? "not_configured" : (data.state as State);
      setState(next);
      if (next === "open") {
        setQr(null);
        setPairingCode(null);
        stopPolling();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao consultar status.");
    }
  }, [stopPolling]);

  useEffect(() => {
    // O status vem de um sistema externo ao React e precisa ser carregado ao montar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshStatus();
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateQr() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/whatsapp/connect", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar QR code.");
      setQr(data.base64 as string);
      setPairingCode((data.pairingCode as string | null) ?? null);
      setState("connecting");

      stopPolling();
      // O QR do Baileys expira em segundos; ficamos de olho no status pra
      // saber assim que o celular escanear e a instância abrir a sessão.
      pollRef.current = setInterval(() => void refreshStatus(), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao gerar QR code.");
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    if (!confirm("Desconectar o WhatsApp? A régua de conversão para de enviar mensagens até reparear.")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/whatsapp/logout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao desconectar.");
      setQr(null);
      setPairingCode(null);
      await refreshStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao desconectar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATE_CLASSES[state]}`}>
          {STATE_LABELS[state]}
        </span>
        {state !== "loading" && state !== "not_configured" && (
          <button
            type="button"
            onClick={() => void refreshStatus()}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Atualizar
          </button>
        )}
      </div>

      {state === "not_configured" && (
        <p className="text-sm text-neutral-500">
          Defina EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE no ambiente do servidor pra habilitar.
        </p>
      )}

      {(state === "close" || state === "connecting" || state === "unknown") && !qr && (
        <button
          type="button"
          onClick={generateQr}
          disabled={busy}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? "Gerando…" : "Gerar QR code"}
        </button>
      )}

      {qr && (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            No celular da linha dedicada: WhatsApp → Aparelhos conectados → Conectar um aparelho, e aponte a câmera
            pra este código. Ele expira em segundos — se der erro, gere outro.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR code de pareamento do WhatsApp" className="w-56 h-56 rounded-md border border-neutral-200 dark:border-neutral-800" />
          {pairingCode && (
            <p className="text-xs text-neutral-500">
              Código de pareamento alternativo: <strong>{pairingCode}</strong>
            </p>
          )}
          <button type="button" onClick={generateQr} disabled={busy} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            Gerar um novo
          </button>
        </div>
      )}

      {state === "open" && (
        <button
          type="button"
          onClick={disconnect}
          disabled={busy}
          className="rounded-md border border-red-300 text-red-700 dark:border-red-900 dark:text-red-300 px-3 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50"
        >
          {busy ? "Desconectando…" : "Desconectar"}
        </button>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
