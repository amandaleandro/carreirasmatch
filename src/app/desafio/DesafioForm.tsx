"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { CAREER_TRACK_OPTIONS, CareerTrack } from "@/components/analysis-display";

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
    if (!jobTitle.trim()) {
      setError("Informe o nome do cargo desejado.");
      return;
    }
    if (!jobText.trim()) {
      setError("Cole a descrição da vaga desejada.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Se não estiver logado, cria a conta/captura o lead primeiro
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
          // Se o e-mail já existe, registra como lead e continua
          if (regData.error && !regData.error.includes("já cadastrado")) {
            throw new Error(regData.error);
          }
        }
      }

      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobTitle", jobTitle);
      formData.append("jobText", jobText);
      formData.append("careerTrack", careerTrack);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao processar a análise.");
      }

      // Redireciona para o relatório completo com o Card de Story e resultados
      router.push(`/report/${data.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ocorreu um erro ao analisar. Tente novamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Envie seu Currículo e a Vaga Desejada</span>
          </h2>
          <p className="text-xs text-slate-400">Preencha os campos para criar seu acesso e gerar seu Match %</p>
        </div>
        {isLoggedIn && (
          <span className="text-xs bg-emerald-500/20 text-emerald-300 font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
            Conta Conectada
          </span>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Cadastro Rápido de Lead se não estiver logado */}
      {!isLoggedIn && (
        <div className="grid sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider">
              Seu Nome Completo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider">
              Seu Melhor E-mail *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              required
            />
          </div>
        </div>
      )}

      {/* Upload de Currículo */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          1. Seu Currículo (PDF)
        </label>
        <div className="relative border-2 border-dashed border-slate-700 hover:border-sky-500/50 rounded-2xl p-6 transition-all text-center bg-slate-950/50 group">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          {file ? (
            <div className="flex items-center justify-center gap-3 text-sky-400 font-semibold text-sm">
              <FileText className="w-6 h-6" />
              <span>{file.name}</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          ) : (
            <div className="space-y-2 text-slate-400 group-hover:text-slate-300">
              <Upload className="w-8 h-8 mx-auto text-slate-500 group-hover:text-sky-400 transition-colors" />
              <p className="text-sm font-medium">Clique para selecionar seu currículo em PDF</p>
              <p className="text-[11px] text-slate-500">Tamanho máximo: 5MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Cargo Desejado */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          2. Nome do Cargo Desejado
        </label>
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Ex: Desenvolvedor Front-end, Analista Financeiro, Gerente de Vendas..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          required
        />
      </div>

      {/* Texto da Vaga */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          3. Descrição / Requisitos da Vaga
        </label>
        <textarea
          rows={4}
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          placeholder="Cole aqui o texto da vaga ou requisitos anunciados..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
          required
        />
      </div>

      {/* Momento Profissional */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          4. Seu Momento Profissional
        </label>
        <select
          value={careerTrack}
          onChange={(e) => setCareerTrack(e.target.value as CareerTrack)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500"
        >
          {CAREER_TRACK_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Botão de Envio */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-600 hover:to-sky-500 text-slate-950 font-extrabold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-sky-500/25 text-base disabled:opacity-50 active:scale-[0.99]"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            <span>Criando Conta e Calculando Match...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Gerar Meu Match e Card para Story</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </>
        )}
      </button>
    </form>
  );
}
