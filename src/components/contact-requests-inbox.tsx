"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ContactRequest = {
  id: string;
  companyName: string;
  jobTitle: string;
  message: string;
  status: string;
  createdAt: string;
};

export function ContactRequestsInbox({ initialRequests }: { initialRequests: ContactRequest[] }) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function respond(id: string, action: "accept" | "decline") {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/contact-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao responder.");
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: data.status } : r)));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Empresas interessadas</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-sm">
          Empresas que querem falar com você. Ao aceitar, elas veem seu nome, e-mail e telefone.
        </p>
      </div>

      {requests.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhum pedido de contato por enquanto.</p>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li key={r.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{r.companyName}</p>
                  {r.jobTitle && <p className="text-sm text-neutral-500 mt-0.5">Vaga: {r.jobTitle}</p>}
                  {r.message && <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">{r.message}</p>}
                </div>
                {r.status === "accepted" && (
                  <span className="shrink-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Contato liberado</span>
                )}
                {r.status === "declined" && (
                  <span className="shrink-0 text-xs font-semibold text-neutral-500">Recusado</span>
                )}
              </div>

              {r.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => respond(r.id, "accept")}
                    disabled={busy === r.id}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {busy === r.id ? "..." : "Liberar contato"}
                  </button>
                  <button
                    type="button"
                    onClick={() => respond(r.id, "decline")}
                    disabled={busy === r.id}
                    className="rounded-lg border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
                  >
                    Recusar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
