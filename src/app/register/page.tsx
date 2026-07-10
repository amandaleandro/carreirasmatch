"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CAREER_SEGMENT_OPTIONS, type CareerSegment } from "@/lib/career-segments";
import { COMMON_PROFESSIONAL_AREAS } from "@/lib/course-catalog";

const AREA_PROMPT_SEGMENTS: CareerSegment[] = ["internship", "student"];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-16 w-full">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2 text-sm">
          Leva menos de um minuto.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
          <p className="text-xs text-neutral-500 mt-1">Mínimo de 8 caracteres.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Qual é o seu momento?</label>
          <select
            value={careerSegment}
            onChange={(e) => setCareerSegment(e.target.value as CareerSegment | "")}
            required
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
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
          <p className="text-xs text-neutral-500 mt-1">
            Definimos seu perfil com base nisso — as ferramentas mostradas dependem dele.
          </p>
        </div>

        {showAreaField && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Qual curso ou área você está cursando?
            </label>
            <input
              type="text"
              list="register-professional-areas"
              value={professionalArea}
              onChange={(e) => setProfessionalArea(e.target.value)}
              placeholder="Ex: Administração, Tecnologia, Direito..."
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
            <datalist id="register-professional-areas">
              {COMMON_PROFESSIONAL_AREAS.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

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
          className="w-full rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium py-2.5 disabled:opacity-50"
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>

      <p className="text-sm text-center text-neutral-600 dark:text-neutral-400 mt-5">
        Já tem conta?{" "}
        <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
          Entrar
        </Link>
      </p>
    </main>
  );
}
