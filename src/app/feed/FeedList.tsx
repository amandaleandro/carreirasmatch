"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveFeedMatchAsApplication } from "@/app/applications/actions";
import { discardFeedMatch } from "./actions";
import { CAREER_TRACK_OPTIONS, CareerTrack } from "@/components/analysis-display";
import {
  deriveJobTags,
  reasonBullets,
  tierFromScore,
  TIER_LABEL,
  type ReasonBullet,
} from "@/lib/feed-tags";

export type FeedMatch = {
  id: string;
  fitScore: number;
  reason: string;
  job: {
    id: string;
    jobTitle: string;
    jobText: string;
    url: string;
    source: string;
    location?: string | null;
  };
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 12.5 9.5 17 19 6.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 4 21.5 20H2.5L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 10v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.2" fill="currentColor" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function ReasonIcon({ kind }: { kind: ReasonBullet["kind"] }) {
  if (kind === "positive")
    return <span className="h-5 w-5 rounded-full bg-[#22C55E]/15 flex items-center justify-center shrink-0"><CheckIcon className="h-2.5 w-2.5 text-[#22C55E]" /></span>;
  if (kind === "warning")
    return <span className="h-5 w-5 rounded-full bg-[#F59E0B]/15 flex items-center justify-center shrink-0"><WarningIcon className="h-2.5 w-2.5 text-[#F59E0B]" /></span>;
  return <span className="h-5 w-5 rounded-full bg-[#EF4444]/15 flex items-center justify-center shrink-0"><XIcon className="h-2.5 w-2.5 text-[#EF4444]" /></span>;
}

export function FeedList({
  matches,
  resumeId,
  defaultCareerTrack,
}: {
  matches: FeedMatch[];
  resumeId: string;
  defaultCareerTrack: CareerTrack;
}) {
  if (matches.length === 0) {
    return (
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-950 p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <p className="text-xs font-semibold text-[#64748B] dark:text-neutral-400">
          Nenhuma vaga localizada para os filtros selecionados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {matches.map((match) => (
        <FeedCard
          key={match.id}
          match={match}
          resumeId={resumeId}
          defaultCareerTrack={defaultCareerTrack}
        />
      ))}
    </div>
  );
}

const TIER_COLOR_SCHEMES: Record<
  "excellent" | "good" | "medium" | "low",
  { badge: string; text: string; ring: string; lightDot: string }
> = {
  excellent: {
    badge: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
    text: "text-[#22C55E]",
    ring: "#22C55E",
    lightDot: "bg-[#22C55E]",
  },
  good: {
    badge: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
    text: "text-[#22C55E]",
    ring: "#22C55E",
    lightDot: "bg-[#22C55E]",
  },
  medium: {
    badge: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
    text: "text-[#F59E0B]",
    ring: "#F59E0B",
    lightDot: "bg-[#F59E0B]",
  },
  low: {
    badge: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
    text: "text-[#EF4444]",
    ring: "#EF4444",
    lightDot: "bg-[#EF4444]",
  },
};

function FeedCard({
  match,
  resumeId,
  defaultCareerTrack,
}: {
  match: FeedMatch;
  resumeId: string;
  defaultCareerTrack: CareerTrack;
}) {
  const router = useRouter();
  const [careerTrack, setCareerTrack] = useState<CareerTrack>(defaultCareerTrack);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tier = tierFromScore(match.fitScore);
  const colors = TIER_COLOR_SCHEMES[tier];
  const tags = deriveJobTags(match.job);
  const bullets = reasonBullets(match.reason, tier);
  const description = match.job.jobText.replace(/\s+/g, " ").trim().slice(0, 160);

  async function handleFullAnalysis() {
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("resumeId", resumeId);
      formData.set("jobTitle", match.job.jobTitle);
      formData.set("jobText", match.job.jobText);
      formData.set("careerTrack", careerTrack);

      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao processar análise do match.");

      router.push(`/report/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.035)] hover:-translate-y-[1px] transition-all duration-300 space-y-4">
      
      {/* Cabeçalho do Card */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Badge de Match Integrado */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${colors.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${colors.lightDot} animate-pulse`} />
              {match.fitScore}% Match · {TIER_LABEL[tier]}
            </span>
            <span className="text-[10px] font-bold text-[#64748B]">via {match.job.source}</span>
          </div>
          <a
            href={match.job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-title font-bold text-base md:text-lg text-[#071827] dark:text-white hover:text-[#2563EB] transition-colors leading-tight"
          >
            {match.job.jobTitle}
          </a>
          <p className="text-xs text-[#64748B] dark:text-neutral-400 font-semibold">
            {tags.company} · {tags.location || match.job.location || "Remoto / Brasil"}
          </p>
        </div>
      </div>

      {/* Descrição Curta */}
      {description && (
        <p className="text-xs text-[#64748B] dark:text-neutral-300 leading-relaxed font-medium">
          {description}…
        </p>
      )}

      {/* Tags da Vaga */}
      <div className="flex flex-wrap gap-1.5">
        {tags.salary && (
          <span className="rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[10px] font-bold px-2.5 py-0.5">
            {tags.salary}
          </span>
        )}
        {[tags.contractType, tags.seniority, tags.workModel, tags.area].filter(Boolean).map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className="rounded-lg bg-[#F8FAFC] dark:bg-neutral-800 border border-[#E2E8F0] dark:border-neutral-750 text-[#64748B] dark:text-neutral-300 text-[10px] font-bold px-2.5 py-0.5"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Análise de Aderência */}
      <div className="rounded-2xl border border-[#E2E8F0]/80 dark:border-neutral-800 bg-[#F8FAFC] dark:bg-neutral-950/40 p-4 space-y-2">
        <p className="text-xs font-bold text-[#071827] dark:text-white tracking-tight">Análise de Aderência</p>
        <ul className="space-y-2">
          {bullets.map((bullet, index) => (
            <li key={index} className="flex items-start gap-2.5 text-xs text-[#64748B] dark:text-neutral-300 leading-relaxed font-medium">
              <ReasonIcon kind={bullet.kind} />
              <span className="flex-1 mt-0.5">{bullet.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {error && <p className="text-xs text-[#EF4444] font-semibold">{error}</p>}

      {/* Barra de Ações Horizontal */}
      <div className="border-t border-[#E2E8F0] dark:border-neutral-800 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Lado Esquerdo: Filtro de Momento */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider shrink-0">Momento:</span>
          <select
            value={careerTrack}
            onChange={(e) => setCareerTrack(e.target.value as CareerTrack)}
            className="rounded-xl border border-[#E2E8F0] dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 px-3 py-1.5 text-xs font-semibold outline-none focus:border-[#2563EB] shadow-xs cursor-pointer max-w-[200px]"
          >
            {CAREER_TRACK_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Lado Direito: Botões de Ação */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Descartar */}
          <form action={discardFeedMatch.bind(null, match.id)}>
            <button type="submit" className="text-xs font-bold text-neutral-400 hover:text-[#EF4444] px-2 py-1.5 rounded-lg transition-colors cursor-pointer">
              Descartar
            </button>
          </form>

          {/* Vaga Original */}
          <a
            href={match.job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#64748B] hover:text-[#2563EB] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-0.5"
          >
            Vaga original ↗
          </a>

          {/* Salvar no Kanban */}
          <form action={saveFeedMatchAsApplication.bind(null, match.id, null)}>
            <button
              type="submit"
              className="rounded-xl border border-[#E2E8F0] hover:border-[#64748B] dark:border-neutral-700 text-[#071827] dark:text-white bg-white dark:bg-neutral-900 font-bold px-3.5 py-2 text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-[0.98]"
            >
              Salvar Kanban
            </button>
          </form>

          {/* Ajustar CV */}
          <form action={saveFeedMatchAsApplication.bind(null, match.id, "tailor_resume")}>
            <button
              type="submit"
              className="rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/5 hover:bg-[#F59E0B]/10 text-[#F59E0B] font-bold px-3.5 py-2 text-xs transition-colors cursor-pointer"
            >
              Ajustar CV
            </button>
          </form>

          {/* Candidatou-se */}
          <form action={saveFeedMatchAsApplication.bind(null, match.id, "applied")}>
            <button
              type="submit"
              className="rounded-xl border border-[#2563EB]/30 bg-[#2563EB]/5 hover:bg-[#2563EB]/10 text-[#2563EB] font-bold px-3.5 py-2 text-xs transition-colors cursor-pointer"
            >
              Candidatou-se
            </button>
          </form>

          {/* Diagnóstico */}
          <button
            onClick={handleFullAnalysis}
            disabled={loading}
            className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-4 py-2 text-xs shadow-sm shadow-[#2563EB]/25 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            {loading ? "Analisando..." : "Diagnóstico completo →"}
          </button>
        </div>

      </div>

    </div>
  );
}
