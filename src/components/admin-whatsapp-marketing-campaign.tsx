"use client";

import { useState } from "react";

export function AdminWhatsappMarketingCampaign() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ sent: number; skipped: number; failed: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/whatsapp/marketing-campaign", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao disparar a campanha.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao disparar a campanha.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {busy ? "Disparando…" : "Disparar convite (leads + não assinantes)"}
      </button>
      {result && (
        <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
          <p>
            {result.sent} enviado(s) e confirmado(s) pela Evolution API, {result.skipped} pulado(s) (já receberam
            tudo ou já converteram), de {result.total} contato(s) elegível(is) com telefone.
          </p>
          {result.failed > 0 && (
            <p className="text-red-500">
              {result.failed} falharam ao enviar (recusado pela Evolution API ou instância desconectada) e ficaram
              disponíveis pra tentar de novo no próximo disparo.
            </p>
          )}
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
