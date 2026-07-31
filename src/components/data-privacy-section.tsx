"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Download, AlertCircle, Trash2 } from "lucide-react";
import { useFeedback } from "@/components/feedback-provider";

export function DataPrivacySection({ hasPassword }: { hasPassword: boolean }) {
  const router = useRouter();
  const { notify } = useFeedback();
  const [exporting, setExporting] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/user/export");
      if (!res.ok) throw new Error("Não foi possível exportar seus dados agora.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "carreirasmatch-meus-dados.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      notify("success", "Seus dados foram exportados.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao exportar dados.";
      setError(message);
      notify("error", message);
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (confirmation !== "EXCLUIR") {
      setError('Digite "EXCLUIR" para confirmar.');
      notify("error", 'Digite "EXCLUIR" para confirmar.');
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmation }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir a conta.");

      router.push("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao excluir a conta.";
      setError(message);
      notify("error", message);
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50/60 dark:bg-red-950/30 p-3 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 leading-relaxed">
          Você pode baixar uma cópia de tudo que guardamos sobre você: perfil, currículos, análises,
          candidaturas e testes.
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] dark:border-neutral-800 px-4 py-2.5 text-xs font-semibold text-[#071827] dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {exporting ? "Preparando..." : "Baixar meus dados"}
        </button>
      </div>

      <div className="border-t border-[#E2E8F0] dark:border-neutral-800 pt-6">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 leading-relaxed">
          Excluir sua conta remove permanentemente seu perfil, currículos, análises e candidaturas.
          Essa ação não pode ser desfeita.
        </p>

        {!showDeleteForm ? (
          <button
            type="button"
            onClick={() => setShowDeleteForm(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-900 px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Excluir minha conta
          </button>
        ) : (
          <form onSubmit={handleDelete} className="space-y-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20 p-4">
            {hasPassword && (
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-neutral-400">
                  Confirme sua senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white dark:bg-neutral-900 dark:border-neutral-800 px-3.5 py-2.5 text-xs text-[#071827] dark:text-white outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-neutral-400">
                Digite EXCLUIR para confirmar
              </label>
              <input
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                required
                placeholder="EXCLUIR"
                className="w-full rounded-xl border border-[#E2E8F0] bg-white dark:bg-neutral-900 dark:border-neutral-800 px-3.5 py-2.5 text-xs text-[#071827] dark:text-white outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Excluindo..." : "Confirmar exclusão"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteForm(false)}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
