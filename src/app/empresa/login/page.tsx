"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";

export default function CompanyLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("company-credentials", { email, password, redirect: false });
      if (res?.error) throw new Error("E-mail ou senha inválidos.");
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
      headline="Bem-vindo de volta."
      description="Entre para ranquear currículos e encontrar os melhores candidatos para suas vagas."
      highlights={["Triagem automática de currículos", "Ranking por aderência à vaga", "Histórico das suas triagens"]}
    >
      <header className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Entrar como empresa</h1>
      </header>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 shadow-lg shadow-slate-900/5 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className={labelClass}>E-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Senha</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          </div>

          {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-sm text-center text-neutral-600 dark:text-neutral-400 mt-5">
          Ainda não tem conta?{" "}
          <Link href="/empresa/cadastro" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Cadastrar empresa
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
