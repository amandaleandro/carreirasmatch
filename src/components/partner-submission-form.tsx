"use client";

import { useState } from "react";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

export function PartnerSubmissionForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/partner-submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await response.json();
    if (response.ok) {
      track(ANALYTICS_EVENTS.PARTNER_SUBMISSION_SENT);
      setSent(true);
    } else {
      setError(data.error ?? "Não foi possível enviar.");
    }
  }
  if (sent) return <div className="rounded-2xl bg-emerald-50 p-6 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">Recebemos sua publicação. Nossa equipe fará a revisão antes de divulgar.</div>;
  const field = "rounded-xl border bg-transparent px-3 py-2.5 text-sm dark:border-neutral-700";
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <input required name="organization" placeholder="Organização" className={field} />
      <select required name="organizationType" className={field}><option value="company">Empresa</option><option value="city_hall">Prefeitura</option><option value="school">Escola</option><option value="course">Instituição de cursos</option><option value="influencer">Parceiro ou influenciador</option><option value="other">Outro</option></select>
      <input required name="contactName" placeholder="Nome do responsável" className={field} />
      <input required type="email" name="email" placeholder="E-mail" className={field} />
      <input name="phone" placeholder="Telefone" className={field} />
      <input name="url" type="url" placeholder="Link oficial, opcional" className={field} />
      <input name="state" maxLength={2} placeholder="UF" className={field} />
      <input name="city" placeholder="Cidade" className={field} />
      <input required name="title" placeholder="Título da vaga, curso ou parceria" className={`${field} sm:col-span-2`} />
      <textarea required name="description" minLength={20} rows={7} placeholder="Descrição completa" className={`${field} sm:col-span-2`} />
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <button className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white sm:col-span-2">Enviar para revisão</button>
    </form>
  );
}
