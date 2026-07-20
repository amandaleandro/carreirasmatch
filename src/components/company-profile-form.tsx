"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Company = {
  name: string;
  cnpj: string;
  city: string;
  state: string;
  logoUrl: string;
  email: string;
};

const inputClass =
  "w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors";
const labelClass = "block text-sm font-medium mb-1.5";

export function CompanyProfileForm({ company }: { company: Company }) {
  const router = useRouter();
  const [form, setForm] = useState<Company>(company);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);
  const [passMsg, setPassMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function set<K extends keyof Company>(key: K, value: Company[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/empresa/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar.");
      setMsg({ kind: "ok", text: "Dados salvos." });
      router.refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Erro inesperado." });
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setSavingPass(true);
    setPassMsg(null);
    try {
      const res = await fetch("/api/empresa/perfil/senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao trocar a senha.");
      setPassMsg({ kind: "ok", text: "Senha atualizada." });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPassMsg({ kind: "err", text: err instanceof Error ? err.message : "Erro inesperado." });
    } finally {
      setSavingPass(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={saveProfile} className="space-y-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <h2 className="font-semibold">Dados da empresa</h2>

        <div>
          <label className={labelClass}>Nome da empresa</label>
          <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} minLength={2} />
        </div>
        <div>
          <label className={labelClass}>CNPJ</label>
          <input type="text" value={form.cnpj} onChange={(e) => set("cnpj", e.target.value)} className={inputClass} />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelClass}>Cidade</label>
            <input type="text" value={form.city} onChange={(e) => set("city", e.target.value)} className={inputClass} />
          </div>
          <div className="w-24">
            <label className={labelClass}>UF</label>
            <input type="text" maxLength={2} value={form.state} onChange={(e) => set("state", e.target.value.toUpperCase())} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Logo (URL)</label>
          <div className="flex items-center gap-3">
            {form.logoUrl && /^https?:\/\//i.test(form.logoUrl) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.logoUrl} alt="Logo" className="h-10 w-10 rounded-lg object-cover border border-neutral-200 dark:border-neutral-800" />
            )}
            <input type="url" value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} className={inputClass} placeholder="https://..." />
          </div>
        </div>
        <div>
          <label className={labelClass}>E-mail de acesso</label>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputClass} />
          <p className="text-xs text-neutral-500 mt-1">É com este e-mail que você entra no sistema.</p>
        </div>

        {msg && (
          <p className={`text-sm font-semibold ${msg.kind === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
            {msg.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar dados"}
        </button>
      </form>

      <form onSubmit={savePassword} className="space-y-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <h2 className="font-semibold">Trocar senha</h2>
        <div>
          <label className={labelClass}>Senha atual</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Nova senha</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} minLength={8} required />
          <p className="text-xs text-neutral-500 mt-1">Mínimo de 8 caracteres.</p>
        </div>

        {passMsg && (
          <p className={`text-sm font-semibold ${passMsg.kind === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
            {passMsg.text}
          </p>
        )}

        <button
          type="submit"
          disabled={savingPass}
          className="rounded-xl border border-neutral-200 dark:border-neutral-800 px-6 py-3 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
        >
          {savingPass ? "Salvando..." : "Trocar senha"}
        </button>
      </form>
    </div>
  );
}
