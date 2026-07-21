"use client";

import { useState } from "react";
import {
  Sparkles,
  GraduationCap,
  Award,
  BookOpen,
  Filter,
  ExternalLink,
  MapPin,
  Globe,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

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

const TYPE_CONFIG: Record<ProfileSuggestionType, { label: string; icon: React.ReactNode; chip: string }> = {
  course: {
    label: "Curso",
    icon: <GraduationCap className="w-3.5 h-3.5" />,
    chip: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  certification: {
    label: "Certificação",
    icon: <Award className="w-3.5 h-3.5" />,
    chip: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  book: {
    label: "Livro",
    icon: <BookOpen className="w-3.5 h-3.5" />,
    chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
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
    <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto w-full space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Plano de Desenvolvimento Profissional
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Recomendações Personalizadas por IA
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Cursos, certificações e livros recomendados com base nas lacunas técnicas do seu perfil.
          </p>
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 shadow-md shadow-blue-500/20 transition-all shrink-0 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Gerando..." : suggestions.length > 0 ? "Atualizar Plano" : "Gerar Recomendações"}</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs px-4 py-3 font-semibold">
          {error}
        </div>
      )}

      {/* Empty State */}
      {suggestions.length === 0 && !loading && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-8 sm:p-12 text-center shadow-2xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Você ainda não gerou seu plano de desenvolvimento
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Clique em &quot;Gerar Recomendações&quot; para que a IA analise as habilidades desejadas no mercado e recomende os melhores conteúdos.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={generate}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors shadow-md shadow-blue-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Gerar Recomendações Agora</span>
            </button>
          </div>
        </div>
      )}

      {/* Suggestions List Grid */}
      {suggestions.length > 0 && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
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
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  freeOnly
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                Só gratuitos
              </button>
            </div>

            <span className="text-xs text-slate-400 italic">
              💡 Estimativas de preço e impacto calculadas por IA.
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-8 text-center text-xs text-slate-500">
              Nenhuma sugestão encontrada para os filtros selecionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((s) => {
                const config = TYPE_CONFIG[s.type];
                return (
                  <div
                    key={s.id}
                    className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs hover:border-blue-500/60 dark:hover:border-blue-500/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-3.5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider rounded-md border px-2.5 py-0.5 ${config.chip}`}
                            >
                              {config.icon} {config.label}
                            </span>
                            {s.type === "course" && s.modality && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5">
                                {s.modality.toLowerCase() === "presencial" ? (
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                ) : (
                                  <Globe className="w-3 h-3 text-slate-400" />
                                )}
                                {s.modality}
                                {s.city ? ` · ${s.city}` : ""}
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                            {s.url ? (
                              <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {s.title}
                              </a>
                            ) : (
                              s.title
                            )}
                          </h3>

                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{s.provider}</p>
                        </div>

                        <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 shrink-0 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-md border border-blue-200/50 dark:border-blue-900/50">
                          {s.priceLabel}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {s.impactReason}
                      </p>

                      {s.gapAddressed && (
                        <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                          <strong className="text-slate-900 dark:text-white">Gargalo resolvido:</strong>{" "}
                          {s.gapAddressed}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      {s.url && (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <span>Acessar {s.type === "course" ? "curso" : s.type === "certification" ? "certificação" : "livro"}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                            Impacto estimado
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400">{s.impactScore}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full bg-emerald-500"
                            style={{ width: `${s.impactScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* External Verified Courses */}
      {externalCourses.length > 0 && (
        <section className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Cursos Verificados Recentemente
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ofertas coletadas de fontes oficiais e relacionadas à sua área profissional.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {externalCourses.map((course) => (
              <a
                key={course.id}
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs hover:border-blue-500/60 dark:hover:border-blue-500/60 hover:shadow-md transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-md">
                      {course.free ? "Gratuito" : "Consulte o valor"} · {course.modality}
                      {course.modality?.toLowerCase() === "presencial" && course.city ? ` · ${course.city}` : ""}
                    </span>
                    {course.certificate && (
                      <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                        Certificado ✓
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2.5 font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    {course.provider} · {course.area}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <span>Ver detalhes do curso</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
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
    <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
            value === opt.value
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
