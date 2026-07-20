"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";

export default function PartnerRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [website, setWebsite] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/partner/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, cnpj, website, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao cadastrar.");

      const signInRes = await signIn("partner-credentials", { email, password, redirect: false });
      if (signInRes?.error) {
        throw new Error("Cadastro feito, mas não foi possível entrar automaticamente.");
      }

      router.push("/parceiro/dashboard");
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
      eyebrow="Para parceiros"
      headline="Divulgue seus cursos e treinamentos."
      description="Anuncie no nosso portal e alcance milhares de profissionais buscando qualificação para o mercado."
      highlights={["Destaque seus cursos no feed", "Painel exclusivo de cliques", "Checkout fácil via Mercado Pago"]}
    >
      <header className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Cadastrar como parceiro</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2 text-sm">Crie seu perfil e divulgue seus produtos hoje mesmo.</p>
      </header>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 shadow-lg shadow-slate-900/5 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Nome da Organização / Escola</label>
            <input type="text" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>CNPJ (opcional)</label>
            <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Website Oficial (opcional)</label>
            <input type="url" placeholder="https://" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>E-mail de Contato</label>
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
            {loading ? "Criando conta..." : "Criar conta de parceiro"}
          </button>
        </form>

        <p className="text-sm text-center text-neutral-600 dark:text-neutral-400 mt-5">
          Já tem conta de parceiro?{" "}
          <Link href="/parceiro/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
