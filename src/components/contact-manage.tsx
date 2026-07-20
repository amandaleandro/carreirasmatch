"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

export function ContactManage({
  contactId,
  initialNote,
  initialInterviewAt,
}: {
  contactId: string;
  initialNote: string;
  initialInterviewAt: string | null;
}) {
  const router = useRouter();
  const [note, setNote] = useState(initialNote);
  const [interview, setInterview] = useState(toLocalInput(initialInterviewAt));
  const [savingInterview, setSavingInterview] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function patch(payload: { note?: string; interviewAt?: string | null }) {
    const res = await fetch(`/api/empresa/contatos/${contactId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error();
  }

  async function saveNote(value: string) {
    try {
      await patch({ note: value });
    } catch {
      // Silencioso: mantém no estado local, nova tentativa no próximo blur.
    }
  }

  async function saveInterview(value: string | null) {
    setSavingInterview(true);
    setMsg(null);
    try {
      await patch({ interviewAt: value ? new Date(value).toISOString() : null });
      setMsg(value ? "Entrevista agendada. O candidato foi avisado por e-mail." : "Entrevista removida.");
      router.refresh();
    } catch {
      setMsg("Não foi possível salvar agora.");
    } finally {
      setSavingInterview(false);
    }
  }

  return (
    <div className="mt-3 border-t border-emerald-200/60 dark:border-emerald-900/60 pt-3 space-y-3">
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wide text-neutral-400 mb-1">
          Anotação
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={(e) => saveNote(e.target.value)}
          rows={1}
          placeholder="Anotação interna (salva ao sair do campo)..."
          className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-y"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wide text-neutral-400 mb-1">
          Entrevista
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="datetime-local"
            value={interview}
            onChange={(e) => setInterview(e.target.value)}
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
          <button
            type="button"
            onClick={() => saveInterview(interview)}
            disabled={savingInterview || !interview}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {savingInterview ? "Salvando..." : "Agendar"}
          </button>
          {initialInterviewAt && (
            <button
              type="button"
              onClick={() => {
                setInterview("");
                saveInterview(null);
              }}
              disabled={savingInterview}
              className="rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
            >
              Remover
            </button>
          )}
        </div>
        {msg && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5">{msg}</p>}
      </div>
    </div>
  );
}
