"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Mail, Lock, MapPin, FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { useFeedback } from "@/components/feedback-provider";

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
  const { notify } = useFeedback();

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
      notify("success", "Empresa cadastrada. Abrindo seu painel...");
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
      headline="Encontre os candidatos certos, ranqueados por IA."
      description="Cadastre sua empresa e ranqueie os currículos que você recebe pela aderência real à vaga, em minutos e não em dias."
      highlights={[
        "Triagem automática de currículos",
        "Ranking por aderência à vaga",
        "Comece grátis, sem cartão",
      ]}
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
              Portal Corporativo
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Cadastrar empresa
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Leva menos de 1 minuto.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Nome da empresa
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: ACME Tecnologia"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 pl-10 pr-3.5 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              CNPJ (opcional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0000-00"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 pl-10 pr-3.5 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_90px] gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cidade
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: São Paulo"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 pl-10 pr-3.5 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                UF
              </label>
              <input
                type="text"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                placeholder="SP"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-3 py-3 text-sm text-center uppercase font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
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
            <span>{loading ? "Criando conta..." : "Criar conta da empresa"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Já tem conta de empresa?{" "}
            <Link href="/empresa/login" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Entrar
            </Link>
          </p>

          <p className="text-[11px] text-slate-400">
            É um candidato?{" "}
            <Link href="/register" className="font-semibold text-slate-600 dark:text-slate-300 hover:underline">
              Criar conta de candidato
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
