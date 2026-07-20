"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  isSelf: boolean;
};

export function TeamManager({ members }: { members: TeamMember[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<{ email: string; password: string } | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  async function addMember(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setTempPassword(null);
    setAdding(true);
    try {
      const res = await fetch("/api/empresa/equipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao adicionar membro.");
      setTempPassword({ email, password: data.tempPassword as string });
      setName("");
      setEmail("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setAdding(false);
    }
  }

  async function removeMember(id: string) {
    if (!window.confirm("Remover este membro? Ele perde o acesso à área da empresa.")) return;
    setRemoving(id);
    setError(null);
    try {
      const res = await fetch(`/api/empresa/equipe/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao remover.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setRemoving(null);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors";

  return (
    <div className="space-y-6">
      <ul className="space-y-3">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold truncate">{m.name || m.email}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    m.role === "owner"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  }`}
                >
                  {m.role === "owner" ? "Responsável" : "Membro"}
                </span>
                {m.isSelf && <span className="text-xs text-neutral-400">(você)</span>}
              </div>
              <p className="text-sm text-neutral-500 truncate">{m.email}</p>
            </div>
            {!m.isSelf && (
              <button
                type="button"
                onClick={() => removeMember(m.id)}
                disabled={removing === m.id}
                className="shrink-0 rounded-lg border border-red-200 dark:border-red-900 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50"
              >
                {removing === m.id ? "Removendo..." : "Remover"}
              </button>
            )}
          </li>
        ))}
      </ul>

      {tempPassword && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/20 p-5">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Membro adicionado ✓</p>
          <p className="text-sm text-emerald-900/80 dark:text-emerald-200/80 mt-1">
            Enviamos a senha temporária para <strong>{tempPassword.email}</strong>. Anote-a agora, ela não
            será mostrada de novo:
          </p>
          <p className="mt-2 rounded-lg bg-white dark:bg-neutral-950 border border-emerald-200 dark:border-emerald-900 px-3 py-2 font-mono text-sm">
            {tempPassword.password}
          </p>
        </div>
      )}

      <form onSubmit={addMember} className="space-y-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <h2 className="font-semibold">Adicionar membro</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" className={inputClass} />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className={inputClass} />
        </div>
        {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={adding}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50"
        >
          {adding ? "Adicionando..." : "Adicionar à equipe"}
        </button>
      </form>
    </div>
  );
}
