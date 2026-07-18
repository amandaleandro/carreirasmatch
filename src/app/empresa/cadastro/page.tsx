"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";

export default function CompanyRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/empresa/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, cnpj, city, state, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao cadastrar.");

      const signInRes = await signIn("company-credentials", { email, password, redirect: false });
      if (signInRes?.error) {
        throw new Error("Cadastro feito, mas não foi possível entrar automaticamente.");
      }

      router.push("/empresa");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]";
  const labelClass =
    "block text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-wider";

  return (
    <AuthShell
      eyebrow="Para empresas"
      headline="Encontre os candidatos certos, ranqueados por IA."
      description="Cadastre sua empresa e ranqueie os currículos que você recebe pela aderência real à vaga, em minutos e não em dias."
      highlights={[
        "Triagem automática de currículos",
        "Ranking por aderência à vaga",
        "Comece grátis, sem cartão",
      ]}
    >
      <header className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Cadastrar empresa</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2 text-sm">Leva menos de um minuto.</p>
      </header>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 shadow-lg shadow-slate-900/5 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Nome da empresa</label>
            <input type="text" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>CNPJ (opcional)</label>
            <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} className={inputClass} />
          </div>
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <label className={labelClass}>Cidade</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
            </div>
            <div className="w-24 space-y-1.5">
              <label className={labelClass}>UF</label>
              <input type="text" maxLength={2} value={state} onChange={(e) => setState(e.target.value.toUpperCase())} className={inputClass} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>E-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Senha</label>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
            <p className="text-xs text-neutral-500">Mínimo de 8 caracteres.</p>
          </div>

          {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Criando conta..." : "Criar conta da empresa"}
          </button>
        </form>

        <p className="text-sm text-center text-neutral-600 dark:text-neutral-400 mt-5">
          Já tem conta de empresa?{" "}
          <Link href="/empresa/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
