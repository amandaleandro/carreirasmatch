"use client";

import { useState } from "react";

export type ProfileSuggestionType = "course" | "certification" | "book";

type ProfileSuggestion = {
  id: string;
  type: ProfileSuggestionType;
  title: string;
  provider: string;
  url: string;
  priceLabel: string;
  impactScore: number;
  impactReason: string;
};

const TYPE_CONFIG: Record<ProfileSuggestionType, { label: string; icon: string; chip: string }> = {
  course: {
    label: "Curso",
    icon: "🎓",
    chip: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
  },
  certification: {
    label: "Certificação",
    icon: "📜",
    chip: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  },
  book: {
    label: "Livro",
    icon: "📖",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  },
};

export function ProfileSuggestions({
  initialSuggestions,
}: {
  initialSuggestions: ProfileSuggestion[];
}) {
  const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>(initialSuggestions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile-suggestions", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Não foi possível gerar as sugestões agora.");
      }
      const data = await res.json();
      setSuggestions(data.suggestions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
            Desenvolvimento
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Sugestões de Melhoria</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Cursos, certificações e livros sugeridos para fortalecer seu perfil, com preço e
            impacto estimados pela IA a partir das lacunas identificadas nas suas análises.
          </p>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="shrink-0 rounded-xl bg-blue-600 text-white font-semibold px-6 py-3 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? "Gerando..." : suggestions.length > 0 ? "Atualizar sugestões" : "Gerar sugestões"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {suggestions.length === 0 && !loading && (
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-10 shadow-sm shadow-slate-900/5 text-center">
          <p className="font-medium">Você ainda não gerou sugestões de melhoria.</p>
          <p className="text-sm text-neutral-500 mt-2">
            Clique em &quot;Gerar sugestões&quot; para receber recomendações personalizadas com
            base no seu perfil e nas suas análises de vaga.
          </p>
        </div>
      )}

      {suggestions.length > 0 && (
        <>
          <p className="text-xs text-neutral-500">
            💡 Preço e impacto são estimativas geradas por IA, não valores em tempo real.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((s) => {
              const config = TYPE_CONFIG[s.type];
              return (
                <div
                  key={s.id}
                  className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-sm shadow-slate-900/5 hover:shadow-md transition-shadow flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-medium rounded-full border px-2 py-0.5 ${config.chip}`}
                      >
                        {config.icon} {config.label}
                      </span>
                      <p className="font-semibold mt-2 leading-snug">
                        {s.url ? (
                          <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {s.title}
                          </a>
                        ) : (
                          s.title
                        )}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">{s.provider}</p>
                    </div>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                      {s.priceLabel}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{s.impactReason}</p>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-500">Impacto estimado</span>
                      <span className="font-medium">{s.impactScore}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800">
                      <div
                        className="h-1.5 rounded-full bg-emerald-500"
                        style={{ width: `${s.impactScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
