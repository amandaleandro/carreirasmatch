"use client";

import { useState } from "react";

type CreatedAlert = { id: string; query: string; city: string; state: string; frequency: string };

export function JobAlertForm({ initialQuery = "", initialCity = "", initialState = "", onCreated }: {
  initialQuery?: string;
  initialCity?: string;
  initialState?: string;
  onCreated?: (alert: CreatedAlert) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);
  const [state, setState] = useState(initialState);
  const [frequency, setFrequency] = useState("daily");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
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
    if (response.ok) onCreated?.(data.alert);
    setMessage(response.ok ? "Alerta criado. Você receberá novas oportunidades por e-mail." : data.error);
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-900 dark:bg-blue-950/20">
      <h2 className="font-bold">Receba novas vagas</h2>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Crie um alerta gratuito por cargo e localização.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cargo" className="rounded-lg border bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950" />
        <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Cidade" className="rounded-lg border bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950" />
        <input value={state} onChange={(event) => setState(event.target.value.toUpperCase())} maxLength={2} placeholder="UF" className="rounded-lg border bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950" />
        <select value={frequency} onChange={(event) => setFrequency(event.target.value)} className="rounded-lg border bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950">
          <option value="daily">Resumo diário</option>
          <option value="weekly">Resumo semanal</option>
        </select>
      </div>
      <button className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Criar alerta grátis</button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </form>
  );
}
