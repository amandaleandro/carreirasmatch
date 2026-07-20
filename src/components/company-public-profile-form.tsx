"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CompanyPublicProfileForm({
  publicProfile: initialPublic,
  description: initialDescription,
  slug: initialSlug,
}: {
  publicProfile: boolean;
  description: string;
  slug: string | null;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialPublic);
  const [description, setDescription] = useState(initialDescription);
  const [slug, setSlug] = useState(initialSlug);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/empresa/perfil/publico", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicProfile: enabled, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar.");
      if (data.slug) setSlug(data.slug as string);
      setMsg({ kind: "ok", text: "Página pública atualizada." });
      router.refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Erro inesperado." });
    } finally {
      setSaving(false);
    }
  }

  const publicPath = slug ? `/empresas/${slug}` : null;

  return (
    <div className="space-y-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
      <div>
        <h2 className="font-semibold">Página pública da empresa</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Uma página com o perfil da empresa e as vagas abertas publicadas no feed. Boa para divulgar.
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="mt-0.5 accent-blue-600" />
        <span className="text-sm font-medium">Deixar a página pública ativa</span>
      </label>

      <div>
        <label className="block text-sm font-medium mb-1.5">Sobre a empresa</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Conte quem é a empresa, o que faz e como é trabalhar aí."
          className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />
      </div>

      {enabled && publicPath && (
        <p className="text-sm">
          Sua página:{" "}
          <a href={publicPath} target="_blank" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            {publicPath}
          </a>
        </p>
      )}

      {msg && (
        <p className={`text-sm font-semibold ${msg.kind === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
          {msg.text}
        </p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Salvando..." : "Salvar página pública"}
      </button>
    </div>
  );
}
