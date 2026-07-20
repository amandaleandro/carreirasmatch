"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ApplyVaga({
  vagaId,
  state,
}: {
  vagaId: string;
  /** "guest" (deslogado) | "company" (conta empresa) | "candidate" | "applied" */
  state: "guest" | "company" | "candidate" | "applied";
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (state === "guest") {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/vagas/empresa/${vagaId}`)}`}
        className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        Entrar para se candidatar
      </Link>
    );
  }

  if (state === "company") {
    return <p className="text-sm text-neutral-500">Contas de empresa não podem se candidatar.</p>;
  }

  if (state === "applied" || done) {
    return (
      <p className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/20 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
        Candidatura enviada ✓ A empresa recebeu seus dados de contato.
      </p>
    );
  }

  async function apply() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/empresa/vagas/${vagaId}/candidatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao se candidatar.");
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="Mensagem para a empresa (opcional): conte por que você tem o perfil."
        className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        maxLength={2000}
      />
      {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
      <button
        type="button"
        onClick={apply}
        disabled={loading}
        className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Candidatar-se"}
      </button>
      <p className="text-xs text-neutral-500">
        Ao se candidatar, seu nome e contato (e-mail/telefone) ficam visíveis para a empresa.
      </p>
    </div>
  );
}
