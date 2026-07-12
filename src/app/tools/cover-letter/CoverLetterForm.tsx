"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

type Tone = "formal" | "direto" | "entusiasmado";

type Result = {
  coverLetter: string;
  tips: string[];
};

const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: "formal", label: "Formal" },
  { value: "direto", label: "Direto" },
  { value: "entusiasmado", label: "Entusiasmado" },
];

export function CoverLetterForm() {
  const [resumeText, setResumeText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobText, setJobText] = useState("");
  const [tone, setTone] = useState<Tone>("formal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!resumeText.trim() || !jobTitle.trim()) {
      setError("Cole seu currículo e informe o cargo da vaga.");
      return;
    }

    setLoading(true);
    setResult(null);
    setCopied(false);

    try {
      const res = await fetch("/api/tools/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobTitle, jobText, tone }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");

      setResult(data as Result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link href="/tools" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar para ferramentas
      </Link>
      <header className="mt-4 mb-10">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
          Redação com IA
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Carta de apresentação</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Cole seu currículo e a vaga desejada para gerar uma carta de apresentação pronta para
          enviar.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Cargo da vaga</label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Ex: Assistente administrativo"
            className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Descrição da vaga (opcional, mas melhora o resultado)
          </label>
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            rows={5}
            placeholder="Cole aqui a descrição da vaga"
            className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Seu currículo</label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={10}
            placeholder="Cole aqui o texto do seu currículo"
            className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tom da carta</label>
          <div className="flex gap-2">
            {TONE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTone(opt.value)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-all ${
                  tone === opt.value
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 text-white font-semibold px-5 py-2.5 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? "Gerando..." : "Gerar carta de apresentação"}
        </button>
      </form>

      {result && (
        <div className="mt-10 space-y-6">
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Sua carta</h3>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {copied ? "Copiado!" : "Copiar texto"}
              </button>
            </div>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
              {result.coverLetter}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <h3 className="font-semibold mb-3">Antes de enviar, personalize ainda mais</h3>
            <ul className="space-y-2 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
              {result.tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
