"use client";

import { useState } from "react";
import { AtsVerifierResult } from "@/components/ats-verifier-result";
import { AtsStandaloneAnalysis } from "@/lib/ats-checker";

export default function VerificadorAtsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AtsStandaloneAnalysis | null>(null);
  const [rawExtractedText, setRawExtractedText] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file && !resumeText.trim()) {
      setError("Envie um arquivo PDF ou cole o texto do seu currículo.");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("resume", file);
      } else {
        formData.append("resumeText", resumeText);
      }

      const res = await fetch("/api/verificador-ats", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao processar verificação do ATS.");
      }

      setResult(data);
      setRawExtractedText(resumeText || data.extractedTextPreview || "");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao verificar currículo.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setFile(null);
    setResumeText("");
    setError(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Principal */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs">
            <span>✨</span> Verificador ATS 100% Gratuito
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Seu currículo consegue ser lido pelo robô do ATS?
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
            Envie seu arquivo e descubra instantaneamente problemas de formatação, extração de texto, contatos e qualidade de conteúdo antes de se candidatar.
          </p>
        </div>

        {!result ? (
          /* Formulário de Envio */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selector de Arquivo (PDF) */}
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Selecione seu currículo em PDF
                </label>
                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-800/30 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const selected = e.target.files?.[0];
                      if (selected) {
                        setFile(selected);
                        setResumeText("");
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2 pointer-events-none">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto text-xl">
                      📄
                    </div>
                    {file ? (
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          Arraste seu PDF aqui ou clique para selecionar
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Tamanho máximo: 5MB (Apenas arquivos PDF legíveis)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Separador OU */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                <span className="bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-400 uppercase tracking-widest relative">
                  OU
                </span>
              </div>

              {/* Área de Texto Cru */}
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Cole o texto do seu currículo
                </label>
                <textarea
                  rows={6}
                  placeholder="Se preferir, cole o conteúdo do seu currículo diretamente aqui..."
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value);
                    if (e.target.value) setFile(null);
                  }}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-black text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin">⏳</span> Analisando leitura pelo ATS...
                  </>
                ) : (
                  <>
                    <span>🔍</span> Verificar Meu Currículo Grátis
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Resultado da Verificação */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={handleReset}
                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 flex items-center gap-1"
              >
                ← Verificar outro currículo
              </button>
            </div>
            <AtsVerifierResult data={result} rawText={rawExtractedText} />
          </div>
        )}
      </div>
    </div>
  );
}
