"use client";

import { useState, useMemo, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { saveFeedMatchAsApplication } from "@/app/applications/actions";
import { discardFeedMatch } from "./actions";
import { CAREER_TRACK_OPTIONS, CareerTrack } from "@/components/analysis-display";
import {
  deriveJobTags,
  reasonBullets,
  tierFromScore,
  TIER_LABEL,
  extractTechSkills,
  type ReasonBullet,
} from "@/lib/feed-tags";
import { stripHtmlFromText } from "@/lib/job-snippet";

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

function FeedActionButton({ children, pendingLabel, className, title }: { children: React.ReactNode; pendingLabel: string; className: string; title?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} title={title} className={className}>
      {pending ? pendingLabel : children}
    </button>
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

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 21h18M5 21V7l8-4v18M13 21V11l6 3v7M9 9h.01M9 13h.01M9 17h.01M16 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 21s-7-5.333-7-11.5a7 7 0 0 1 14 0C19 15.667 12 21 12 21z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m15 4-2 2m0 0 4 4m-4-4L4 15a2 2 0 0 0 0 2.83l1.17 1.17a2 2 0 0 0 2.83 0L17 10m2 8h.01M20 15h.01M15 20h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 4 12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function LaptopIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M20 16V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10m-2 4h20a1 1 0 0 0 1-1v-1H1a1 1 0 0 0 1 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CurrencyDollarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} className={className}>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="2" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ViewGridIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ViewListIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ReasonIcon({ kind }: { kind: ReasonBullet["kind"] }) {
  if (kind === "positive")
    return (
      <span className="h-5 w-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
        <CheckIcon className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
      </span>
    );
  if (kind === "warning")
    return (
      <span className="h-5 w-5 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
        <WarningIcon className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400" />
      </span>
    );
  return (
    <span className="h-5 w-5 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0 mt-0.5">
      <XIcon className="h-2.5 w-2.5 text-rose-600 dark:text-rose-400" />
    </span>
  );
}

export function FeedList({
  matches,
  resumeId,
  defaultCareerTrack,
  isInitialScoring = false,
}: {
  matches: FeedMatch[];
  resumeId: string;
  defaultCareerTrack: CareerTrack;
  isInitialScoring?: boolean;
}) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"detailed" | "compact">("detailed");
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);
  const [copiedBatch, setCopiedBatch] = useState(false);

  useEffect(() => {
    if (!isInitialScoring) return;
    const timer = window.setTimeout(() => router.refresh(), 3000);
    return () => window.clearTimeout(timer);
  }, [isInitialScoring, router]);

  const metrics = useMemo(() => {
    const total = matches.length;
    const excellent = matches.filter((m) => m.fitScore >= 85).length;
    const remote = matches.filter((m) => {
      const tags = deriveJobTags(m.job);
      return tags.workModel === "Remoto" || m.job.jobTitle.toLowerCase().includes("remoto");
    }).length;
    return { total, excellent, remote };
  }, [matches]);

  function toggleSelectAll() {
    if (selectedMatchIds.length === matches.length) {
      setSelectedMatchIds([]);
    } else {
      setSelectedMatchIds(matches.map((m) => m.id));
    }
  }

  function toggleSelectMatch(id: string) {
    setSelectedMatchIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function copySelectedLinks() {
    const selectedMatches = matches.filter((m) => selectedMatchIds.includes(m.id));
    const text = selectedMatches.map((m) => `${m.job.jobTitle}: ${m.job.url}`).join("\n");
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedBatch(true);
      setTimeout(() => setCopiedBatch(false), 2500);
    }
  }

  if (matches.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-8 text-center shadow-xs">
        {isInitialScoring ? (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
            <p aria-live="polite" className="mt-3 text-sm font-semibold text-slate-700 dark:text-neutral-200">Estamos comparando seu currículo com as vagas.</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">O primeiro lote pode levar alguns segundos. Atualizaremos esta tela automaticamente quando terminar.</p>
            <div className="mx-auto mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-950">
              <div className="h-full w-1/3 animate-[pulse_1.5s_ease-in-out_infinite] rounded-full bg-blue-600" />
            </div>
          </>
        ) : (
          <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400">Nenhuma vaga localizada para os filtros selecionados.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* BARRA SUPERIOR DE MÉTRICAS & ALTERNADOR DE VISUALIZAÇÃO */}
      <div className="rounded-xl border border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Métricas do Feed */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600 dark:text-neutral-300">
          <span className="font-bold text-slate-900 dark:text-white">
            {metrics.total} {metrics.total === 1 ? "vaga encontrada" : "vagas encontradas"}
          </span>
          <span className="text-slate-300 dark:text-neutral-700">•</span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {metrics.excellent} Excelente Match
          </span>
          <span className="text-slate-300 dark:text-neutral-700">•</span>
          <span className="inline-flex items-center gap-1 font-medium text-slate-500 dark:text-neutral-400">
            <LaptopIcon className="w-3.5 h-3.5 text-slate-400" />
            {metrics.remote} Remotas
          </span>
        </div>

        {/* Direita: Botões de Ação em Lote e Alternador de Visão */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end">
          
          {/* Seleção em Lote */}
          {selectedMatchIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copySelectedLinks}
                className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
              >
                <ShareIcon className="w-3.5 h-3.5" />
                <span>Copiar {selectedMatchIds.length} links</span>
                {copiedBatch && (
                  <span className="absolute -bottom-8 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-lg whitespace-nowrap z-20">
                    Links copiados!
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Toggle de Selecionar Todos */}
          <button
            type="button"
            onClick={toggleSelectAll}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {selectedMatchIds.length === matches.length ? "Desmarcar todas" : "Selecionar todas"}
          </button>

          {/* Alternador de Modo: Cards vs Lista Enxuta */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-neutral-900 rounded-xl border border-slate-200/80 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setViewMode("detailed")}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === "detailed"
                  ? "bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200"
              }`}
              title="Modo Cards Detalhados"
            >
              <ViewGridIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("compact")}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === "compact"
                  ? "bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200"
              }`}
              title="Modo Lista Compacta"
            >
              <ViewListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* LISTAGEM DE CARDS OU LISTA COMPACTA */}
      {viewMode === "detailed" ? (
        <div className="space-y-3 md:space-y-4">
          {matches.map((match) => (
            <FeedCard
              key={match.id}
              match={match}
              resumeId={resumeId}
              defaultCareerTrack={defaultCareerTrack}
              isSelected={selectedMatchIds.includes(match.id)}
              onToggleSelect={() => toggleSelectMatch(match.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 dark:border-neutral-800/90 bg-white dark:bg-neutral-900/60 divide-y divide-slate-100 dark:divide-neutral-800/80 overflow-hidden">
          {matches.map((match) => (
            <CompactFeedRow
              key={match.id}
              match={match}
              resumeId={resumeId}
              defaultCareerTrack={defaultCareerTrack}
              isSelected={selectedMatchIds.includes(match.id)}
              onToggleSelect={() => toggleSelectMatch(match.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const TIER_COLOR_SCHEMES: Record<
  "excellent" | "good" | "medium" | "low",
  { badge: string; text: string; ring: string; lightDot: string }
> = {
  excellent: {
    badge: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 shadow-2xs",
    text: "text-emerald-600 dark:text-emerald-400",
    ring: "#22C55E",
    lightDot: "bg-emerald-500",
  },
  good: {
    badge: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 shadow-2xs",
    text: "text-emerald-600 dark:text-emerald-400",
    ring: "#22C55E",
    lightDot: "bg-emerald-500",
  },
  medium: {
    badge: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-500/25 shadow-2xs",
    text: "text-amber-600 dark:text-amber-400",
    ring: "#F59E0B",
    lightDot: "bg-amber-500",
  },
  low: {
    badge: "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-500/25 shadow-2xs",
    text: "text-rose-600 dark:text-rose-400",
    ring: "#EF4444",
    lightDot: "bg-rose-500",
  },
};

function FeedCard({
  match,
  resumeId,
  defaultCareerTrack,
  isSelected,
  onToggleSelect,
}: {
  match: FeedMatch;
  resumeId: string;
  defaultCareerTrack: CareerTrack;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}) {
  const router = useRouter();
  const [careerTrack, setCareerTrack] = useState<CareerTrack>(defaultCareerTrack);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [expanded, setExpanded] = useState(false);
  const [starred, setStarred] = useState(false);
  const [copied, setCopied] = useState(false);

  const tier = tierFromScore(match.fitScore);
  const colors = TIER_COLOR_SCHEMES[tier];
  const tags = deriveJobTags(match.job);
  const bullets = reasonBullets(match.reason, tier);
  const techSkills = extractTechSkills(match.job.jobText);

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

  function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(match.job.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const companyName = tags.company || "Empresa";
  const companyInitial = companyName !== "Empresa" ? companyName.charAt(0).toUpperCase() : null;
  const cleanDescription = stripHtmlFromText(match.job.jobText);

  return (
    <div className={`group rounded-2xl border ${isSelected ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200/80 dark:border-neutral-800/90"} bg-white dark:bg-neutral-900/60 p-5 md:p-5 hover:border-slate-300 dark:hover:border-neutral-700 transition-colors duration-200 space-y-4`}>
      
      {/* Cabeçalho do Card */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          
          {/* Checkbox de Seleção Múltipla */}
          <input
            type="checkbox"
            checked={!!isSelected}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer mt-3 shrink-0"
            title="Selecionar esta vaga"
          />

          {/* Avatar / Badge de Logo da Empresa */}
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center font-extrabold text-sm text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs mt-0.5">
            {companyInitial ? (
              <span>{companyInitial}</span>
            ) : (
              <BuildingIcon className="w-5 h-5 text-blue-500" />
            )}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            
            {/* Top Row: Badge de Fit Score e Source */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${colors.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${colors.lightDot} animate-pulse`} />
                {match.fitScore}% MATCH · {TIER_LABEL[tier]}
              </span>
              <span className="text-[11px] font-medium text-slate-400 dark:text-neutral-500">
                via <span className="font-semibold text-slate-600 dark:text-neutral-400 capitalize">{match.job.source}</span>
              </span>
            </div>

            {/* Título da Vaga */}
            <a
              href={match.job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-title font-bold text-base md:text-lg text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug group/link"
            >
              <span className="line-clamp-1">{match.job.jobTitle}</span>
              <ExternalLinkIcon className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0 text-blue-600" />
            </a>

            {/* Subtítulo: Empresa e Localização */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-neutral-400 font-medium">
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-neutral-300">
                <BuildingIcon className="w-3.5 h-3.5 text-slate-400" />
                {companyName}
              </span>
              <span className="text-slate-300 dark:text-neutral-700">•</span>
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-3.5 h-3.5 text-slate-400" />
                {tags.location || match.job.location || "Remoto / Brasil"}
              </span>
            </div>
          </div>
        </div>

        {/* Botões Rápidos de Ação: Favoritar & Compartilhar */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setStarred(!starred)}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              starred
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                : "text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-neutral-800"
            }`}
            title={starred ? "Remover dos favoritos" : "Salvar nos favoritos"}
          >
            <StarIcon className="w-4 h-4" filled={starred} />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Copiar link da vaga"
            >
              <ShareIcon className="w-4 h-4" />
            </button>
            {copied && (
              <span className="absolute -bottom-8 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-lg whitespace-nowrap z-10 animate-in fade-in zoom-in duration-200">
                Link copiado!
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Descrição com Expansão ("Ver mais / Ver menos") */}
      {cleanDescription && (
        <div className="bg-slate-50/60 dark:bg-neutral-950/40 p-3.5 rounded-xl border border-slate-100 dark:border-neutral-800/80 space-y-2">
          <p className={`text-xs text-slate-600 dark:text-neutral-300 leading-relaxed font-normal ${expanded ? "" : "line-clamp-3"}`}>
            {cleanDescription}
          </p>
          {cleanDescription.length > 180 && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              <span>{expanded ? "Ver menos" : "Ver mais da descrição"}</span>
              <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      )}

      {/* Badges de Tags da Vaga e Tecnologias Extraídas */}
      <div className="flex flex-wrap items-center gap-1.5">
        {tags.salary && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-1 shadow-2xs">
            <CurrencyDollarIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            {tags.salary}
          </span>
        )}
        {tags.workModel && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100/80 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 text-[11px] font-semibold px-2.5 py-1">
            <LaptopIcon className="w-3 h-3 text-slate-400 dark:text-neutral-400" />
            {tags.workModel}
          </span>
        )}
        {tags.contractType && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100/80 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 text-[11px] font-semibold px-2.5 py-1">
            <BriefcaseIcon className="w-3 h-3 text-slate-400 dark:text-neutral-400" />
            {tags.contractType}
          </span>
        )}
        {tags.seniority && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100/80 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 text-[11px] font-semibold px-2.5 py-1">
            <SparklesIcon className="w-3 h-3 text-slate-400 dark:text-neutral-400" />
            {tags.seniority}
          </span>
        )}

        {/* Chips de Tecnologias Requeridas Extraídas */}
        {techSkills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5"
          >
            #{skill}
          </span>
        ))}
      </div>

      {/* Análise de Aderência AI com Diagnóstico Integrado */}
      <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-neutral-950/60 p-4 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <SparklesIcon className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">Análise de Aderência AI</p>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-100/60 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
            Resumo inteligente
          </span>
        </div>

        <ul className="space-y-2">
          {bullets.map((bullet, index) => (
            <li key={index} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-neutral-300 leading-relaxed font-medium">
              <ReasonIcon kind={bullet.kind} />
              <span className="flex-1 mt-0.5">{bullet.text}</span>
            </li>
          ))}
        </ul>

        {/* CTA Integrado: Diagnóstico Completo */}
        <div className="pt-2.5 border-t border-blue-100/80 dark:border-blue-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <p className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
            Ver análise detalhada com pontos fortes e lacunas do seu perfil
          </p>
          <button
            type="button"
            onClick={handleFullAnalysis}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 text-xs shadow-sm shadow-blue-500/20 transition-all hover:shadow-md active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoadingSpinner className="w-3.5 h-3.5" />
                <span>Analisando...</span>
              </>
            ) : (
              <>
                <span>Diagnóstico completo</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-rose-600 font-semibold px-1">{error}</p>}

      {/* RODAPÉ EM 2 NÍVEIS TOTALMENTE ALINHADO */}
      <div className="border-t border-slate-100 dark:border-neutral-800/80 pt-3.5 space-y-3">
        
        {/* Nível 1: Botões de Ação Principais do Workflow */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Salvar Kanban */}
          <form action={saveFeedMatchAsApplication.bind(null, match.id, null)} className="w-full">
            <FeedActionButton pendingLabel="Salvando..." className="w-full inline-flex items-center justify-center gap-2 h-9 rounded-xl bg-white dark:bg-neutral-900 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-200 font-semibold text-xs border border-slate-200/90 dark:border-neutral-700 shadow-2xs hover:border-slate-300 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60">
              <BookmarkIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Salvar Kanban</span>
            </FeedActionButton>
          </form>

          {/* Ajustar CV */}
          <form action={saveFeedMatchAsApplication.bind(null, match.id, "tailor_resume")} className="w-full">
            <FeedActionButton pendingLabel="Preparando..." className="w-full inline-flex items-center justify-center gap-2 h-9 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-xs border border-amber-500/25 transition-colors cursor-pointer active:scale-[0.98] disabled:opacity-60">
              <WandIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>Ajustar CV</span>
            </FeedActionButton>
          </form>

          {/* Candidatou-se */}
          <form action={saveFeedMatchAsApplication.bind(null, match.id, "applied")} className="w-full">
            <FeedActionButton pendingLabel="Registrando..." className="w-full inline-flex items-center justify-center gap-2 h-9 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold text-xs border border-blue-500/25 transition-colors cursor-pointer active:scale-[0.98] disabled:opacity-60">
              <CheckCircleIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>Candidatou-se</span>
            </FeedActionButton>
          </form>
        </div>

        {/* Nível 2: Sub-barra de Utilitários (Momento + Vaga Original + Descartar) */}
        <div className="pt-2 border-t border-slate-100/60 dark:border-neutral-800/50 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          
          {/* Seletor de Momento */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-neutral-950/60 px-3 py-1 rounded-xl border border-slate-200/70 dark:border-neutral-800">
            <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <TargetIcon className="w-3 h-3 text-slate-400" />
              Momento:
            </span>
            <select
              value={careerTrack}
              onChange={(e) => setCareerTrack(e.target.value as CareerTrack)}
              className="bg-transparent text-slate-700 dark:text-neutral-300 text-xs font-semibold outline-none cursor-pointer pr-1"
            >
              {CAREER_TRACK_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="dark:bg-neutral-900">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Links da direita */}
          <div className="flex items-center gap-3 ml-auto">
            <a
              href={match.job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 transition-colors"
            >
              <span>Vaga original</span>
              <ExternalLinkIcon className="w-3 h-3" />
            </a>

            <span className="text-slate-300 dark:text-neutral-700">•</span>

            <form action={discardFeedMatch.bind(null, match.id)}>
              <FeedActionButton pendingLabel="Descartando..." className="inline-flex items-center gap-1 font-semibold text-slate-400 hover:text-rose-600 dark:text-neutral-500 dark:hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-60" title="Descartar esta vaga">
                <TrashIcon className="w-3.5 h-3.5" />
                <span>Descartar</span>
              </FeedActionButton>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}

/**
 * COMPONENT DE LINHA COMPACTA PARA VARREDURA RÁPIDA
 */
function CompactFeedRow({
  match,
  resumeId,
  defaultCareerTrack,
  isSelected,
  onToggleSelect,
}: {
  match: FeedMatch;
  resumeId: string;
  defaultCareerTrack: CareerTrack;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const tier = tierFromScore(match.fitScore);
  const colors = TIER_COLOR_SCHEMES[tier];
  const tags = deriveJobTags(match.job);

  async function handleFullAnalysis() {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("resumeId", resumeId);
      formData.set("jobTitle", match.job.jobTitle);
      formData.set("jobText", match.job.jobText);
      formData.set("careerTrack", defaultCareerTrack);

      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) router.push(`/report/${data.id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition-colors ${isSelected ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <input
          type="checkbox"
          checked={!!isSelected}
          onChange={onToggleSelect}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
        />

        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 border ${colors.badge}`}>
          {match.fitScore}% Match
        </span>

        <div className="min-w-0 flex-1">
          <a
            href={match.job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-xs md:text-sm text-slate-900 dark:text-white hover:text-blue-600 transition-colors truncate block"
          >
            {match.job.jobTitle}
          </a>
          <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
            {tags.company} • {tags.location || match.job.location || "Remoto"} • via {match.job.source}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 justify-end">
        <form action={saveFeedMatchAsApplication.bind(null, match.id, null)}>
          <button type="submit" className="p-1.5 rounded-lg border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-300 hover:bg-white text-xs font-medium cursor-pointer" title="Salvar Kanban">
            <BookmarkIcon className="w-3.5 h-3.5" />
          </button>
        </form>

        <a
          href={match.job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 cursor-pointer"
          title="Ver vaga original"
        >
          <ExternalLinkIcon className="w-3.5 h-3.5" />
        </a>

        <button
          onClick={handleFullAnalysis}
          disabled={loading}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 text-xs shadow-2xs transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? "..." : "Diagnóstico →"}
        </button>
      </div>
    </div>
  );
}
