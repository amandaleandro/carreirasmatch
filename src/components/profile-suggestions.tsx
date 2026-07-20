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
  gapAddressed: string;
  modality: string;
  city: string;
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
  externalCourses,
}: {
  initialSuggestions: ProfileSuggestion[];
  externalCourses: { id: string; title: string; provider: string; url: string; area: string; free: boolean; certificate: boolean; modality: string; city: string }[];
}) {
  const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>(initialSuggestions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | ProfileSuggestionType>("all");
  const [modalityFilter, setModalityFilter] = useState<"all" | "online" | "presencial">("all");
  const [freeOnly, setFreeOnly] = useState(false);

  const isFree = (s: ProfileSuggestion) => /gratuito|grátis|gratis|r\$\s*0/i.test(s.priceLabel);
  const filtered = suggestions.filter((s) => {
    if (typeFilter !== "all" && s.type !== typeFilter) return false;
    if (modalityFilter !== "all") {
      const m = s.modality.toLowerCase();
      if (modalityFilter === "online" && m === "presencial") return false;
      if (modalityFilter === "presencial" && m !== "presencial") return false;
    }
    if (freeOnly && !isFree(s)) return false;
    return true;
  });

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
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full space-y-6">
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
          <div className="flex flex-wrap items-center gap-2">
            <FilterGroup
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: "all", label: "Todos" },
                { value: "course", label: "Cursos" },
                { value: "certification", label: "Certificações" },
                { value: "book", label: "Livros" },
              ]}
            />
            <FilterGroup
              value={modalityFilter}
              onChange={setModalityFilter}
              options={[
                { value: "all", label: "Toda modalidade" },
                { value: "online", label: "Online" },
                { value: "presencial", label: "Presencial" },
              ]}
            />
            <button
              type="button"
              onClick={() => setFreeOnly((v) => !v)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                freeOnly
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-800 dark:text-neutral-400"
              }`}
            >
              Só gratuitos
            </button>
          </div>
          <p className="text-xs text-neutral-500">
            💡 Preço e impacto são estimativas geradas por IA, não valores em tempo real.
          </p>
          {filtered.length === 0 ? (
            <p className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-6 text-center text-sm text-neutral-500">
              Nenhuma sugestão com esses filtros. Ajuste os filtros acima.
            </p>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((s) => {
              const config = TYPE_CONFIG[s.type];
              return (
                <div
                  key={s.id}
                  className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-sm shadow-slate-900/5 hover:shadow-md transition-shadow flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-medium rounded-full border px-2 py-0.5 ${config.chip}`}
                        >
                          {config.icon} {config.label}
                        </span>
                        {s.type === "course" && s.modality && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium rounded-full border border-neutral-200 text-neutral-600 px-2 py-0.5 dark:border-neutral-800 dark:text-neutral-400">
                            {s.modality.toLowerCase() === "presencial" ? "📍" : "💻"} {s.modality}
                            {s.city ? ` · ${s.city}` : ""}
                          </span>
                        )}
                      </div>
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

                  {s.gapAddressed && (
                    <p className="text-xs text-neutral-500">
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">Resolve:</span>{" "}
                      {s.gapAddressed}
                    </p>
                  )}

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
          )}
        </>
      )}

      {externalCourses.length > 0 && (
        <section className="pt-4">
          <h2 className="text-xl font-bold">Cursos verificados recentemente</h2>
          <p className="mt-1 text-sm text-neutral-500">Ofertas coletadas de fontes oficiais e relacionadas à sua área.</p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {externalCourses.map((course) => (
              <a key={course.id} href={course.url} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-neutral-200 bg-white p-5 hover:border-blue-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  {course.free ? "Gratuito" : "Consulte o valor"} · {course.modality}
                  {course.modality?.toLowerCase() === "presencial" && course.city ? ` · ${course.city}` : ""}
                </span>
                <h3 className="mt-2 font-semibold">{course.title}</h3>
                <p className="mt-1 text-xs text-neutral-500">{course.provider} · {course.area}</p>
                {course.certificate && <p className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-400">Certificado disponível</p>}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FilterGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-full border border-neutral-200 p-0.5 dark:border-neutral-800">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            value === opt.value
              ? "bg-blue-600 text-white"
              : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
