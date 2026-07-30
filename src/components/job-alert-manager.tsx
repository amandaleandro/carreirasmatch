"use client";

import { useState } from "react";
import { JobAlertForm } from "@/components/job-alert-form";
import { PushOptIn } from "@/components/push-opt-in";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { Trash2, Bell, MapPin, Calendar } from "lucide-react";

type Alert = {
  id: string;
  query: string;
  city: string;
  state: string;
  frequency: string;
};

export function JobAlertManager({ initialAlerts }: { initialAlerts: Alert[] }) {
  const [alerts, setAlerts] = useState(initialAlerts);

  function addAlert(alert: Alert) {
    setAlerts((current) => [alert, ...current]);
  }

  async function remove(id: string) {
    const response = await fetch(`/api/job-alerts/${id}`, { method: "DELETE" });
    if (response.ok) {
      track(ANALYTICS_EVENTS.JOB_ALERT_DELETED);
      setAlerts((current) => current.filter((alert) => alert.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <JobAlertForm onCreated={addAlert} />

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Meus Alertas Ativos</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {alerts.length} {alerts.length === 1 ? "alerta" : "alertas"}
          </span>
        </div>

        <PushOptIn />

        {alerts.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Nenhum alerta cadastrado ainda.</p>
            <p className="text-xs text-slate-400 mt-1">Preencha o formulário acima para começar a monitorar vagas.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 p-4 text-sm transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {alert.query || "Todas as vagas"}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800">
                    <MapPin className="w-3 h-3" />
                    {[alert.city, alert.state].filter(Boolean).join(", ") || "Brasil"}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800">
                    <Calendar className="w-3 h-3" />
                    {alert.frequency === "weekly" ? "Semanal" : "Diário"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => remove(alert.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  title="Excluir alerta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
