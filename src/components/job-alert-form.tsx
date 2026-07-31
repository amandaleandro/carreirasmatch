"use client";

import { useState } from "react";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { Bell, MapPin, Briefcase, Calendar } from "lucide-react";
import { useFeedback } from "@/components/feedback-provider";

type CreatedAlert = { id: string; query: string; city: string; state: string; frequency: string };

export function JobAlertForm({ initialQuery = "", initialCity = "", initialState = "", onCreated }: {
  initialQuery?: string;
  initialCity?: string;
  initialState?: string;
  onCreated?: (alert: CreatedAlert) => void;
}) {
  const { notify } = useFeedback();
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);
  const [state, setState] = useState(initialState);
  const [frequency, setFrequency] = useState("daily");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/job-alerts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query, city, state, frequency }),
      });
      if (response.status === 401) {
        window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        return;
      }
      const data = await response.json();
      if (response.ok) {
        track(ANALYTICS_EVENTS.JOB_ALERT_CREATED, { frequency });
        onCreated?.(data.alert);
        notify("success", "Alerta criado. Você receberá atualizações sobre vagas relevantes.");
        setQuery("");
        setCity("");
        setState("");
      }
      setMessage(response.ok ? "Alerta criado com sucesso! Você receberá as atualizações." : (data.error || "Ocorreu um erro."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-500" />
          Novo Alerta de Oportunidades
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">Configure os critérios para ser notificado sobre vagas relevantes.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Cargo / Função
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: Desenvolvedor, Vendedor..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/20 dark:focus:ring-slate-500/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Cidade
          </label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ex: São Paulo"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/20 dark:focus:ring-slate-500/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            UF
          </label>
          <input
            value={state}
            onChange={(e) => setState(e.target.value.toUpperCase())}
            maxLength={2}
            placeholder="Ex: SP"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white uppercase placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/20 dark:focus:ring-slate-500/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Frequência
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/20 dark:focus:ring-slate-500/20 transition-all"
          >
            <option value="daily">Resumo Diário</option>
            <option value="weekly">Resumo Semanal</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-6 py-2.5 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-colors shadow-sm"
        >
          {loading ? "Criando..." : "Criar Alerta"}
        </button>

        {message && (
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
