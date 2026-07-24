"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Radar,
  Sparkles,
  ExternalLink,
  BookmarkCheck,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  Building2,
  MapPin,
  TrendingUp,
} from "lucide-react";

interface RadarItem {
  id: string;
  title: string;
  companyName: string;
  location: string;
  description: string;
  jobUrl: string | null;
  matchScore: number;
  recommendationReason: string;
  createdAt: string;
}

export function RadarClient() {
  const [items, setItems] = useState<RadarItem[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [onlyHighMatch, setOnlyHighMatch] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    fetchFeed();
  }, []);

  async function fetchFeed() {
    setLoading(true);
    try {
      const res = await fetch("/api/radar/feed");
      const data = await res.json();
      if (res.ok) {
        setItems(data.radarFeed || []);
        setRoles(data.interestedRoles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveToKanban(job: RadarItem) {
    setSavingId(job.id);
    try {
      const res = await fetch("/api/applications/quick-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: job.title,
          company: job.companyName,
          description: job.description,
          url: job.jobUrl || "",
        }),
      });
      if (res.ok) {
        setSavedIds((prev) => new Set(prev).add(job.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  }

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((job) => {
      const matchesSearch =
        !searchTerm.trim() ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesHighScore = !onlyHighMatch || job.matchScore >= 85;

      return matchesSearch && matchesHighScore;
    });
  }, [items, searchTerm, onlyHighMatch]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, onlyHighMatch, pageSize]);

  // Pagination calculations
  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentFeed = filteredItems.slice(startIndex, endIndex);

  const highMatchCount = useMemo(
    () => items.filter((item) => item.matchScore >= 85).length,
    [items]
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Smooth scroll back to feed top
      const feedHeader = document.getElementById("radar-feed-header");
      if (feedHeader) {
        feedHeader.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <main className="px-4 md:px-8 py-8 max-w-6xl mx-auto w-full space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mr-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao Dashboard
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Radar className="w-3.5 h-3.5 animate-spin-slow text-purple-600 dark:text-purple-400" />
              Radar Automático
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Radar de Oportunidades
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Vagas recentes coletadas e analisadas automaticamente com base no seu perfil de carreira e preferências.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchFeed}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-neutral-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Atualizar Feed</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-neutral-900/60 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {loading ? "..." : items.length}
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Vagas Detectadas
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-neutral-900/60 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {loading ? "..." : highMatchCount}
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Alto Match (≥ 85%)
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-neutral-900/60 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {roles.length}
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Cargos Monitorados
            </p>
          </div>
        </div>
      </div>

      {/* Roles Banner */}
      {roles.length > 0 && (
        <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              Monitorando especificamente para:{" "}
              <strong className="text-purple-950 dark:text-purple-200 font-semibold">
                {roles.join(", ")}
              </strong>
            </span>
          </div>
          <Link
            href="/settings"
            className="text-purple-700 dark:text-purple-300 font-bold hover:underline shrink-0 text-xs flex items-center gap-1"
          >
            Editar Cargos & Filteros →
          </Link>
        </div>
      )}

      {/* Toolbar: Search and Filters */}
      <div id="radar-feed-header" className="scroll-mt-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 shadow-sm">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por cargo, empresa ou localização..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-xs sm:text-sm outline-none focus:border-purple-500 dark:focus:border-purple-400 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyHighMatch((prev) => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                onlyHighMatch
                  ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Somente Alto Match (≥85%)</span>
            </button>

            {(searchTerm || onlyHighMatch) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setOnlyHighMatch(false);
                }}
                className="text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline px-2"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Results Counter Header */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>
            Exibindo{" "}
            <strong className="text-slate-900 dark:text-white">
              {totalItems > 0 ? startIndex + 1 : 0}-{endIndex}
            </strong>{" "}
            de <strong className="text-slate-900 dark:text-white">{totalItems}</strong> oportunidades
          </span>

          <div className="flex items-center gap-2">
            <span>Por página:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold px-2 py-1 text-slate-800 dark:text-slate-200 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value={6}>6</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feed List */}
      {loading ? (
        <div className="space-y-4 py-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-neutral-900 space-y-3 animate-pulse"
            >
              <div className="h-4 bg-slate-200 dark:bg-neutral-800 rounded w-1/3" />
              <div className="h-6 bg-slate-200 dark:bg-neutral-800 rounded w-2/3" />
              <div className="h-12 bg-slate-100 dark:bg-neutral-800/50 rounded w-full" />
            </div>
          ))}
        </div>
      ) : currentFeed.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Nenhuma oportunidade encontrada.
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || onlyHighMatch
              ? "Tente ajustar ou limpar os seus filtros de busca acima."
              : "Cadastre seus cargos de interesse para receber recomendações atualizadas em seu feed."}
          </p>
          {(searchTerm || onlyHighMatch) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setOnlyHighMatch(false);
              }}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {currentFeed.map((job) => {
            const isSaved = savedIds.has(job.id);
            const isSaving = savingId === job.id;
            const isHighMatch = job.matchScore >= 85;

            return (
              <div
                key={job.id}
                className="p-5 md:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/90 dark:border-neutral-800 space-y-4 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-800/80 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                          isHighMatch
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
                        }`}
                      >
                        {job.matchScore}% Match
                      </span>

                      {job.location && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {job.location}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {job.title} —{" "}
                      <span className="text-slate-600 dark:text-slate-400 font-normal">
                        {job.companyName}
                      </span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {job.jobUrl && (
                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
                      >
                        <span>Ver Anúncio</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>
                    )}

                    <button
                      onClick={() => handleSaveToKanban(job)}
                      disabled={isSaved || isSaving}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSaved
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Salvo no Kanban
                        </>
                      ) : isSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Salvando...
                        </>
                      ) : (
                        <>
                          <BookmarkCheck className="w-4 h-4" /> Salvar no Kanban
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {job.description}
                </p>

                <div className="text-[11px] text-purple-900 dark:text-purple-200 font-medium bg-purple-50/80 dark:bg-purple-950/30 p-3 rounded-2xl border border-purple-100 dark:border-purple-900/40 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-purple-950 dark:text-purple-100">
                      Por que foi recomendado:
                    </strong>{" "}
                    {job.recommendationReason}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Página <strong className="text-slate-900 dark:text-white">{safePage}</strong> de{" "}
            <strong className="text-slate-900 dark:text-white">{totalPages}</strong>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(safePage - 1)}
              disabled={safePage <= 1}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                // Show pages near current page
                if (
                  totalPages <= 7 ||
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  Math.abs(pageNumber - safePage) <= 1
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        safePage === pageNumber
                          ? "bg-purple-600 text-white shadow-sm"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  (pageNumber === 2 && safePage > 3) ||
                  (pageNumber === totalPages - 1 && safePage < totalPages - 2)
                ) {
                  return (
                    <span key={pageNumber} className="text-xs text-slate-400 px-1">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(safePage + 1)}
              disabled={safePage >= totalPages}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Próxima</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
