"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Radar, Sparkles, ExternalLink, BookmarkCheck, CheckCircle2, SlidersHorizontal, RefreshCw } from "lucide-react";

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
    } font: {
      setSavingId(null);
    }
  }

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6 pb-12 font-sans">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Dashboard
          </Link>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium">
            Monitoramento Automático de Oportunidades
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Radar className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-title font-bold text-neutral-900 dark:text-white">
                Radar de Oportunidades
              </h1>
              <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400">
                Oportunidades recentes filtradas e pré-analisadas para os seus cargos de interesse.
              </p>
            </div>
          </div>

          <button
            onClick={fetchFeed}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Atualizar Feed
          </button>
        </div>

        {roles.length > 0 && (
          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                Cargos Monitorados: <strong className="text-neutral-900 dark:text-white">{roles.join(", ")}</strong>
              </span>
            </div>
            <Link
              href="/settings"
              className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
            >
              Editar Filtros
            </Link>
          </div>
        )}

        {/* Feed List */}
        {loading ? (
          <div className="py-12 text-center text-xs text-neutral-400">
            Carregando Radar de Oportunidades...
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center space-y-2">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              Nenhuma vaga nova no radar no momento.
            </p>
            <p className="text-xs text-neutral-500">
              Configure seus cargos de interesse nas configurações para receber os alertas.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((job) => {
              const isSaved = savedIds.has(job.id);
              const isSaving = savingId === job.id;

              return (
                <div
                  key={job.id}
                  className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm hover:border-purple-300 dark:hover:border-purple-800 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          {job.matchScore}% Match
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {job.location || "Remoto / Brasil"}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                        {job.title} — <span className="text-neutral-500 font-normal">{job.companyName}</span>
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {job.jobUrl && (
                        <a
                          href={job.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
                        >
                          <span>Ver Anúncio</span>
                          <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
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

                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-2">
                    {job.description}
                  </p>

                  <div className="text-[11px] text-purple-700 dark:text-purple-300 font-medium bg-purple-50 dark:bg-purple-950/30 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/40">
                    💡 <strong>Por que este alerte foi recomendado:</strong> {job.recommendationReason}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
