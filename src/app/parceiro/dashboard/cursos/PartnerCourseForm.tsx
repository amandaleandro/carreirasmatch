"use client";

import { useState, useEffect } from "react";
import { Plus, BookOpen, Link as LinkIcon, Award, MapPin, Tag } from "lucide-react";

const BRAZIL_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
].sort();

const COURSE_AREAS = [
  "Tecnologia / TI",
  "Marketing / Comunicação",
  "Administração / Negócios",
  "Saúde / Enfermagem",
  "Engenharia / Arquitetura",
  "Idiomas / Línguas",
  "Vendas / Comercial",
  "Finanças / Contabilidade",
  "Design / UX / Criatividade",
  "Educação / Pedagogia",
  "Direito / Jurídico",
  "Outros",
].sort((a, b) => a.localeCompare(b, "pt-BR"));

export function PartnerCourseForm({
  createCourseAction,
}: {
  createCourseAction: (formData: FormData) => Promise<void>;
}) {
  const [modality, setModality] = useState("online");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedState || modality === "online") {
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
  }, [selectedState, modality]);

  const inputClass =
    "w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-sm font-medium text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all";
  const selectClass =
    "w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-sm font-semibold text-neutral-800 dark:text-neutral-100 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setSubmitting(true);
  }

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm sticky top-24">
      <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
        <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Plus className="h-4.5 w-4.5" />
        </div>
        Novo Curso
      </h2>

      <form action={createCourseAction} onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-blue-600" /> Título do Curso *
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="Ex: Programação Web Fullstack"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <LinkIcon className="h-3.5 w-3.5 text-blue-600" /> Link de Inscrição *
          </label>
          <input
            type="url"
            name="url"
            required
            placeholder="https://..."
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">
            Área do Curso *
          </label>
          <select name="area" required className={selectClass}>
            <option value="">Selecione a área</option>
            {COURSE_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">
              Modalidade
            </label>
            <select
              name="modality"
              value={modality}
              onChange={(e) => setModality(e.target.value)}
              className={selectClass}
            >
              <option value="online">Online</option>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">
              Preço
            </label>
            <select name="free" className={selectClass}>
              <option value="true">Gratuito</option>
              <option value="false">Pago</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-emerald-600" /> Certificado
          </label>
          <select name="certificate" className={selectClass}>
            <option value="true">Sim, emite certificado</option>
            <option value="false">Não possui certificado</option>
          </select>
        </div>

        {modality !== "online" && (
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Estado (UF)
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
                <option value="">UF</option>
                {BRAZIL_STATES.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">
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
                    ? "UF primeiro"
                    : loadingCities
                    ? "Carregando..."
                    : "Selecione"}
                </option>
                {cities.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-neutral-100 dark:border-neutral-800">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="h-3 w-3 text-blue-600" /> Cupom
            </label>
            <input
              type="text"
              name="couponCode"
              placeholder="Ex: MATCH20"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider">
              Desconto
            </label>
            <input
              type="text"
              name="couponDiscount"
              placeholder="Ex: 20% OFF"
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>{submitting ? "Cadastrando..." : "Cadastrar Curso"}</span>
        </button>
      </form>
    </div>
  );
}
