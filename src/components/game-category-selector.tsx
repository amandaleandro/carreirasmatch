"use client";

import { useState } from "react";
import { VOCATION_AREAS } from "@/lib/vocation-areas";
import { Filter, Search, Check } from "lucide-react";

export const CAREER_STAGES = [
  { id: "profissional", label: "Profissional & Transição", description: "Decisões, ferramentas e desafios da carreira" },
  { id: "todos", label: "Todos os Jogos", description: "Ver catálogo completo" },
  { id: "ensino-medio", label: "Ensino Médio & ENEM", description: "Matérias escolares, orientação e vestibulares" },
  { id: "primeiro-emprego", label: "Primeiro Emprego & Estágio", description: "Currículo, entrevista e etiqueta corporativa" },
] as const;

interface GameCategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function GameCategorySelector({
  selectedCategory,
  onSelectCategory,
}: GameCategorySelectorProps) {
  const [search, setSearch] = useState("");

  const filteredAreas = VOCATION_AREAS.filter((area) =>
    area.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 md:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Segmentar por Trilha ou Área Profissional
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Escolha sua área para adaptar os desafios, termos técnicos e perguntas dos minijogos.
          </p>
        </div>

        {/* Busca rápida de área */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar área (ex: Medicina, Direito)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Momentos de Carreira / Fases */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2 block">
          Momentos de Carreira
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {CAREER_STAGES.map((stage) => {
            const isSelected = selectedCategory === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => onSelectCategory(stage.id)}
                className={`text-left p-3.5 rounded-2xl border transition-all text-xs flex items-start justify-between gap-2 ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm font-semibold"
                    : "bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                <div>
                  <div className="font-bold mb-0.5">{stage.label}</div>
                  <div className={`text-[10px] leading-tight ${isSelected ? "text-blue-100" : "text-neutral-500 dark:text-neutral-400"}`}>
                    {stage.description}
                  </div>
                </div>
                {isSelected && <Check className="h-4 w-4 shrink-0 mt-0.5 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Áreas Profissionais Oficiais (VOCATION_AREAS) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Áreas de Atuação ({VOCATION_AREAS.length} Áreas Oficiais)
          </span>
          {selectedCategory !== "todos" && !CAREER_STAGES.some((s) => s.id === selectedCategory) && (
            <button
              onClick={() => onSelectCategory("todos")}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Limpar filtro de área
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {filteredAreas.map((area) => {
            const isSelected = selectedCategory === area.slug;
            return (
              <button
                key={area.slug}
                onClick={() => onSelectCategory(area.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs transition-all border font-medium flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-neutral-100/80 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 border-neutral-200/80 dark:border-neutral-700/60 hover:bg-neutral-200/60 dark:hover:bg-neutral-700"
                }`}
              >
                {area.label}
                {isSelected && <Check className="h-3 w-3" />}
              </button>
            );
          })}
          {filteredAreas.length === 0 && (
            <p className="text-xs text-neutral-500 py-2">Nenhuma área encontrada para &quot;{search}&quot;.</p>
          )}
        </div>
      </div>
    </div>
  );
}
