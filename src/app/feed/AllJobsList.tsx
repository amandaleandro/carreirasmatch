"use client";

import { useState } from "react";
import { deriveJobTags } from "@/lib/feed-tags";

type Job = {
  id: string;
  jobTitle: string;
  jobText: string;
  url: string;
  source: string;
  location?: string | null;
};

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
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function TagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="7" y1="7" x2="7.01" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

export function AllJobsList({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-8 shadow-xs text-center">
        <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
          Ainda não há vagas disponíveis no momento. Volte em breve.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <AllJobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

function AllJobCard({ job }: { job: Job }) {
  const [expanded, setExpanded] = useState(false);
  const [starred, setStarred] = useState(false);
  const [copied, setCopied] = useState(false);

  const tags = deriveJobTags(job);
  const companyName = tags.company || "Empresa";
  const companyInitial = companyName !== "Empresa" ? companyName.charAt(0).toUpperCase() : null;

  function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(job.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="group rounded-3xl border border-slate-200/80 dark:border-neutral-800/90 bg-white dark:bg-neutral-900/60 p-5 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-none hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:border-slate-300 dark:hover:border-neutral-700 transition-all duration-300 space-y-4">
      
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center font-extrabold text-sm text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs mt-0.5">
            {companyInitial ? (
              <span>{companyInitial}</span>
            ) : (
              <BuildingIcon className="w-5 h-5 text-blue-500" />
            )}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <span className="text-[11px] font-medium text-slate-400 dark:text-neutral-500">
              via <span className="font-semibold text-slate-600 dark:text-neutral-400 capitalize">{job.source}</span>
            </span>

            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-title font-bold text-base md:text-lg text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug group/link"
            >
              <span className="line-clamp-1">{job.jobTitle}</span>
              <ExternalLinkIcon className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0 text-blue-600" />
            </a>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-neutral-400 font-medium">
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-neutral-300">
                <BuildingIcon className="w-3.5 h-3.5 text-slate-400" />
                {companyName}
              </span>
              <span className="text-slate-300 dark:text-neutral-700">•</span>
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-3.5 h-3.5 text-slate-400" />
                {tags.location || job.location || "Remoto / Brasil"}
              </span>
            </div>
          </div>
        </div>

        {/* Botões Rápidos: Favoritar e Compartilhar */}
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

      {/* Descrição com Expansão */}
      {job.jobText && (
        <div className="bg-slate-50/60 dark:bg-neutral-950/40 p-3.5 rounded-xl border border-slate-100 dark:border-neutral-800/80 space-y-2">
          <p className={`text-xs text-slate-600 dark:text-neutral-300 leading-relaxed font-normal ${expanded ? "" : "line-clamp-3"}`}>
            {job.jobText}
          </p>
          {job.jobText.length > 180 && (
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

      {/* Badges de Tags */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-slate-100 dark:border-neutral-800/80">
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
          {[tags.area].filter(Boolean).map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100/80 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 text-[11px] font-medium px-2.5 py-1"
            >
              <TagIcon className="w-3 h-3 text-slate-400" />
              {tag}
            </span>
          ))}
        </div>

        {/* Botão Ver Vaga Original */}
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 hover:border-slate-400 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-800 dark:text-white text-xs font-bold px-4 py-2 shadow-2xs hover:shadow-xs transition-all active:scale-95"
        >
          <span>Ver vaga original</span>
          <ExternalLinkIcon className="w-3.5 h-3.5 text-slate-500" />
        </a>
      </div>

    </div>
  );
}
