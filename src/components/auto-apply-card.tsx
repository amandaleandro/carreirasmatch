"use client";

import { useState, useEffect } from "react";

interface Settings {
  enabled: boolean;
  minMatchScore: number;
  autoTailorResume: boolean;
  dailyLimit: number;
}

interface QueueItem {
  id: string;
  jobTitle: string;
  company: string;
  jobUrl: string;
  fitScore: number;
  status: string;
  createdAt: string;
}

export function AutoApplySettingsCard() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auto-apply/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
        if (data.queue) setQueue(data.queue);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleToggle = async (enabled: boolean) => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/auto-apply/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, enabled }),
      });
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    } finally {
      setSaving(false);
    }
  };

  const handleMinScoreChange = async (score: number) => {
    if (!settings) return;
    setSettings((prev) => (prev ? { ...prev, minMatchScore: score } : null));
    setSaving(true);
    try {
      await fetch("/api/auto-apply/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, minMatchScore: score }),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-neutral-900/40 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 dark:bg-neutral-800 rounded mb-4"></div>
        <div className="h-4 w-64 bg-slate-100 dark:bg-neutral-800/60 rounded"></div>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-blue-950/20 dark:via-neutral-900/40 dark:to-indigo-950/10 p-6 shadow-lg shadow-blue-500/5 relative overflow-hidden space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider rounded-full px-2.5 py-0.5 mb-1.5 bg-blue-600 text-white">
            Exclusivo CarreirasMatch
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            🤖 Candidatura Inteligente & Disparo Assistido
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Adapta o seu currículo para cada vaga e aplica automaticamente nas oportunidades ideais.
          </p>
        </div>

        <button
          onClick={() => handleToggle(!settings?.enabled)}
          disabled={saving}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 ${
            settings?.enabled
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
              : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${settings?.enabled ? "bg-emerald-300 animate-ping" : "bg-slate-400"}`} />
          {settings?.enabled ? "Piloto Automático Ativo" : "Ativar Piloto Automático"}
        </button>
      </div>

      {settings && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 bg-white/70 dark:bg-neutral-900/70 p-4.5 rounded-2xl border border-slate-200/60 dark:border-neutral-800">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Regras do Robô
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Match mínimo para disparo:</span>
                <span className="text-blue-600 dark:text-blue-400 font-extrabold">{settings.minMatchScore}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                step="5"
                value={settings.minMatchScore}
                onChange={(e) => handleMinScoreChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[10px] text-slate-500">
                Apenas vagas com alinhamento maior ou igual a {settings.minMatchScore}% receberão o currículo otimizado.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-neutral-800/80">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Otimizar CV por vaga</p>
                <p className="text-[10px] text-slate-500">Gera versão customizada para o ATS antes do disparo</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                Ativado
              </span>
            </div>
          </div>

          <div className="space-y-3 bg-white/70 dark:bg-neutral-900/70 p-4.5 rounded-2xl border border-slate-200/60 dark:border-neutral-800 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Fila de Disparos Automáticos
              </h3>

              {queue.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs italic">
                  Nenhuma vaga na fila no momento. As vagas compatíveis do Radar aparecerão aqui automaticamente.
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {queue.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-800/50 text-xs border border-slate-100 dark:border-neutral-800"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{item.jobTitle}</p>
                        <p className="text-[10px] text-slate-500 truncate">{item.company}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-500/20">
                          {item.fitScore}% match
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 capitalize">
                          {item.status === "queued" ? "Na Fila" : item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-500 italic mt-2">
              💡 Diferencial CarreirasMatch: Cada envio é pré-validado pela IA para garantir que seu currículo tenha aderência máxima aos filtros dos recrutadores.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
