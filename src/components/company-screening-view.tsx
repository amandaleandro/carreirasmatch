"use client";

import React, { useState } from "react";
import { ScreeningResults, type ScreeningCandidate } from "@/components/screening-results";
import { CompanyCandidateKanban } from "@/components/company-candidate-kanban";
import { CandidateInterviewModal, type InterviewScriptData } from "@/components/candidate-interview-modal";

interface CompanyScreeningViewProps {
  jobTitle: string;
  candidates: ScreeningCandidate[];
}

export function CompanyScreeningView({ jobTitle, candidates }: CompanyScreeningViewProps) {
  const [activeTab, setActiveTab] = useState<"kanban" | "list">("kanban");
  const [selectedCandidate, setSelectedCandidate] = useState<ScreeningCandidate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingScript, setLoadingScript] = useState(false);
  const [scriptData, setScriptData] = useState<InterviewScriptData | null>(null);

  const handleGenerateInterviewScript = async (candidate: ScreeningCandidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
    setLoadingScript(true);
    setScriptData(null);

    try {
      const res = await fetch(`/api/empresa/candidates/${candidate.id}/interview-script`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setScriptData(data.script);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingScript(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab("kanban")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "kanban"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          📊 Visão Pipeline (Kanban)
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "list"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          📋 Visão Lista Detalhada
        </button>
      </div>

      {activeTab === "kanban" ? (
        <CompanyCandidateKanban
          candidates={candidates}
          onGenerateInterviewScript={handleGenerateInterviewScript}
        />
      ) : (
        <ScreeningResults jobTitle={jobTitle} candidates={candidates} />
      )}

      <CandidateInterviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        candidateName={selectedCandidate?.candidateName || selectedCandidate?.fileName || "Candidato"}
        jobTitle={jobTitle}
        loading={loadingScript}
        scriptData={scriptData}
      />
    </div>
  );
}
