"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const BRAZIL_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
].sort();

const AREAS = [
  { value: "Tecnologia", label: "Tecnologia / TI" },
  { value: "Marketing", label: "Marketing / Comunicação" },
  { value: "Administrativo", label: "Administrativo" },
  { value: "Vendas", label: "Vendas / Comercial" },
  { value: "TI & Suporte", label: "Atendimento / Suporte" },
  { value: "Financeiro", label: "Financeiro / Contabilidade" },
  { value: "Logistica", label: "Logística / Estoque" },
  { value: "Saude", label: "Saúde / Enfermagem" },
  { value: "Educacao", label: "Educação / Ensino" },
  { value: "Juridico", label: "Jurídico / Direito" },
  { value: "RH", label: "Recursos Humanos / RH" },
  { value: "Design", label: "Design / Criação" },
  { value: "Produto", label: "Gestão de Produto" },
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

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.target.form?.requestSubmit();
  };

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
    "w-full h-9.5 rounded-xl border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none focus:border-[#2563EB] cursor-pointer truncate shadow-2xs";

  return (
    <form
      method="GET"
      action="/todas-as-vagas"
      className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-4 font-sans"
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
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            name="q"
            defaultValue={initialValues.q || ""}
            placeholder="Buscar por cargo ou palavra-chave (ex: Desenvolvedor, Vendedor)..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#F8FAFC]/50 dark:bg-neutral-900/50 text-xs font-medium text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-450 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="h-11 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-5 py-2 text-xs shadow-sm shadow-[#2563EB]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-[0.98]"
          >
            <span>Buscar vagas</span>
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {hasActiveFilters && (
            <Link
              href="/todas-as-vagas"
              className="h-11 rounded-xl border border-[#E2E8F0] hover:border-[#64748B] dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 text-xs font-bold text-[#64748B] flex items-center justify-center transition-all shrink-0 active:scale-[0.98]"
            >
              Limpar ✕
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1.5 border-t border-[#E2E8F0] dark:border-neutral-800">
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
            Área de atuação
          </label>
          <select name="area" defaultValue={initialValues.area || ""} onChange={handleSelectChange} className={selectClass}>
            <option value="">Todas as áreas</option>
            {AREAS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
            Modelo de trabalho
          </label>
          <select name="workModel" defaultValue={initialValues.workModel || ""} onChange={handleSelectChange} className={selectClass}>
            <option value="">Todos os modelos</option>
            <option value="presencial">Presencial</option>
            <option value="remoto">Remoto</option>
            <option value="hibrido">Híbrido</option>
          </select>
        </div>

        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
            Regime de contratação
          </label>
          <select name="contractType" defaultValue={initialValues.contractType || ""} onChange={handleSelectChange} className={selectClass}>
            <option value="">Todos os regimes</option>
            <option value="CLT">CLT</option>
            <option value="PJ">PJ</option>
            <option value="Estagio">Estágio</option>
            <option value="Aprendiz">Jovem aprendiz</option>
            <option value="Temporario">Temporário</option>
          </select>
        </div>

        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
            Estado (UF)
          </label>
          <select
            name="state"
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedCity("");
              setTimeout(() => {
                e.target.form?.requestSubmit();
              }, 50);
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
          <label className="block text-[9px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
            Cidade
          </label>
          <select
            name="city"
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setTimeout(() => {
                e.target.form?.requestSubmit();
              }, 50);
            }}
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
