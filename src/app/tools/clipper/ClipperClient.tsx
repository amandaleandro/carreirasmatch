"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Scissors, CheckCircle2, BookmarkCheck, ArrowRight } from "lucide-react";

export function ClipperClient() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedData, setSavedData] = useState<{
    extractedRole: string;
    extractedCompany: string;
    location: string;
    salaryEstimate: string;
    keyRequirements: string[];
    quickSummary: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleQuickSave() {
    if (!description.trim()) {
      setError("Por favor, cole a descrição da vaga.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/applications/quick-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, company, description, url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar vaga.");
      setSavedData(data.extracted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-6 pb-12 font-sans">
        <div className="flex items-center justify-between">
          <Link
            href="/applications"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ir para Meu Kanban de Candidaturas
          </Link>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium">
            Candidatura Preparada
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-title font-bold text-neutral-900 dark:text-white">
                Clipper & Captura Rápida de Vagas
              </h1>
              <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400">
                Cole o anúncio de qualquer vaga do LinkedIn, Gupy ou Indeed para extrair requisitos e salvar no Kanban em 1 segundo.
              </p>
            </div>
          </div>
        </div>

        {!savedData ? (
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-900 dark:text-white">
                Link da Vaga (Opcional):
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://gupy.io/vaga/... ou https://linkedin.com/jobs/..."
                className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-900 dark:text-white">
                  Título do Cargo (Opcional):
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Desenvolvedor React"
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-900 dark:text-white">
                  Empresa (Opcional):
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Ex: Empresa X"
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-900 dark:text-white">
                Descrição Completa do Anúncio (Obrigatório):
              </label>
              <textarea
                rows={7}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cole o texto completo da vaga aqui..."
                className="w-full p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
              />
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            <button
              onClick={handleQuickSave}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" /> Processando Requisitos & Salvando no Kanban...
                </>
              ) : (
                <>
                  <BookmarkCheck className="w-4 h-4" /> Capturar e Criar Candidatura no Kanban
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-800 space-y-5 shadow-md animate-in fade-in">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>Vaga capturada e adicionada com sucesso ao seu Kanban de Candidaturas!</span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-400">Cargo Extraído</span>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {savedData.extractedRole} — <span className="text-neutral-500">{savedData.extractedCompany}</span>
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
                {savedData.quickSummary}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
              <span className="font-semibold text-neutral-900 dark:text-white block">Requisitos Principais Identificados:</span>
              <div className="flex flex-wrap gap-1.5">
                {savedData.keyRequirements.map((req, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 text-[11px] font-medium"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/applications"
                className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs text-center transition-all flex items-center justify-center gap-2"
              >
                <span>Ver Candidatura no Kanban</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => {
                  setSavedData(null);
                  setDescription("");
                  setTitle("");
                  setCompany("");
                  setUrl("");
                }}
                className="py-3 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Capturar Outra Vaga
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
