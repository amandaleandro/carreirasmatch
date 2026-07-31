"use client";

import { useState, FormEvent } from "react";
import { KeyRound, Check, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useFeedback } from "@/components/feedback-provider";

export function ChangePasswordForm() {
  const { notify } = useFeedback();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("A confirmação da nova senha não coincide.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao alterar a senha.");
      }

      setSuccess("Sua senha foi alterada com sucesso!");
      notify("success", "Sua senha foi alterada com sucesso.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao alterar a senha.";
      setError(message);
      notify("error", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans">
      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50/60 dark:bg-red-950/30 p-3 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Senha Atual */}
      <div className="space-y-1">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-neutral-400">
          Senha Atual
        </label>
        <div className="relative flex items-center">
          <input
            type={showCurrent ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            placeholder="Digite sua senha atual"
            className="w-full rounded-xl border border-[#E2E8F0] bg-white dark:bg-neutral-900 dark:border-neutral-800 px-3.5 py-2.5 pr-10 text-xs text-[#071827] dark:text-white outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
          >
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Nova Senha */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-neutral-400">
            Nova Senha
          </label>
          <div className="relative flex items-center">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              placeholder="No mínimo 6 caracteres"
              className="w-full rounded-xl border border-[#E2E8F0] bg-white dark:bg-neutral-900 dark:border-neutral-800 px-3.5 py-2.5 pr-10 text-xs text-[#071827] dark:text-white outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirmar Nova Senha */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-neutral-400">
            Confirmar Nova Senha
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Repita a nova senha"
            className="w-full rounded-xl border border-[#E2E8F0] bg-white dark:bg-neutral-900 dark:border-neutral-800 px-3.5 py-2.5 text-xs text-[#071827] dark:text-white outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 transition-all cursor-pointer disabled:opacity-50"
      >
        <KeyRound className="w-4 h-4" />
        <span>{loading ? "Atualizando..." : "Atualizar Senha"}</span>
      </button>
    </form>
  );
}
