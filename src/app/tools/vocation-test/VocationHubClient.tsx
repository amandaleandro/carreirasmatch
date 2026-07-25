"use client";

import { useState } from "react";
import Link from "next/link";
import { VOCATION_AREAS, VocationAreaConfig } from "@/lib/vocation-areas";

export type RecommendedAreaInfo = {
  areaSlug: string;
  areaLabel: string;
  fitReason: string;
  suggestedPath: string;
};

export type AreaOfTheDayInfo = {
  area: { slug: string; label: string };
  explanation: {
    whatItIs: string;
    dailyRoutine: string;
    educationPath: string;
    marketOutlook: string;
    funFact: string;
  };
};

type VocationHubClientProps = {
  testedSlugs: string[];
  hasCompletedGeneralTest: boolean;
  recommendedAreas: RecommendedAreaInfo[];
  areaOfTheDay: AreaOfTheDayInfo | null;
  loggedIn: boolean;
};

const CATEGORIES = [
  { id: "all", label: "Todas as áreas" },
  { id: "tech", label: "💻 TI & Exatas" },
  { id: "health", label: "🩺 Saúde & Biológicas" },
  { id: "humanities", label: "⚖️ Humanas & Sociais" },
  { id: "business", label: "📈 Negócios & Gestão" },
  { id: "arts", label: "🎨 Artes & Design" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

const CATEGORY_MAPPING: Record<string, CategoryId> = {
  ti: "tech",
  engenharia: "tech",
  exatas: "tech",
  arquitetura: "tech",

  medicina: "health",
  enfermagem: "health",
  odontologia: "health",
  farmacia: "health",
  fisioterapia: "health",
  nutricao: "health",
  psicologia: "health",
  veterinaria: "health",
  "educacao-fisica": "health",
  biologicas: "health",
  agronomia: "health",

  direito: "humanities",
  educacao: "humanities",
  letras: "humanities",
  humanas: "humanities",
  "servico-social": "humanities",
  "seguranca-publica": "humanities",

  administracao: "business",
  financas: "business",
  marketing: "business",
  comunicacao: "business",

  design: "arts",
  artes: "arts",
  moda: "arts",
  "gastronomia-turismo": "arts",
  audiovisual: "arts",
};

export function VocationHubClient({
  testedSlugs: initialTestedSlugs,
  hasCompletedGeneralTest: initialHasCompleted,
  recommendedAreas,
  areaOfTheDay,
}: VocationHubClientProps) {
  const testedSlugs = new Set(initialTestedSlugs);
  const recommendedSlugSet = new Set(recommendedAreas.map((a) => a.areaSlug));

  // Permite que usuários universitários ou com consentimento desbloqueiem o visual de áreas
  const [bypassedCollegeMode, setBypassedCollegeMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [lockedAreaName, setLockedAreaName] = useState("");

  const isUnlocked = initialHasCompleted || bypassedCollegeMode;

  const filteredAreas = VOCATION_AREAS.filter((area) => {
    const matchesCategory =
      selectedCategory === "all" || CATEGORY_MAPPING[area.slug] === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      area.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAreaCardClick = (area: VocationAreaConfig, e: React.MouseEvent) => {
    if (!isUnlocked) {
      e.preventDefault();
      setLockedAreaName(area.label);
      setShowLockedModal(true);
    }
  };

  return (
    <div className="space-y-8">
      {/* Fluxo de Etapas (Progress Stepper) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Etapa 1 */}
        <div
          id="etapa-1"
          className={`relative rounded-3xl p-6 transition-all border-2 ${
            initialHasCompleted
              ? "border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20"
              : "border-blue-500 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/20 shadow-md"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                initialHasCompleted
                  ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300"
                  : "bg-blue-600 text-white shadow-sm"
              }`}
            >
              {initialHasCompleted ? "Etapa 1 Concluída ✓" : "Etapa 1 · Recomendada primeiro"}
            </span>

            {initialHasCompleted && (
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Resultado disponível
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            Ainda não sei minha área (Quiz Geral)
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6">
            Descubra em 3 minutos quais áreas de conhecimento mais combinam com o seu perfil e se
            o seu caminho ideal é faculdade, curso técnico ou os dois.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/tools/vocation-test/discover"
              className={`inline-flex items-center justify-center font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm ${
                initialHasCompleted
                  ? "bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
              }`}
            >
              {initialHasCompleted ? "Refazer / Ver resultado do Quiz Geral →" : "Iniciar Quiz Geral (Etapa 1) →"}
            </Link>
          </div>
        </div>

        {/* Card Etapa 2 Status */}
        <div
          className={`relative rounded-3xl p-6 transition-all border-2 ${
            isUnlocked
              ? "border-emerald-400/30 bg-white/95 dark:bg-neutral-900/90"
              : "border-amber-300/80 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/15"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                isUnlocked
                  ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300"
                  : "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300"
              }`}
            >
              {isUnlocked ? "Etapa 2 Liberada 🔓" : "Etapa 2 · Bloqueada 🔒"}
            </span>

            {!isUnlocked && (
              <button
                onClick={() => setBypassedCollegeMode(true)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Já faço faculdade? Liberar
              </button>
            )}
          </div>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            Aprofundamento por Área
          </h2>

          {isUnlocked ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Sua Etapa 1 está pronta! Escolha uma das áreas recomendadas ou navegue pelas 26
              áreas abaixo para fazer o teste profundo de carreira, notas de corte e plano de estudos.
            </p>
          ) : (
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              Para estudantes do Ensino Médio, o ideal é realizar o <strong>Quiz Geral (Etapa 1)</strong>{" "}
              primeiro. Assim o sistema identifica seu perfil antes de você testar uma área específica.
            </p>
          )}

          {!isUnlocked && (
            <div className="mt-4 p-3 rounded-xl bg-amber-100/70 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
              <span>💡</span>
              <span>Conclua a Etapa 1 ao lado para destravar todos os testes específicos.</span>
            </div>
          )}
        </div>
      </div>

      {/* Áreas Recomendadas da Etapa 1 (se concluída) */}
      {initialHasCompleted && recommendedAreas.length > 0 && (
        <div className="rounded-3xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Suas Áreas Recomendadas na Etapa 1
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recommendedAreas.map((rec) => (
              <Link
                key={rec.areaSlug}
                href={`/tools/vocation-test/${rec.areaSlug}`}
                className="group rounded-2xl border border-blue-300 dark:border-blue-800 bg-white dark:bg-neutral-900 p-4 shadow-sm hover:shadow-md hover:border-blue-500 transition-all"
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <h4 className="font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {rec.areaLabel}
                  </h4>
                  <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 rounded-full px-2 py-0.5 shrink-0">
                    Top Match
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {rec.fitReason}
                </p>
                <span className="inline-block mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                  Fazer teste de {rec.areaLabel} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Área do Dia Showcase */}
      {areaOfTheDay && (
        <div className="rounded-3xl border-2 border-amber-200 dark:border-amber-900/50 bg-gradient-to-r from-amber-50/80 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20 p-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-200/70 dark:bg-amber-900/60 rounded-full px-3 py-1">
                Área do Dia
              </span>
              <h3 className="font-bold text-neutral-900 dark:text-white">
                {areaOfTheDay.area.label}
              </h3>
            </div>
            {!isUnlocked && (
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Faça a Etapa 1 para saber se combina com você
              </span>
            )}
          </div>

          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {areaOfTheDay.explanation.whatItIs}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-600 dark:text-neutral-400 pt-1">
            <div>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">Rotina: </span>
              {areaOfTheDay.explanation.dailyRoutine}
            </div>
            <div>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">Mercado: </span>
              {areaOfTheDay.explanation.marketOutlook}
            </div>
          </div>

          <div className="pt-2 flex items-center gap-4 flex-wrap">
            {isUnlocked ? (
              <Link
                href={`/tools/vocation-test/${areaOfTheDay.area.slug}`}
                className="text-sm font-semibold text-amber-800 dark:text-amber-300 hover:underline inline-flex items-center gap-1"
              >
                Fazer teste de {areaOfTheDay.area.label} →
              </Link>
            ) : (
              <Link
                href="/tools/vocation-test/discover"
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                Descobrir se {areaOfTheDay.area.label} combina com você (Etapa 1) →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Seção Etapa 2: Catálogo de Áreas */}
      <div className="space-y-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full">
                Etapa 2
              </span>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Todas as Áreas de Conhecimento ({VOCATION_AREAS.length})
              </h2>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {isUnlocked
                ? "Escolha uma área abaixo para explorar o teste aprofundado, simulação de notas e mapa de estudos."
                : "Etapa bloqueada até a conclusão do Quiz Geral (Etapa 1)."}
            </p>
          </div>

          {/* Atalho Faculdade */}
          <Link
            href="/tools/vocation-test/college"
            className="self-start sm:self-auto rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>🎓</span>
            <span>Já faço faculdade? Clique aqui</span>
          </Link>
        </div>

        {/* Barra de Filtro & Busca */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Abas de Categorias */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Input de Busca */}
          <div className="relative shrink-0 md:w-64">
            <input
              type="text"
              placeholder="Buscar área..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-1.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Grid de Cards das Áreas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAreas.map((area) => {
            const isTested = testedSlugs.has(area.slug);
            const isRecommended = recommendedSlugSet.has(area.slug);

            return (
              <Link
                key={area.slug}
                href={`/tools/vocation-test/${area.slug}`}
                onClick={(e) => handleAreaCardClick(area, e)}
                className={`relative group rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                  !isUnlocked
                    ? "border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 opacity-80 hover:opacity-100"
                    : isRecommended
                    ? "border-blue-300 dark:border-blue-800/80 bg-blue-50/30 dark:bg-blue-950/20 shadow-sm hover:shadow-md hover:border-blue-500"
                    : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm hover:shadow-md hover:border-blue-500"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {area.label}
                    </h3>

                    <div className="flex items-center gap-1 shrink-0">
                      {!isUnlocked && (
                        <span className="text-[10px] font-semibold rounded-full px-2 py-0.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                          🔒 Bloqueado
                        </span>
                      )}
                      {isRecommended && (
                        <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                          ⭐ Recomendada
                        </span>
                      )}
                      {isTested && (
                        <span className="text-[10px] font-semibold rounded-full px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300">
                          ✓ Testado
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3">
                    {area.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 dark:text-neutral-500 font-medium">
                    {area.subareas.length} especializações
                  </span>
                  <span
                    className={`font-semibold ${
                      isUnlocked
                        ? "text-blue-600 dark:text-blue-400 group-hover:underline"
                        : "text-neutral-400 dark:text-neutral-500"
                    }`}
                  >
                    {isUnlocked ? "Fazer teste →" : "Requer Etapa 1"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredAreas.length === 0 && (
          <div className="text-center py-12 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Nenhuma área encontrada para o filtro selecionado.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Modal de Alerta quando clica em Área Bloqueada */}
      {showLockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl font-bold">
              🔒
            </div>

            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Faça a Etapa 1 primeiro!
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2">
                Para estudantes do Ensino Médio, não é recomendado testar a área de{" "}
                <strong>{lockedAreaName}</strong> antes de passar pelo <strong>Quiz Geral (Etapa 1)</strong>.
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                O Quiz Geral leva apenas 3 minutos e ajuda você a descobrir se {lockedAreaName} realmente
                é uma das melhores opções para o seu perfil!
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/tools/vocation-test/discover"
                onClick={() => setShowLockedModal(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center text-sm transition-all shadow-sm"
              >
                Ir para a Etapa 1 (Quiz Geral) →
              </Link>

              <button
                onClick={() => {
                  setBypassedCollegeMode(true);
                  setShowLockedModal(false);
                }}
                className="w-full py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
              >
                Já sei o que quero / Já faço faculdade (Liberar área)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
