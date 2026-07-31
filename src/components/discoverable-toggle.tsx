"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/components/feedback-provider";

export function DiscoverableToggle({ initialValue }: { initialValue: boolean }) {
  const router = useRouter();
  const { notify } = useFeedback();
  const [enabled, setEnabled] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    const next = !enabled;
    setSaving(true);
    setError(null);
    // Otimista: reflete a escolha na hora, reverte se falhar.
    setEnabled(next);

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discoverable: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar.");
      notify("success", next ? "Seu perfil agora pode ser encontrado por empresas." : "Seu perfil deixou de aparecer para empresas.");
      router.refresh();
    } catch (err) {
      setEnabled(!next);
      const message = err instanceof Error ? err.message : "Erro inesperado.";
      setError(message);
      notify("error", message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Ser encontrado por empresas</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-sm">
            Ao ativar, empresas parceiras podem encontrar o seu perfil no nosso banco de talentos.
            Elas veem sua área, senioridade e cidade, mas <strong>nunca o seu contato sem a sua
            autorização</strong>. Você pode desativar a qualquer momento.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Ser encontrado por empresas"
          onClick={toggle}
          disabled={saving}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            enabled ? "bg-blue-600" : "bg-neutral-300 dark:bg-neutral-700"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
