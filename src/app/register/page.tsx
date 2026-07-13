"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { CAREER_SEGMENT_OPTIONS, type CareerSegment } from "@/lib/career-segments";
import { COMMON_PROFESSIONAL_AREAS } from "@/lib/course-catalog";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";

const AREA_PROMPT_SEGMENTS: CareerSegment[] = ["internship", "student"];

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [careerSegment, setCareerSegment] = useState<CareerSegment | "">("");
  const [professionalArea, setProfessionalArea] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showAreaField = careerSegment !== "" && AREA_PROMPT_SEGMENTS.includes(careerSegment);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          careerSegment: careerSegment || null,
          professionalArea: showAreaField && professionalArea ? professionalArea : null,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erro ao cadastrar.");

      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        throw new Error("Cadastro feito, mas não foi possível entrar automaticamente.");
      }

      track(ANALYTICS_EVENTS.SIGNUP_COMPLETED, { careerSegment: careerSegment || "unknown" });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Comece agora"
      headline="Sua carreira merece um plano, não só um currículo."
      description="Crie sua conta gratuita e receba um diagnóstico claro do que já está bom e do que ajustar antes de aplicar."
      highlights={[
        "Score de aderência à vaga",
        "Plano de ação personalizado",
        "Sem cartão de crédito para começar",
      ]}
    >
      <header className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Criar conta</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2 text-sm">
          Leva menos de um minuto.
        </p>
      </header>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 shadow-lg shadow-slate-900/5 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]"
              />
              <p className="text-xs text-neutral-500">Mínimo de 8 caracteres.</p>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">
                Qual é o seu momento?
              </label>
              <select
                value={careerSegment}
                onChange={(e) => setCareerSegment(e.target.value as CareerSegment | "")}
                required
                className="w-full rounded-xl border border-neutral-200 bg-white text-neutral-900 px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-neutral-100"
              >
                <option value="" disabled>
                  Selecione uma opção
                </option>
                {CAREER_SEGMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500">
                Definimos seu perfil com base nisso — as ferramentas mostradas dependem dele.
              </p>
            </div>

            {showAreaField && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">
                  Qual curso ou área você está cursando?
                </label>
                <input
                  type="text"
                  list="register-professional-areas"
                  value={professionalArea}
                  onChange={(e) => setProfessionalArea(e.target.value)}
                  placeholder="Ex: Administração, Tecnologia, Direito..."
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]"
                />
                <datalist id="register-professional-areas">
                  {COMMON_PROFESSIONAL_AREAS.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>
            )}

            {error && <p className="text-sm font-semibold text-red-500">{error}</p>}

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Ao criar sua conta, você concorda com os{" "}
              <Link href="/termos" className="underline hover:text-neutral-700 dark:hover:text-neutral-300">
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link href="/privacidade" className="underline hover:text-neutral-700 dark:hover:text-neutral-300">
                Política de Privacidade
              </Link>
              .
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <p className="text-sm text-center text-neutral-600 dark:text-neutral-400 mt-5">
            Já tem conta?{" "}
            <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Entrar
            </Link>
          </p>
      </div>
    </AuthShell>
  );
}
