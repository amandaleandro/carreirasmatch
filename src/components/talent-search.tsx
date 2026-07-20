"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";

type ContactStatus = "none" | "pending" | "accepted" | "declined";

type TalentMatch = {
  userId: string;
  firstName: string;
  professionalArea: string;
  city: string;
  state: string;
  fitScore: number;
  reason: string;
  contactStatus: ContactStatus;
  contact: { name: string; email: string; phone: string } | null;
  isTopPlayer?: boolean;
};

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900";
  if (score >= 40) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900";
  return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900";
}

export function TalentSearch() {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [jobText, setJobText] = useState("");
  const [area, setArea] = useState("");
  const [state, setState] = useState("");
  const [matches, setMatches] = useState<TalentMatch[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contacting, setContacting] = useState<string | null>(null);
  const [savingVaga, setSavingVaga] = useState(false);

  async function saveAsVaga() {
    setSavingVaga(true);
    setError(null);
    try {
      const res = await fetch("/api/empresa/vagas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: jobTitle, description: jobText, area, state }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar a vaga.");
      router.push(`/empresa/vagas/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setSavingVaga(false);
    }
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!jobTitle.trim() || !jobText.trim()) {
      setError("Preencha o cargo e a descrição da vaga.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/empresa/talentos/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, jobText, area, state }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro na busca.");
      setMatches(data.matches as TalentMatch[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function requestContact(userId: string) {
    setContacting(userId);
    try {
      const res = await fetch("/api/empresa/talentos/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, jobTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao solicitar contato.");
      setMatches((prev) =>
        prev
          ? prev.map((m) => (m.userId === userId ? { ...m, contactStatus: data.status as ContactStatus } : m))
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setContacting(null);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors";
  const labelClass = "block text-sm font-medium mb-1.5";

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="space-y-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <div>
          <label className={labelClass}>Cargo da vaga</label>
          <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={inputClass} maxLength={140} placeholder="Ex: Auxiliar administrativo" />
        </div>
        <div>
          <label className={labelClass}>Descrição da vaga</label>
          <textarea value={jobText} onChange={(e) => setJobText(e.target.value)} rows={5} className={inputClass} maxLength={5000} placeholder="Requisitos, responsabilidades e perfil desejado." />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelClass}>Filtrar por área (opcional)</label>
            <input type="text" value={area} onChange={(e) => setArea(e.target.value)} className={inputClass} placeholder="Ex: Administração" />
          </div>
          <div className="w-24">
            <label className={labelClass}>UF</label>
            <input type="text" value={state} onChange={(e) => setState(e.target.value.toUpperCase())} maxLength={2} className={inputClass} />
          </div>
        </div>

        {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Buscando candidatos..." : "Buscar candidatos"}
        </button>
      </form>

      {matches !== null && (
        matches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-10 text-center text-neutral-600 dark:text-neutral-400">
            Nenhum candidato disponível no banco de talentos para esses critérios ainda.
          </div>
        ) : (
          <>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 px-4 py-3">
            <p className="text-sm text-blue-900/80 dark:text-blue-200/80">
              Quer acompanhar esta busca ao longo do tempo? Salve como vaga.
            </p>
            <button
              type="button"
              onClick={saveAsVaga}
              disabled={savingVaga}
              className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {savingVaga ? "Salvando..." : "Salvar como vaga"}
            </button>
          </div>
          <ol className="space-y-3">
            {matches.map((m, index) => (
              <li key={m.userId} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-400">#{index + 1}</span>
                      <h3 className="font-semibold truncate">{m.firstName}</h3>
                      {m.isTopPlayer && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-200/50 dark:border-amber-500/20">
                          <Trophy className="h-3 w-3 fill-amber-500 text-amber-500" /> Top Match Gamificado
                        </span>
                      )}
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
          </>
        )
      )}
    </div>
  );
}
