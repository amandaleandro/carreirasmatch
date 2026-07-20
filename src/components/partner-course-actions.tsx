"use client";

import { useState } from "react";
import { Sparkles, X, Mail, Phone, User } from "lucide-react";

export function PartnerCourseActions({
  courseId,
  courseUrl,
  couponCode,
  couponDiscount,
  featured,
}: {
  courseId: string;
  courseUrl: string;
  couponCode?: string;
  couponDiscount?: string;
  featured: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function trackClick() {
    try {
      await fetch(`/api/cursos-gratuitos/${courseId}/click`, { method: "POST" });
    } catch (err) {
      console.error(err);
    }
  }

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/cursos-gratuitos/${courseId}/interesse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao salvar interesse.");
      }
      setSuccess(true);
      trackClick();
    } catch (err: any) {
      setError(err.message ?? "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-2 shrink-0">
      {couponCode && (
        <div className="text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-1.5 justify-center">
          <span>Cupom exclusivo:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{couponCode}</span>
          {couponDiscount && <span className="text-emerald-600 dark:text-emerald-400 font-bold">({couponDiscount})</span>}
        </div>
      )}

      <div className="flex gap-2">
        <a
          href={courseUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackClick}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-sm transition-all text-center ${
            featured
              ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/10"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/10"
          }`}
        >
          Ir para o Curso
        </a>

        {featured && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
          >
            Tenho Interesse
          </button>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150 text-left">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setSuccess(false);
                setName("");
                setEmail("");
                setPhone("");
              }}
              className="absolute right-4 top-4 p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl"
            >
              <X className="h-5 w-5" />
            </button>

            {!success ? (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <header>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500" />
                    Tenho Interesse neste Curso
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Deixe seus contatos e a instituição parceira entrará em contato com você com mais detalhes e descontos.
                  </p>
                </header>

                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      required
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <input
                      type="email"
                      required
                      placeholder="Seu melhor e-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <input
                      type="tel"
                      placeholder="WhatsApp (opcional)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03]"
                    />
                  </div>
                </div>

                {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 text-sm font-semibold text-white transition-colors cursor-pointer"
                >
                  {loading ? "Enviando..." : "Enviar Contato"}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white">Interesse enviado!</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                    A instituição parceira foi notificada e retornará em breve. Aproveite seus estudos!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setSuccess(false);
                    setName("");
                    setEmail("");
                    setPhone("");
                  }}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 px-5 py-2 text-xs font-semibold"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
