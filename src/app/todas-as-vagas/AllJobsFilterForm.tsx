"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const BRAZIL_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
].sort();

const AREAS = [
  { value: "tecnologia", label: "Tecnologia / TI" },
  { value: "marketing", label: "Marketing / Comunicação" },
  { value: "administrativo", label: "Administrativo" },
  { value: "vendas", label: "Vendas / Comercial" },
  { value: "atendimento", label: "Atendimento / Suporte" },
  { value: "financeiro", label: "Financeiro / Contabilidade" },
  { value: "operacional", label: "Operacional / Serviços Gerais" },
  { value: "saude", label: "Saúde / Enfermagem" },
  { value: "educacao", label: "Educação / Ensino" },
  { value: "engenharia", label: "Engenharia / Arquitetura" },
  { value: "recursos-humanos", label: "Recursos Humanos / RH" },
].sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

export function AllJobsFilterForm({
  initialValues,
}: {
  initialValues: {
    q?: string;
    area?: string;
    workModel?: string;
    contractType?: string;
    state?: string;
    city?: string;
  };
}) {
  const [selectedState, setSelectedState] = useState(initialValues.state || "");
  const [selectedCity, setSelectedCity] = useState(initialValues.city || "");
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    if (!selectedState) {
      setCities([]);
      return;
    }

    setLoadingCities(true);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`)
      .then((res) => res.json())
      .then((data: Array<{ nome: string }>) => {
        if (Array.isArray(data)) {
          const names = data.map((item) => item.nome).sort((a, b) => a.localeCompare(b, "pt-BR"));
          setCities(names);
        }
      })
      .catch(() => {
        setCities([]);
      })
      .finally(() => {
        setLoadingCities(false);
      });
  }, [selectedState]);

  const hasActiveFilters = Boolean(
    initialValues.q ||
      initialValues.area ||
      initialValues.workModel ||
      initialValues.contractType ||
      initialValues.state ||
      initialValues.city
  );

  const selectClass =
    "w-full h-10 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer truncate shadow-2xs";

  return (
    <form
      method="GET"
      action="/todas-as-vagas"
      className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 sm:p-5 shadow-sm shadow-slate-900/5 space-y-4"
    >
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-neutral-400"
          >
            <path
              d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            name="q"
            defaultValue={initialValues.q || ""}
            placeholder="Buscar por nome do cargo ou palavra-chave (ex: Desenvolvedor, Enfermeiro, Vendedor)..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-sm font-medium text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 text-sm shadow-sm shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>Buscar vagas</span>
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {hasActiveFilters && (
            <Link
              href="/todas-as-vagas"
              className="h-11 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 px-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400 flex items-center justify-center transition-colors shrink-0"
            >
              Limpar ✕
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1 border-t border-neutral-100 dark:border-neutral-900">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1">
            Área de atuação
          </label>
          <select name="area" defaultValue={initialValues.area || ""} className={selectClass}>
            <option value="">Todas as áreas</option>
            {AREAS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1">
            Modelo de trabalho
          </label>
          <select name="workModel" defaultValue={initialValues.workModel || ""} className={selectClass}>
            <option value="">Todos os modelos</option>
            <option value="presencial">Presencial</option>
            <option value="remoto">Remoto</option>
            <option value="hibrido">Híbrido</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1">
            Regime de contratação
          </label>
          <select name="contractType" defaultValue={initialValues.contractType || ""} className={selectClass}>
            <option value="">Todos os regimes</option>
            <option value="CLT">CLT</option>
            <option value="PJ">PJ</option>
            <option value="Estagio">Estágio</option>
            <option value="Aprendiz">Jovem aprendiz</option>
            <option value="Temporario">Temporário</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1">
            Estado (UF)
          </label>
          <select
            name="state"
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedCity("");
            }}
            className={selectClass}
          >
            <option value="">Todos os estados</option>
            {BRAZIL_STATES.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1">
            Cidade
          </label>
          <select
            name="city"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={!selectedState || loadingCities}
            className={`${selectClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="">
              {!selectedState
                ? "Selecione o estado"
                : loadingCities
                ? "Carregando cidades..."
                : "Todas as cidades"}
            </option>
            {cities.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );
}
