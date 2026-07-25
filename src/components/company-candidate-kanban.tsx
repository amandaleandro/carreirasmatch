"use client";

import React, { useState } from "react";
import type { CandidateStatus, ScreeningCandidate } from "@/components/screening-results";

interface CompanyCandidateKanbanProps {
  candidates: ScreeningCandidate[];
  onGenerateInterviewScript?: (candidate: ScreeningCandidate) => void;
}

const STAGES: Array<{ id: CandidateStatus; label: string; color: string }> = [
  { id: "none", label: "Recebidos", color: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200" },
  { id: "screening", label: "Em Triagem", color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200" },
  { id: "interview", label: "Entrevista", color: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200" },
  { id: "test", label: "Teste Técnico", color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200" },
  { id: "approved", label: "Aprovado", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" },
  { id: "rejected", label: "Reprovado", color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200" },
];

export function CompanyCandidateKanban({ candidates: initialCandidates, onGenerateInterviewScript }: CompanyCandidateKanbanProps) {
  const [candidatesList, setCandidatesList] = useState<ScreeningCandidate[]>(initialCandidates);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const moveCandidate = async (candidateId: string, newStatus: CandidateStatus) => {
    setUpdatingId(candidateId);
    try {
      const res = await fetch("/api/empresa/candidates/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, status: newStatus }),
      });
      if (res.ok) {
        setCandidatesList((prev) =>
          prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          Pipeline Kanban de Processo Seletivo
        </h2>
        <span className="text-xs text-neutral-500">
          Mova os candidatos entre as etapas do processo
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageCandidates = candidatesList.filter((c) => (c.status || "none") === stage.id);

          return (
            <div
              key={stage.id}
              className="flex flex-col rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 p-3 min-h-[260px]"
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stage.color}`}>
                  {stage.label}
                </span>
                <span className="text-xs font-semibold text-neutral-500">
                  {stageCandidates.length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[500px]">
                {stageCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className={`p-3 rounded-lg border bg-white dark:bg-neutral-900 shadow-xs space-y-2 text-xs transition-opacity ${
                      updatingId === candidate.id ? "opacity-50" : "opacity-100"
                    } ${candidate.eliminated ? "border-red-200 dark:border-red-900/50" : "border-neutral-200 dark:border-neutral-800"}`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {candidate.candidateName || candidate.fileName}
                      </span>
                      <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {candidate.fitScore}%
                      </span>
                    </div>

                    {candidate.eliminated && (
                      <p className="text-[10px] text-red-600 dark:text-red-400 line-clamp-1 font-medium">
                        ⚠️ Requisito eliminatório
                      </p>
                    )}

                    <div className="pt-1 flex flex-col gap-1">
                      <select
                        value={candidate.status || "none"}
                        onChange={(e) => {
                          const stage = STAGES.find((item) => item.id === e.target.value);
                          if (stage) void moveCandidate(candidate.id, stage.id);
                        }}
                        className="w-full text-[10px] rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-1 font-medium text-neutral-700 dark:text-neutral-300"
                      >
                        {STAGES.map((s) => (
                          <option key={s.id} value={s.id}>
                            Mover para: {s.label}
                          </option>
                        ))}
                      </select>

                      {onGenerateInterviewScript && (
                        <button
                          onClick={() => onGenerateInterviewScript(candidate)}
                          className="w-full text-[10px] py-1 px-2 font-semibold rounded bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                        >
                          🎙️ Script de Entrevista
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {stageCandidates.length === 0 && (
                  <div className="h-full flex items-center justify-center p-4 text-center">
                    <span className="text-[11px] text-neutral-400 italic">Vazio</span>
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
