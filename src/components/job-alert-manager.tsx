"use client";

import { useState } from "react";
import { JobAlertForm } from "@/components/job-alert-form";

type Alert = {
  id: string;
  query: string;
  city: string;
  state: string;
  frequency: string;
};

export function JobAlertManager({ initialAlerts }: { initialAlerts: Alert[] }) {
  const [alerts, setAlerts] = useState(initialAlerts);

  async function remove(id: string) {
    const response = await fetch(`/api/job-alerts/${id}`, { method: "DELETE" });
    if (response.ok) setAlerts((current) => current.filter((alert) => alert.id !== id));
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Alertas de vagas</h2>
      <p className="mt-1 text-sm text-neutral-500">Receba oportunidades novas de acordo com seus interesses.</p>
      <div className="mt-4"><JobAlertForm /></div>
      <div className="mt-4 space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 text-sm dark:border-neutral-800">
            <span>{alert.query || "Todas as vagas"} • {[alert.city, alert.state].filter(Boolean).join(", ") || "Brasil"} • {alert.frequency === "weekly" ? "semanal" : "diário"}</span>
            <button type="button" onClick={() => remove(alert.id)} className="text-xs font-semibold text-red-600">Excluir</button>
          </div>
        ))}
      </div>
    </div>
  );
}
