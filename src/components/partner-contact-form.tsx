"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function PartnerContactForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    organization: "",
    organizationType: "school",
    contactName: "",
    email: "",
    phone: "",
    volume: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/partner/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSent(true);
      } else {
        setError(data.error || "Ocorreu um erro ao enviar sua mensagem. Tente novamente.");
      }
    } catch {
      setError("Falha de conexão ao enviar o formulário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-8 text-center backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-white">Solicitação enviada com sucesso!</h3>
        <p className="mt-2 text-sm text-emerald-200/80 leading-relaxed max-w-md mx-auto">
          Nossa equipe entrará em contato via WhatsApp ou e-mail em até 24 horas úteis para apresentar as soluções adequadas para sua instituição.
        </p>
      </div>
    );
  }

  const inputStyle =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-emerald-500 focus:bg-white/10 focus:outline-none transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="organization" className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
            Instituição ou Empresa *
          </label>
          <input
            id="organization"
            required
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            placeholder="Ex.: Faculdade Alfa ou Escola Beta"
            className={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="organizationType" className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
            Tipo de Organização *
          </label>
          <select
            id="organizationType"
            required
            name="organizationType"
            value={formData.organizationType}
            onChange={handleChange}
            className={`${inputStyle} [&>option]:bg-slate-900 [&>option]:text-white`}
          >
            <option value="school">Escola ou Faculdade</option>
            <option value="course">Instituição de Cursos Livres</option>
            <option value="edtech">Plataforma / EdTech</option>
            <option value="creator">Criador / Mentor Independente</option>
            <option value="other">Outro</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contactName" className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
            Nome do Responsável *
          </label>
          <input
            id="contactName"
            required
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            placeholder="Seu nome completo"
            className={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
            E-mail Profissional *
          </label>
          <input
            id="email"
            required
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="nome@instituicao.com.br"
            className={inputStyle}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
            WhatsApp ou Telefone *
          </label>
          <input
            id="phone"
            required
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(11) 99999-9999"
            className={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="volume" className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
            Volume de Cursos ou Alunos (Opcional)
          </label>
          <input
            id="volume"
            name="volume"
            value={formData.volume}
            onChange={handleChange}
            placeholder="Ex.: 5 a 10 cursos ou 500 alunos/mês"
            className={inputStyle}
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
          Como podemos ajudar? (Opcional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          value={formData.message}
          onChange={handleChange}
          placeholder="Descreva dúvidas ou detalhes da sua instituição"
          className={inputStyle}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando solicitação...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Quero conversar com a equipe
          </>
        )}
      </button>
    </form>
  );
}
