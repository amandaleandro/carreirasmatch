"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { updateApplicationStatus, scheduleInterview } from "@/app/applications/actions";

type ApplicationItem = {
  id: string;
  company: string;
  jobTitle: string;
  location?: string | null;
  status: string;
  fitScore?: number | null;
  appliedAt?: Date | null;
  interviewAt?: Date | null;
  deadline?: Date | null;
  notes?: string | null;
};

const KANBAN_COLUMNS = [
  { id: "applied", label: "Inscrito", color: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { id: "screening", label: "Em Triagem", color: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  { id: "interview", label: "Entrevista", color: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { id: "technical_test", label: "Teste Técnico", color: "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
  { id: "offer", label: "Proposta", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
];

export function ApplicationsKanban({ items }: { items: ApplicationItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

  function handleStatusChange(id: string, newStatus: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("status", newStatus);
      await updateApplicationStatus(id, fd);
    });
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => {
          const colItems = items.filter((item) => item.status === col.id);
          return (
            <div
              key={col.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-4 min-w-[16rem] space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                    {colItems.length}
                  </span>
                </div>

                {/* Cards List */}
                {colItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-4 text-center text-xs text-slate-400">
                    Nenhuma vaga nesta etapa
                  </div>
                ) : (
                  <div className="space-y-3">
                    {colItems.map((item) => (
                      <div
                        key={item.id}
                        className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs hover:border-blue-500/60 transition-all space-y-2.5 relative"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                              {item.jobTitle}
                            </h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                              <Building2 className="w-3 h-3 shrink-0 text-slate-400" />
                              {item.company}
                            </p>
                          </div>

                          {item.fitScore !== null && item.fitScore !== undefined && (
                            <span className="shrink-0 text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900/60">
                              {item.fitScore}%
                            </span>
                          )}
                        </div>

                        {item.interviewAt && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200/60 dark:border-amber-900/60">
                            <CalendarDays className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>Entrevista: {new Date(item.interviewAt).toLocaleDateString("pt-BR")}</span>
                          </div>
                        )}

                        {/* Status Switcher Menu */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          <select
                            value={item.status}
                            disabled={isPending}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className="bg-transparent text-[11px] font-bold text-slate-600 dark:text-slate-400 outline-none cursor-pointer hover:text-blue-600"
                          >
                            {KANBAN_COLUMNS.map((c) => (
                              <option key={c.id} value={c.id}>
                                Mover para: {c.label}
                              </option>
                            ))}
                          </select>

                          <Link
                            href="/analise"
                            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>Ver IA</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
