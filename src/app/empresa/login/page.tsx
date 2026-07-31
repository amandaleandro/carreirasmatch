"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { useFeedback } from "@/components/feedback-provider";

export default function CompanyLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { notify } = useFeedback();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("company-credentials", { email, password, redirect: false });
      if (res?.error) throw new Error("E-mail ou senha inválidos.");
      router.push("/empresa");
      notify("success", "Login realizado. Abrindo o painel da empresa...");
      router.refresh();
    } catch (err) {
      const feedback = err instanceof Error ? err.message : "Erro inesperado.";
      setError(feedback);
      notify("error", feedback);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Para empresas"
      headline="Bem-vindo de volta."
      description="Entre para ranquear currículos e encontrar os melhores candidatos para suas vagas."
      highlights={["Triagem automática de currículos", "Ranking por aderência à vaga", "Histórico das suas triagens"]}
    >
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5 p-6 sm:p-8 space-y-6">
        {/* Card Header inside the card */}
        <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-inner shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-900/50 mb-1">
              <ShieldCheck className="w-3 h-3" />
              Área da Empresa
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Entrar como empresa
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              E-mail corporativo
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="suaempresa@dominio.com"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 pl-10 pr-3.5 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Senha de acesso
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 pl-10 pr-3.5 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 text-sm font-bold shadow-md shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            <span>{loading ? "Entrando..." : "Entrar como empresa"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Ainda não tem conta de empresa?{" "}
            <Link href="/empresa/cadastro" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Cadastrar empresa
            </Link>
          </p>

          <p className="text-[11px] text-slate-400">
            É um candidato?{" "}
            <Link href="/login" className="font-semibold text-slate-600 dark:text-slate-300 hover:underline">
              Entrar como candidato
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
