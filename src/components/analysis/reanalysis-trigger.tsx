"use client";

import { useState } from "react";
import { ReanalysisModal } from "@/components/analysis/reanalysis-modal";
import { RefreshCw } from "lucide-react";

export function ReanalysisTrigger({
  analysisId,
  jobTitle,
  currentScore,
  resumeText = "",
}: {
  analysisId: string;
  jobTitle: string;
  currentScore: number;
  resumeText?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-xs font-bold px-3 py-1.5 transition-all cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Reanalisar após editar currículo</span>
      </button>

      <ReanalysisModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        analysisId={analysisId}
        jobTitle={jobTitle}
        previousScore={currentScore}
        currentResumeText={resumeText}
        onReanalysisComplete={() => {
          // Atualiza a página após reanálise completa
          window.location.reload();
        }}
      />
    </>
  );
}
