"use client";

import { useRouter } from "next/navigation";

const TIER_OPTIONS = [
  { value: "aligned", label: "Alinhadas com meu perfil" },
  { value: "all", label: "Fit score: Todos" },
  { value: "strong", label: "Fit: 75% - 100%" },
  { value: "medium", label: "Fit: 50% - 74%" },
  { value: "low", label: "Fit: 0% - 49%" },
];

const SORT_OPTIONS = [
  { value: "fit", label: "Melhores matches" },
  { value: "recent", label: "Mais recentes" },
  { value: "salary", label: "Maior salário" },
];

export function FeedFilters({
  workModels,
  areas,
  subareas,
  seniorities,
  states,
  citiesByState,
  contractTypes,
  current,
}: {
  workModels: string[];
  areas: string[];
  subareas: string[];
  seniorities: string[];
  states: { code: string; label: string }[];
  citiesByState: Record<string, string[]>;
  contractTypes: string[];
  current: {
    q?: string;
    tier?: string;
    workModel?: string;
    area?: string;
    subarea?: string;
    seniority?: string;
    state?: string;
    city?: string;
    entryLevel?: string;
    contractType?: string;
    sort?: string;
  };
}) {
  const router = useRouter();

  const tier = current.tier ?? "aligned";
  const workModel = current.workModel ?? "all";
  const area = current.area ?? "all";
  const subarea = current.subarea ?? "all";
  const seniority = current.seniority ?? "all";
  const state = current.state ?? "all";
  const city = current.city ?? "all";
  const entryLevel = current.entryLevel ?? "all";
  const contractType = current.contractType ?? "all";
  const sort = current.sort ?? "fit";

  const hasActiveFilters =
    Boolean(current.q) ||
    tier !== "aligned" ||
    workModel !== "all" ||
    area !== "all" ||
    subarea !== "all" ||
    seniority !== "all" ||
    state !== "all" ||
    city !== "all" ||
    entryLevel !== "all" ||
    contractType !== "all";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams();
    const next = {
      q: current.q ?? "",
      tier,
      workModel,
      area,
      subarea,
      seniority,
      state,
      city,
      entryLevel,
      contractType,
      sort,
      [key]: value,
    };
    if (key === "state") next.city = "all";
    for (const [paramKey, paramValue] of Object.entries(next)) {
      if (paramValue && paramValue !== "all" && paramValue !== "aligned") params.set(paramKey, paramValue);
    }
    router.push(`/feed?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/feed");
  }

  function toggleInternshipOnly() {
    setParam("seniority", seniority === "Estagio" ? "all" : "Estagio");
  }

  function toggleEntryLevelOnly() {
    setParam("entryLevel", entryLevel === "yes" ? "all" : "yes");
  }

  const selectClass =
    "w-full h-9 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer truncate shadow-2xs";

  const sortedWorkModels = [...workModels].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const sortedAreas = [...areas].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const sortedSubareas = [...subareas].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const sortedSeniorities = [...seniorities].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const sortedContractTypes = [...contractTypes].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const sortedStates = [...states].sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  const sortedCities = [...(citiesByState[state] ?? [])].sort((a, b) => a.localeCompare(b, "pt-BR"));

  return (
    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3.5 sm:p-4 shadow-sm shadow-slate-900/5 space-y-3">
      
      {/* Campo de Busca Rápida por Palavra-Chave */}
      <div className="relative">
        <input
          type="text"
          placeholder="🔍 Buscar por cargo, tecnologia ou empresa (ex: React, DevOps, SRE)..."
          defaultValue={current.q ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setParam("q", (e.target as HTMLInputElement).value);
            }
          }}
          onBlur={(e) => {
            const val = (e.target as HTMLInputElement).value;
            if (val !== (current.q ?? "")) {
              setParam("q", val);
            }
          }}
          className="w-full h-10 px-4 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900 text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all placeholder:text-neutral-400 shadow-2xs"
        />
      </div>

      {/* Barra Superior de Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-900 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 pr-1">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-blue-600 dark:text-blue-400">
              <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Filtros
          </span>

          {seniorities.includes("Estagio") && (
            <button
              type="button"
              onClick={toggleInternshipOnly}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                seniority === "Estagio"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                  : "border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              Somente estágio
            </button>
          )}

          <button
            type="button"
            onClick={toggleEntryLevelOnly}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              entryLevel === "yes"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                : "border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            Sem experiência / entrada
          </button>
        </div>

        <div className="flex items-center gap-3.5 ml-auto">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              Limpar filtros ✕
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-neutral-400 shrink-0">Ordenar:</span>
            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value)}
              className="h-9 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Selects */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
        <select value={tier} onChange={(e) => setParam("tier", e.target.value)} className={selectClass}>
          {TIER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select value={workModel} onChange={(e) => setParam("workModel", e.target.value)} className={selectClass}>
          <option value="all">Modelo de trabalho</option>
          {sortedWorkModels.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select value={area} onChange={(e) => setParam("area", e.target.value)} className={selectClass}>
          <option value="all">Área profissional</option>
          {sortedAreas.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select value={subarea} onChange={(e) => setParam("subarea", e.target.value)} className={selectClass}>
          <option value="all">Subárea</option>
          {sortedSubareas.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select value={seniority} onChange={(e) => setParam("seniority", e.target.value)} className={selectClass}>
          <option value="all">Senioridade</option>
          {sortedSeniorities.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select value={contractType} onChange={(e) => setParam("contractType", e.target.value)} className={selectClass}>
          <option value="all">Regime de contratação</option>
          {sortedContractTypes.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={state}
          onChange={(e) => setParam("state", e.target.value)}
          className={selectClass}
          title="Vagas remotas e híbridas aparecem para qualquer localidade"
        >
          <option value="all">Estado</option>
          {sortedStates.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>

        {state !== "all" && sortedCities.length > 0 && (
          <select
            value={city}
            onChange={(e) => setParam("city", e.target.value)}
            className={selectClass}
            title="Vagas remotas e híbridas aparecem para qualquer localidade"
          >
            <option value="all">Cidade</option>
            {sortedCities.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Chips de Filtros Ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-900">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mr-1">Filtros ativos:</span>
          {current.q && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
              Busca: &ldquo;{current.q}&rdquo;
              <button type="button" onClick={() => setParam("q", "all")} className="hover:text-blue-900 dark:hover:text-white cursor-pointer ml-0.5">✕</button>
            </span>
          )}
          {tier !== "aligned" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
              Score: {TIER_OPTIONS.find((t) => t.value === tier)?.label ?? tier}
              <button type="button" onClick={() => setParam("tier", "aligned")} className="hover:text-blue-900 dark:hover:text-white cursor-pointer ml-0.5">✕</button>
            </span>
          )}
          {workModel !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
              Modelo: {workModel}
              <button type="button" onClick={() => setParam("workModel", "all")} className="hover:text-blue-900 dark:hover:text-white cursor-pointer ml-0.5">✕</button>
            </span>
          )}
          {area !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
              Área: {area}
              <button type="button" onClick={() => setParam("area", "all")} className="hover:text-blue-900 dark:hover:text-white cursor-pointer ml-0.5">✕</button>
            </span>
          )}
          {subarea !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
              Subárea: {subarea}
              <button type="button" onClick={() => setParam("subarea", "all")} className="hover:text-blue-900 dark:hover:text-white cursor-pointer ml-0.5">✕</button>
            </span>
          )}
          {seniority !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
              Senioridade: {seniority}
              <button type="button" onClick={() => setParam("seniority", "all")} className="hover:text-blue-900 dark:hover:text-white cursor-pointer ml-0.5">✕</button>
            </span>
          )}
          {contractType !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
              Contrato: {contractType}
              <button type="button" onClick={() => setParam("contractType", "all")} className="hover:text-blue-900 dark:hover:text-white cursor-pointer ml-0.5">✕</button>
            </span>
          )}
          {state !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
              UF: {state}
              <button type="button" onClick={() => setParam("state", "all")} className="hover:text-blue-900 dark:hover:text-white cursor-pointer ml-0.5">✕</button>
            </span>
          )}
          {city !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
              Cidade: {city}
              <button type="button" onClick={() => setParam("city", "all")} className="hover:text-blue-900 dark:hover:text-white cursor-pointer ml-0.5">✕</button>
            </span>
          )}
          {entryLevel === "yes" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
              Sem experiência
              <button type="button" onClick={() => setParam("entryLevel", "all")} className="hover:text-blue-900 dark:hover:text-white cursor-pointer ml-0.5">✕</button>
            </span>
          )}
        </div>
      )}

    </div>
  );
}
