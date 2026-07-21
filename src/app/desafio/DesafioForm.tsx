"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Sparkles, AlertCircle, ArrowRight, CheckCircle2, Link2 } from "lucide-react";
import { CAREER_TRACK_OPTIONS, CareerTrack } from "@/components/analysis-display";
import { ReferralRewardBox } from "@/components/referral-reward-box";

interface DesafioFormProps {
  isLoggedIn: boolean;
  userId?: string;
  referralStats?: {
    totalReferrals: number;
    credits: number;
  } | null;
}

export function DesafioForm({ isLoggedIn, userId, referralStats }: DesafioFormProps) {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobText, setJobText] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [careerTrack, setCareerTrack] = useState<CareerTrack>("growth");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 5 * 1024 * 1024) {
        setError("O arquivo do currículo deve ter no máximo 5MB.");
        return;
      }
      setError(null);
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      if (!name.trim()) {
        setError("Por favor, informe seu nome.");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setError("Por favor, informe um e-mail válido.");
        return;
      }
    }

    if (!file) {
      setError("Por favor, selecione seu arquivo de currículo em PDF.");
      return;
    }

    if (!jobText.trim() && !jobLink.trim()) {
      setError("Cole a descrição da vaga ou informe o link da vaga.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!isLoggedIn) {
        const registerRes = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password: "Match" + Math.random().toString(36).slice(-8),
          }),
        });

        if (!registerRes.ok) {
          const regData = await registerRes.json();
          if (regData.error && !regData.error.includes("já cadastrado")) {
            throw new Error(regData.error);
          }
        }
      }

      const finalJobText = jobLink.trim()
        ? `[Link da vaga]\n${jobLink.trim()}\n\n[Descrição da vaga]\n${
            jobText.trim() || "Não informada; candidato forneceu apenas o link acima."
          }`
        : jobText;

      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobTitle", jobTitle);
      formData.append("jobText", finalJobText);
      formData.append("careerTrack", careerTrack);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao processar a análise.");
      }

      router.push(`/report/${data.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ocorreu um erro ao analisar. Tente novamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {isLoggedIn && userId && (
        <ReferralRewardBox
          userId={userId}
          totalReferrals={referralStats?.totalReferrals ?? 0}
          credits={referralStats?.credits ?? 0}
        />
      )}

      <form onSubmit={handleSubmit} className="bg-[#FFFFFF] dark:bg-neutral-900 border border-[#E2E8F0] dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
        
        <div className="border-b border-[#E2E8F0] dark:border-neutral-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-title font-bold text-[#071827] dark:text-white">
              Envie seu Currículo e a Vaga Desejada
            </h2>
            <p className="text-[10px] text-[#64748B]">Preencha os campos para calcular seu Match %</p>
          </div>
          {isLoggedIn && (
            <span className="text-[9px] bg-[#22C55E]/15 text-[#22C55E] font-bold px-2.5 py-0.5 rounded-full border border-[#22C55E]/20">
              Conta Conectada
            </span>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[11px] font-semibold text-[#EF4444] animate-shake flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Cadastro Rápido de Lead se não estiver logado */}
        {!isLoggedIn && (
          <div className="grid sm:grid-cols-2 gap-3.5 bg-[#F8FAFC] dark:bg-neutral-950/60 p-4 rounded-2xl border border-[#E2E8F0] dark:border-neutral-800">
            
            {/* Nome Completo */}
            <div className="space-y-1 relative group">
              <label className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider group-focus-within:text-[#2563EB] transition-colors">
                Seu Nome Completo *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-neutral-400 group-focus-within:text-[#2563EB] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="w-full bg-white dark:bg-neutral-900 border border-[#E2E8F0] dark:border-neutral-700 rounded-xl pl-9.5 pr-3 py-2 text-xs text-[#071827] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                  required
                />
              </div>
            </div>

            {/* Melhor E-mail */}
            <div className="space-y-1 relative group">
              <label className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider group-focus-within:text-[#2563EB] transition-colors">
                Seu Melhor E-mail *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-neutral-400 group-focus-within:text-[#2563EB] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full bg-white dark:bg-neutral-900 border border-[#E2E8F0] dark:border-neutral-700 rounded-xl pl-9.5 pr-3 py-2 text-xs text-[#071827] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                  required
                />
              </div>
            </div>

          </div>
        )}

        {/* Upload de Currículo */}
        <div className="space-y-1 relative group">
          <label className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider">
            1. Seu Currículo (PDF)
          </label>
          <div className="relative border-2 border-dashed border-[#E2E8F0] dark:border-neutral-700 hover:border-[#2563EB]/50 rounded-2xl p-5 transition-all text-center bg-[#F8FAFC] dark:bg-neutral-950/50 group cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-[#2563EB] font-bold text-xs">
                <FileText className="w-5 h-5" />
                <span>{file.name}</span>
                <CheckCircle2 className="w-4.5 h-4.5 text-[#22C55E]" />
              </div>
            ) : (
              <div className="space-y-1 text-slate-400 group-hover:text-slate-500">
                <Upload className="w-6 h-6 mx-auto text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                <p className="text-xs font-semibold">Clique para selecionar seu currículo em PDF</p>
                <p className="text-[9px] text-[#64748B]">Tamanho máximo: 5MB</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5 relative group">
          <label className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider group-focus-within:text-[#2563EB] transition-colors">
            2. Nome do Cargo Desejado (opcional)
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-neutral-400 group-focus-within:text-[#2563EB] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Ex: Desenvolvedor Front-end, Auxiliar de Logística (opcional)..."
              className="w-full bg-white dark:bg-neutral-950 border border-[#E2E8F0] dark:border-neutral-800 rounded-xl pl-9.5 pr-4 py-2.5 text-xs text-[#071827] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
            />
          </div>
        </div>

        {/* Texto da Vaga */}
        <div className="space-y-1.5 relative group">
          <label className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider group-focus-within:text-[#2563EB] transition-colors">
            3. Descrição / Requisitos da Vaga {jobLink.trim() && <span className="text-slate-400 normal-case font-normal">(opcional com link)</span>}
          </label>
          <textarea
            rows={3}
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Cole aqui o texto da vaga ou requisitos..."
            className="w-full bg-white dark:bg-neutral-950 border border-[#E2E8F0] dark:border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-[#071827] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 resize-none"
            required={!jobLink.trim()}
          />
        </div>

        {/* Link da Vaga */}
        <div className="space-y-1.5 relative group">
          <label className="flex items-center gap-1.5 text-[9px] font-bold text-[#2563EB] uppercase tracking-wider">
            <Link2 className="w-3 h-3" />
            Ou informe o link da vaga (LinkedIn, Gupy, etc.)
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-neutral-400 group-focus-within:text-[#2563EB] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </span>
            <input
              type="url"
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
              placeholder="https://..."
              className="w-full bg-white dark:bg-neutral-950 border border-[#E2E8F0] dark:border-neutral-800 rounded-xl pl-9.5 pr-4 py-2.5 text-xs text-[#071827] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
            />
          </div>
        </div>

        {/* Momento Profissional */}
        <div className="space-y-1.5 relative group">
          <label className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider group-focus-within:text-[#2563EB] transition-colors">
            4. Seu Momento Profissional
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-neutral-400 group-focus-within:text-[#2563EB] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <select
              value={careerTrack}
              onChange={(e) => setCareerTrack(e.target.value as CareerTrack)}
              className="w-full bg-white dark:bg-neutral-950 border border-[#E2E8F0] dark:border-neutral-800 rounded-xl pl-9.5 pr-4 py-2.5 text-xs text-[#071827] dark:text-white focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
            >
              {CAREER_TRACK_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botão de Envio */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] hover:shadow-lg hover:shadow-blue-500/15 text-white font-semibold py-3 px-6 rounded-xl transition-all text-xs disabled:opacity-50 active:scale-[0.98] cursor-pointer"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="4 8" className="opacity-40" />
                <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" className="opacity-60" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span>Processando e Calculando Match...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Gerar Meu Match e Card para Story</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
