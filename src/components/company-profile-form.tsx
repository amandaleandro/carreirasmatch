"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type CompanyData = {
  name: string;
  cnpj: string;
  city: string;
  state: string;
  logoUrl: string;
};

type AccountData = {
  name: string;
  email: string;
};

const inputClass =
  "w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors";
const labelClass = "block text-sm font-medium mb-1.5";

function Message({ msg }: { msg: { kind: "ok" | "err"; text: string } | null }) {
  if (!msg) return null;
  return (
    <p className={`text-sm font-semibold ${msg.kind === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
      {msg.text}
    </p>
  );
}

export function CompanyProfileForm({
  company,
  account,
}: {
  company: CompanyData;
  account: AccountData;
}) {
  const router = useRouter();

  // Dados da empresa
  const [org, setOrg] = useState<CompanyData>(company);
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgMsg, setOrgMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Minha conta
  const [acc, setAcc] = useState<AccountData>(account);
  const [savingAcc, setSavingAcc] = useState(false);
  const [accMsg, setAccMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);
  const [passMsg, setPassMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function saveOrg(e: FormEvent) {
    e.preventDefault();
    setSavingOrg(true);
    setOrgMsg(null);
    try {
      const res = await fetch("/api/empresa/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(org),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar.");
      setOrgMsg({ kind: "ok", text: "Dados da empresa salvos." });
      router.refresh();
    } catch (err) {
      setOrgMsg({ kind: "err", text: err instanceof Error ? err.message : "Erro inesperado." });
    } finally {
      setSavingOrg(false);
    }
  }

  async function saveAccount(e: FormEvent) {
    e.preventDefault();
    setSavingAcc(true);
    setAccMsg(null);
    try {
      const res = await fetch("/api/empresa/conta", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(acc),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar.");
      setAccMsg({ kind: "ok", text: "Conta atualizada." });
      router.refresh();
    } catch (err) {
      setAccMsg({ kind: "err", text: err instanceof Error ? err.message : "Erro inesperado." });
    } finally {
      setSavingAcc(false);
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setSavingPass(true);
    setPassMsg(null);
    try {
      const res = await fetch("/api/empresa/conta/senha", {
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
      <form onSubmit={saveOrg} className="space-y-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <h2 className="font-semibold">Dados da empresa</h2>

        <div>
          <label className={labelClass}>Nome da empresa</label>
          <input type="text" value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} className={inputClass} minLength={2} />
        </div>
        <div>
          <label className={labelClass}>CNPJ</label>
          <input type="text" value={org.cnpj} onChange={(e) => setOrg({ ...org, cnpj: e.target.value })} className={inputClass} />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelClass}>Cidade</label>
            <input type="text" value={org.city} onChange={(e) => setOrg({ ...org, city: e.target.value })} className={inputClass} />
          </div>
          <div className="w-24">
            <label className={labelClass}>UF</label>
            <input type="text" maxLength={2} value={org.state} onChange={(e) => setOrg({ ...org, state: e.target.value.toUpperCase() })} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Logo (URL)</label>
          <div className="flex items-center gap-3">
            {org.logoUrl && /^https?:\/\//i.test(org.logoUrl) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logoUrl} alt="Logo" className="h-10 w-10 rounded-lg object-cover border border-neutral-200 dark:border-neutral-800" />
            )}
            <input type="url" value={org.logoUrl} onChange={(e) => setOrg({ ...org, logoUrl: e.target.value })} className={inputClass} placeholder="https://..." />
          </div>
        </div>

        <Message msg={orgMsg} />

        <button type="submit" disabled={savingOrg} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50">
          {savingOrg ? "Salvando..." : "Salvar dados"}
        </button>
      </form>

      <form onSubmit={saveAccount} className="space-y-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
        <h2 className="font-semibold">Minha conta</h2>
        <div>
          <label className={labelClass}>Seu nome</label>
          <input type="text" value={acc.name} onChange={(e) => setAcc({ ...acc, name: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>E-mail de acesso</label>
          <input type="email" value={acc.email} onChange={(e) => setAcc({ ...acc, email: e.target.value })} className={inputClass} />
          <p className="text-xs text-neutral-500 mt-1">É com este e-mail que você entra no sistema.</p>
        </div>

        <Message msg={accMsg} />

        <button type="submit" disabled={savingAcc} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50">
          {savingAcc ? "Salvando..." : "Salvar conta"}
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

        <Message msg={passMsg} />

        <button type="submit" disabled={savingPass} className="rounded-xl border border-neutral-200 dark:border-neutral-800 px-6 py-3 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50">
          {savingPass ? "Salvando..." : "Trocar senha"}
        </button>
      </form>
    </div>
  );
}
