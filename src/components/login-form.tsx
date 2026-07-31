"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFeedback } from "@/components/feedback-provider";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { notify } = useFeedback();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setLoading(false);
      setError("E-mail ou senha incorretos.");
      notify("error", "E-mail ou senha incorretos.");
      return;
    }

    setSuccess(true);
    notify("success", "Login realizado. Abrindo seu painel...");
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 800);
  }

  return (
    <div className="space-y-4 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      {googleEnabled && (
        <>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-white/5 py-2.5 px-4 text-xs font-semibold transition-all hover:bg-[#F8FAFC] dark:hover:bg-white/10 hover:border-[#CBD5E1] dark:hover:border-white/20 active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.86c2.26-2.09 3.56-5.17 3.56-8.87z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.86-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z" />
              <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29A11.99 11.99 0 0 0 0 12c0 1.93.46 3.76 1.29 5.38z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
            </svg>
            <span className="text-[#071827] dark:text-neutral-200">Entrar com Google</span>
          </button>
          <div className="flex items-center gap-3 text-[9px] font-bold text-[#64748B] uppercase tracking-widest">
            <div className="h-px flex-1 bg-[#E2E8F0] dark:bg-neutral-800" />
            ou usar e-mail
            <div className="h-px flex-1 bg-[#E2E8F0] dark:bg-neutral-800" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Campo E-mail */}
        <div className="space-y-1 relative group">
          <label className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider group-focus-within:text-[#2563EB] transition-colors">
            E-mail
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-neutral-400 group-focus-within:text-[#2563EB] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Digite seu e-mail"
              className="w-full rounded-xl border border-[#E2E8F0] bg-white pl-9.5 pr-4 py-2.5 text-xs text-[#071827] outline-none transition-all placeholder:text-neutral-400 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
            />
          </div>
        </div>

        {/* Campo Senha */}
        <div className="space-y-1 relative group">
          <div className="flex items-center justify-between">
            <label className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider group-focus-within:text-[#2563EB] transition-colors">
              Senha
            </label>
            <Link href="/esqueci-senha" className="text-[11px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline transition-colors">
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-neutral-400 group-focus-within:text-[#2563EB] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Digite sua senha"
              className="w-full rounded-xl border border-[#E2E8F0] bg-white pl-9.5 pr-9.5 py-2.5 text-xs text-[#071827] outline-none transition-all placeholder:text-neutral-400 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-neutral-400 hover:text-[#071827] dark:hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3.5 3.5 0 114.882 4.882M9.988 9.988L1.72 1.72m16.599 16.599L12 12m0 0l6.599-6.599M22 12c-1.275 4.057-5.065 7-9.543 7a9.963 9.963 0 01-2.062-.218M19.78 19.78L1.22 1.22" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[11px] font-semibold text-[#EF4444] animate-shake">
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || success}
          className={`w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-all active:scale-[0.98] disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer ${
            success
              ? "bg-[#22C55E]"
              : "bg-[#2563EB] hover:bg-[#1D4ED8]"
          }`}
        >
          {success ? (
            <>
              <svg className="h-4 w-4 text-white animate-in zoom-in duration-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
              Sucesso!
            </>
          ) : loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="4 8" className="opacity-40" />
                <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" className="opacity-60" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </button>
      </form>

      <p className="text-xs text-center text-[#64748B] dark:text-neutral-400">
        Não tem conta?{" "}
        <Link href="/register" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline transition-colors">
          Cadastre-se grátis
        </Link>
      </p>
    </div>
  );
}
