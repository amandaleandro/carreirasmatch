"use client";

import { useCallback, useEffect, useState } from "react";

type Report = {
  id: string;
  reason: string;
  details: string;
  createdAt: string;
  opportunity: { title: string; url: string };
  user: { email: string | null } | null;
};

export function AdminOpportunityReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const load = useCallback(async () => {
    const response = await fetch("/api/admin/opportunity-reports");
    const data = await response.json();
    if (response.ok) setReports(data.reports);
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function resolve(id: string, deactivate: boolean) {
    await fetch(`/api/admin/opportunity-reports/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "resolved", deactivate }),
    });
    setReports((current) => current.filter((report) => report.id !== id));
  }

  if (reports.length === 0) return <p className="text-sm text-neutral-500">Nenhuma denúncia aberta.</p>;
  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div key={report.id} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
          <a href={report.opportunity.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600">{report.opportunity.title}</a>
          <p className="mt-1 text-xs text-neutral-500">{report.reason} • {new Date(report.createdAt).toLocaleString("pt-BR")}</p>
          {report.details && <p className="mt-2 text-sm">{report.details}</p>}
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => resolve(report.id, true)} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white">Desativar vaga</button>
            <button type="button" onClick={() => resolve(report.id, false)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold dark:border-neutral-700">Manter vaga</button>
          </div>
        </div>
      ))}
    </div>
  );
}
