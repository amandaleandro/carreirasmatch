"use client";

import { useRouter } from "next/navigation";

const TIER_OPTIONS = [
  { value: "all", label: "Fit score: todos" },
  { value: "strong", label: "Fit score: 75% - 100%" },
  { value: "medium", label: "Fit score: 50% - 74%" },
  { value: "low", label: "Fit score: 0% - 49%" },
];

const SORT_OPTIONS = [
  { value: "fit", label: "Melhores matches" },
  { value: "recent", label: "Mais recentes" },
  { value: "salary", label: "Maior salario" },
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
    "rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 pr-1">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Filtros
      </span>

      {seniorities.includes("Estagio") && (
        <button
          type="button"
          onClick={toggleInternshipOnly}
          className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
            seniority === "Estagio"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200"
          }`}
        >
          Somente estagio
        </button>
      )}

      <button
        type="button"
        onClick={toggleEntryLevelOnly}
        className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
          entryLevel === "yes"
            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
            : "border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200"
        }`}
      >
        Sem experiencia / entrada
      </button>

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
        <option value="all">Area</option>
        {areas.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <select value={seniority} onChange={(e) => setParam("seniority", e.target.value)} className={selectClass}>
        <option value="all">Nivel de senioridade</option>
        {seniorities.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <select value={contractType} onChange={(e) => setParam("contractType", e.target.value)} className={selectClass}>
        <option value="all">Regime de contratacao</option>
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
        title="Vagas remotas e hibridas aparecem para qualquer localidade"
      >
        <option value="all">Localidade</option>
        {locations.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <select value={sort} onChange={(e) => setParam("sort", e.target.value)} className={`${selectClass} ml-auto`}>
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            Ordenar: {opt.label}
          </option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
