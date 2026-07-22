"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatBrazilPhone, isValidBrazilPhone, normalizeBrazilPhone } from "@/lib/contact-validation";

export function WhatsappOptInToggle({
  initialValue,
  initialPhone,
}: {
  initialValue: boolean;
  initialPhone: string | null;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialValue);
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    const next = !enabled;
    setError(null);

    if (next && !isValidBrazilPhone(normalizeBrazilPhone(phone))) {
      setError("Informe um número de WhatsApp válido antes de ativar.");
      return;
    }

    setSaving(true);
    setEnabled(next);

    try {
      const body: Record<string, unknown> = { whatsappMarketingOptIn: next };
      if (next) body.phone = normalizeBrazilPhone(phone);

      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar.");
      router.refresh();
    } catch (err) {
      setEnabled(!next);
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Dicas por WhatsApp</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-sm">
            Ative para receber, de vez em quando, uma mensagem descontraída no WhatsApp com dicas
            e lembretes sobre o seu plano de carreira. Você pode desativar a qualquer momento
            respondendo <strong>PARAR</strong> ou desligando aqui.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Dicas por WhatsApp"
          onClick={toggle}
          disabled={saving}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            enabled ? "bg-emerald-600" : "bg-neutral-300 dark:bg-neutral-700"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
      {!enabled && (
        <input
          type="tel"
          inputMode="numeric"
          placeholder="(11) 91234-5678"
          value={formatBrazilPhone(phone)}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
        />
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
