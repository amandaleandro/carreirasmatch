"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ContactStatus = "none" | "pending" | "accepted" | "declined";

export type VagaMatch = {
  userId: string;
  firstName: string;
  professionalArea: string;
  city: string;
  state: string;
  fitScore: number;
  reason: string;
  contactStatus: ContactStatus;
  contact: { name: string; email: string; phone: string } | null;
};

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900";
  if (score >= 40) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900";
  return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900";
}

export function VagaMatches({
  vagaId,
  jobTitle,
  initialMatches,
  lastMatchedAt,
}: {
  vagaId: string;
  jobTitle: string;
  initialMatches: VagaMatch[];
  lastMatchedAt: string | null;
}) {
  const router = useRouter();
  const [matches, setMatches] = useState<VagaMatch[]>(initialMatches);
  const [contacting, setContacting] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestContact(userId: string) {
    setContacting(userId);
    setError(null);
    try {
      const res = await fetch("/api/empresa/talentos/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, jobTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao solicitar contato.");
      setMatches((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, contactStatus: data.status as ContactStatus } : m))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setContacting(null);
    }
  }

  async function refreshMatches() {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(`/api/empresa/vagas/${vagaId}/rematch`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível atualizar agora.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-neutral-500">
          {matches.length} {matches.length === 1 ? "candidato encontrado" : "candidatos encontrados"}
          {lastMatchedAt ? ` · atualizado em ${new Date(lastMatchedAt).toLocaleDateString("pt-BR")}` : ""}
        </p>
        <button
          type="button"
          onClick={refreshMatches}
          disabled={refreshing}
          className="shrink-0 rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
        >
          {refreshing ? "Atualizando..." : "Atualizar candidatos"}
        </button>
      </div>

      {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

      {matches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-10 text-center text-neutral-600 dark:text-neutral-400">
          Nenhum candidato do banco de talentos bate com essa vaga ainda. Conforme novos candidatos se
          cadastram, use <strong>Atualizar candidatos</strong> para uma nova varredura.
        </div>
      ) : (
        <ol className="space-y-3">
          {matches.map((m, index) => (
            <li key={m.userId} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-400">#{index + 1}</span>
                    <h3 className="font-semibold truncate">{m.firstName}</h3>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {[m.professionalArea, [m.city, m.state].filter(Boolean).join("/")].filter(Boolean).join(" · ")}
                  </p>
                  {m.reason && <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">{m.reason}</p>}
                </div>
                <span className={`shrink-0 rounded-full border px-3 py-1 text-sm font-bold ${scoreColor(m.fitScore)}`}>{m.fitScore}</span>
              </div>

              <div className="mt-4 border-t border-neutral-100 dark:border-neutral-900 pt-3">
                {m.contactStatus === "accepted" && m.contact ? (
                  <div className="text-sm">
                    <p className="font-medium text-emerald-600 dark:text-emerald-400 mb-1">Contato liberado ✓</p>
                    <p className="text-neutral-700 dark:text-neutral-300">{m.contact.name}</p>
                    {m.contact.email && <p className="text-neutral-600 dark:text-neutral-400">{m.contact.email}</p>}
                    {m.contact.phone && <p className="text-neutral-600 dark:text-neutral-400">{m.contact.phone}</p>}
                  </div>
                ) : m.contactStatus === "pending" ? (
                  <p className="text-sm text-amber-600 dark:text-amber-400">Aguardando o candidato aceitar o contato.</p>
                ) : m.contactStatus === "declined" ? (
                  <p className="text-sm text-neutral-500">O candidato não liberou o contato.</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => requestContact(m.userId)}
                    disabled={contacting === m.userId}
                    className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50"
                  >
                    {contacting === m.userId ? "Enviando..." : "Solicitar contato"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
