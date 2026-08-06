"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFeedback } from "@/components/feedback-provider";

type Length = "curta" | "media" | "longa";
type Tone = "direto" | "caloroso" | "formal";

type Result = {
  answer: string;
};

const PRESET_QUESTIONS = [
  "Conte um pouco sobre você",
  "Por que você quer trabalhar nesta empresa?",
  "Por que devemos te contratar para esta vaga?",
  "Quais são seus principais pontos fortes?",
  "Descreva um desafio profissional que você superou",
  "Por que você está buscando uma nova oportunidade?",
];

const LENGTH_OPTIONS: { value: Length; label: string }[] = [
  { value: "curta", label: "Curta" },
  { value: "media", label: "Média" },
  { value: "longa", label: "Longa" },
];

const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: "direto", label: "Direto" },
  { value: "caloroso", label: "Caloroso" },
  { value: "formal", label: "Formal" },
];

export function ApplicationAnswerForm() {
  const [profileText, setProfileText] = useState("");
  const [jobText, setJobText] = useState("");
  const [question, setQuestion] = useState("");
  const [length, setLength] = useState<Length>("media");
  const [tone, setTone] = useState<Tone>("direto");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const [prefilledFromApplication, setPrefilledFromApplication] = useState(false);
  const { notify } = useFeedback();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const analysisId = searchParams.get("analysisId");

  useEffect(() => {
    if (!applicationId && !analysisId) return;
    const query = applicationId ? `applicationId=${applicationId}` : `analysisId=${analysisId}`;
    fetch(`/api/tools/prepare-context?${query}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.resumeText) setProfileText(data.resumeText);
        if (data.jobText) setJobText(data.jobText);
        setPrefilledFromApplication(true);
      })
      .catch(() => {});
  }, [applicationId, analysisId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!profileText.trim() || !jobText.trim() || !question.trim()) {
      setError("Preencha seu perfil, a vaga e a pergunta.");
      return;
    }

    setLoading(true);
    setResult(null);
    setCopied(false);

    try {
      const res = await fetch("/api/tools/application-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileText, jobText, question, length, tone }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");

      setResult(data as Result);
      notify("success", "Resposta gerada. Revise e copie quando estiver pronta.");
    } catch (err) {
      const feedback = err instanceof Error ? err.message : "Erro inesperado.";
      setError(feedback);
      notify("error", feedback);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.answer);
    setCopied(true);
    notify("success", "Resposta copiada para a área de transferência.");
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
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Resposta para pergunta de candidatura
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Cole seu perfil, a vaga e a pergunta do formulário para gerar uma resposta pronta para
          colar, usando só a sua experiência real.
        </p>
      </header>

      {prefilledFromApplication && (
        <p className="mb-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          Perfil e vaga preenchidos automaticamente a partir da sua candidatura.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">
            Seu perfil <span className="text-neutral-500 font-normal">— cole seu currículo ou resuma sua experiência</span>
          </label>
          <textarea
            value={profileText}
            onChange={(e) => setProfileText(e.target.value)}
            rows={6}
            placeholder="Ex: Analista de suporte há 3 anos. Experiência com atendimento N1/N2, Zendesk e SQL básico."
            className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            A vaga <span className="text-neutral-500 font-normal">— cole a descrição ou os principais requisitos</span>
          </label>
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            rows={5}
            placeholder="Ex: Estágio em Dados. Requisitos: lógica, SQL, vontade de aprender, boa comunicação."
            className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">A pergunta da candidatura</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_QUESTIONS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setQuestion(p)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                  question === p
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Escolha acima ou escreva a pergunta exata do formulário"
            className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
          />
        </div>

        <div className="flex gap-6 flex-wrap">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1.5">
              Tamanho
            </label>
            <div className="flex gap-2">
              {LENGTH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLength(opt.value)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-all ${
                    length === opt.value
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1.5">
              Tom
            </label>
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
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 text-white font-semibold px-5 py-2.5 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? "Gerando resposta..." : "Gerar resposta"}
        </button>
      </form>

      {result && (
        <div className="mt-10">
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Sua resposta</h3>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {copied ? "Copiado!" : "Copiar texto"}
              </button>
            </div>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
              {result.answer}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
