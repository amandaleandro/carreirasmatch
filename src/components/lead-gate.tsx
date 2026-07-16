"use client";

import { useState, FormEvent } from "react";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";
import { formatBrazilPhone, validateContact } from "@/lib/contact-validation";

const LEAD_STORAGE_KEY = "carreiramatch:lead-contact";

type StoredContact = { name: string; email: string; phone: string };

export function getStoredLeadContact(): StoredContact | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(LEAD_STORAGE_KEY) ?? "null");
  } catch {
    return null;
  }
}

function storeLeadContact(contact: StoredContact) {
  localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(contact));
}

export function LeadGate({
  source,
  analysisId,
  vocationTestResultId,
  title = "Quase lá! Veja seu resultado",
  description = "Preencha seus dados para desbloquear o resultado agora, sem custo.",
  onUnlocked,
}: {
  source: "vocation_test" | "resume_analysis";
  analysisId?: string;
  vocationTestResultId?: string;
  title?: string;
  description?: string;
  onUnlocked: () => void;
}) {
  const stored = getStoredLeadContact();
  const [name, setName] = useState(stored?.name ?? "");
  const [email, setEmail] = useState(stored?.email ?? "");
  const [phone, setPhone] = useState(stored?.phone ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const contact = validateContact({ name, email, phone });
    if (!contact.success) {
      setError(contact.errors[0]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contact.data,
          source,
          analysisId,
          vocationTestResultId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar seus dados.");

      storeLeadContact(contact.data);
      track(ANALYTICS_EVENTS.LEAD_CAPTURED, { source });
      onUnlocked();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 p-6 md:p-8 max-w-lg mx-auto space-y-5">
      <div className="space-y-1.5 text-center">
        <h2 className="font-bold text-lg md:text-xl">{title}</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">
            Nome
          </label>
          <input
            type="text"
            name="name"
            autoComplete="name"
            required
            minLength={5}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
            className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">
            Email
          </label>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">
            Telefone
          </label>
          <input
            type="tel"
            name="phone"
            autoComplete="tel-national"
            inputMode="numeric"
            required
            minLength={14}
            maxLength={15}
            value={phone}
            onChange={(e) => setPhone(formatBrazilPhone(e.target.value))}
            placeholder="(11) 99999-9999"
            className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]"
          />
        </div>

        {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Ver meu resultado →"}
        </button>
        <p className="text-[10px] text-center text-neutral-500 dark:text-slate-400">
          Seus dados estão protegidos e não são compartilhados com terceiros.
        </p>
      </form>
    </div>
  );
}
