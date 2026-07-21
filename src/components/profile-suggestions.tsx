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
    <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto w-full space-y-5 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-neutral-800 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/15">
            Plano de Desenvolvimento
          </span>
          <h1 className="text-xl md:text-2xl font-title font-bold text-[#071827] dark:text-white mt-1">Desenvolvimento</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Cursos, certificações e livros sugeridos pela IA para fortalecer seu perfil profissional.
          </p>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold px-4 py-2.5 shadow-sm shadow-[#2563EB]/25 transition-all text-center shrink-0 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? "Gerando..." : suggestions.length > 0 ? "Atualizar plano" : "Gerar recomendações"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs px-4 py-3">
          {error}
        </div>
      )}

      {suggestions.length === 0 && !loading && (
        <div className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.01)] text-center space-y-2">
          <p className="text-sm font-bold text-[#071827] dark:text-white">Você ainda não gerou seu plano de desenvolvimento.</p>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
            Clique em &quot;Gerar recomendações&quot; para receber indicações personalizadas com base nas lacunas do seu currículo.
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
              className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
                freeOnly
                  ? "border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-800 dark:text-neutral-400"
              }`}
            >
              Só gratuitos
            </button>
          </div>
          <p className="text-[10px] text-[#64748B] italic">
            💡 Preço e impacto são estimativas geradas por IA, não valores em tempo real.
          </p>
          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 px-4 py-6 text-center text-xs text-neutral-500">
              Nenhuma sugestão encontrada com estes filtros.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((s) => {
                const config = TYPE_CONFIG[s.type];
                return (
                  <div
                    key={s.id}
                    className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-850 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-md transition-all flex flex-col gap-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider rounded-full border px-2.5 py-0.5 ${config.chip}`}
                          >
                            {config.icon} {config.label}
                          </span>
                          {s.type === "course" && s.modality && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider rounded-full border border-neutral-200 text-neutral-600 px-2.5 py-0.5 dark:border-neutral-800 dark:text-neutral-400">
                              {s.modality.toLowerCase() === "presencial" ? "📍" : "💻"} {s.modality}
                              {s.city ? ` · ${s.city}` : ""}
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-sm text-[#071827] dark:text-white mt-2.5 leading-snug">
                          {s.url ? (
                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {s.title}
                            </a>
                          ) : (
                            s.title
                          )}
                        </p>
                        <p className="text-[11px] text-[#64748B] mt-0.5 font-semibold">{s.provider}</p>
                      </div>
                      <span className="text-xs font-black text-[#2563EB] dark:text-blue-400 shrink-0">
                        {s.priceLabel}
                      </span>
                    </div>

                    <p className="text-xs text-[#64748B] dark:text-neutral-300 leading-relaxed">{s.impactReason}</p>

                    {s.gapAddressed && (
                      <p className="text-[11px] text-[#64748B]">
                        <span className="font-bold text-[#071827] dark:text-white">Gargalo resolvido:</span>{" "}
                        {s.gapAddressed}
                      </p>
                    )}

                    {s.url && (
                      <div className="pt-0.5">
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2563EB] hover:text-[#1D4ED8]"
                        >
                          Acessar {s.type === "course" ? "curso" : s.type === "certification" ? "certificação" : "livro"} ↗
                        </a>
                      </div>
                    )}

                    <div className="mt-auto pt-1.5 border-t border-neutral-100 dark:border-neutral-850">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
                        <span>Impacto estimado</span>
                        <span>{s.impactScore}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
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
        <section className="pt-6 border-t border-[#E2E8F0] dark:border-neutral-800 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#071827] dark:text-white">Cursos verificados recentemente</h2>
            <p className="text-xs text-[#64748B] mt-0.5">Ofertas coletadas de fontes oficiais e relacionadas à sua área.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {externalCourses.map((course) => (
              <a
                key={course.id}
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-850 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-md transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-md">
                    {course.free ? "Gratuito" : "Consulte o valor"} · {course.modality}
                    {course.modality?.toLowerCase() === "presencial" && course.city ? ` · ${course.city}` : ""}
                  </span>
                  <h3 className="mt-2.5 font-bold text-sm text-[#071827] dark:text-white leading-snug">{course.title}</h3>
                  <p className="mt-1 text-[11px] text-[#64748B] font-semibold">{course.provider} · {course.area}</p>
                </div>
                {course.certificate && (
                  <p className="text-[10px] font-bold uppercase text-[#2563EB] dark:text-blue-400 mt-2">
                    Certificado disponível ✓
                  </p>
                )}
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
