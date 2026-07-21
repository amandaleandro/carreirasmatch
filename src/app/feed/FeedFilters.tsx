"use client";

import { useRouter } from "next/navigation";

const TIER_OPTIONS = [
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
  seniorities,
  locations,
  contractTypes,
  current,
}: {
  workModels: string[];
  areas: string[];
  seniorities: string[];
  locations: string[];
  contractTypes: string[];
  current: {
    tier?: string;
    workModel?: string;
    area?: string;
    seniority?: string;
    location?: string;
    entryLevel?: string;
    contractType?: string;
    sort?: string;
  };
}) {
  const router = useRouter();

  const tier = current.tier ?? "all";
  const workModel = current.workModel ?? "all";
  const area = current.area ?? "all";
  const seniority = current.seniority ?? "all";
  const location = current.location ?? "all";
  const entryLevel = current.entryLevel ?? "all";
  const contractType = current.contractType ?? "all";
  const sort = current.sort ?? "fit";

  const hasActiveFilters =
    tier !== "all" ||
    workModel !== "all" ||
    area !== "all" ||
    seniority !== "all" ||
    location !== "all" ||
    entryLevel !== "all" ||
    contractType !== "all";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams();
    const next = { tier, workModel, area, seniority, location, entryLevel, contractType, sort, [key]: value };
    for (const [paramKey, paramValue] of Object.entries(next)) {
      if (paramValue && paramValue !== "all") params.set(paramKey, paramValue);
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

  return (
    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3.5 sm:p-4 shadow-sm shadow-slate-900/5 space-y-3">
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
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
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
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
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
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        <select value={tier} onChange={(e) => setParam("tier", e.target.value)} className={selectClass}>
          {TIER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select value={workModel} onChange={(e) => setParam("workModel", e.target.value)} className={selectClass}>
          <option value="all">Modelo de trabalho</option>
          {workModels.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select value={area} onChange={(e) => setParam("area", e.target.value)} className={selectClass}>
          <option value="all">Área profissional</option>
          {areas.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select value={seniority} onChange={(e) => setParam("seniority", e.target.value)} className={selectClass}>
          <option value="all">Senioridade</option>
          {seniorities.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select value={contractType} onChange={(e) => setParam("contractType", e.target.value)} className={selectClass}>
          <option value="all">Regime de contratação</option>
          {contractTypes.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={location}
          onChange={(e) => setParam("location", e.target.value)}
          className={selectClass}
          title="Vagas remotas e híbridas aparecem para qualquer localidade"
        >
          <option value="all">Localidade</option>
          {locations.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
