"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveFeedMatchAsApplication } from "@/app/applications/actions";
import { discardFeedMatch } from "./actions";
import { CircularScore } from "@/components/circular-score";
import { CAREER_TRACK_OPTIONS, CareerTrack } from "@/components/analysis-display";
import {
  deriveJobTags,
  reasonBullets,
  tierFromScore,
  TIER_LABEL,
  TIER_RING_COLOR,
  TIER_TEXT_CLASS,
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
    location?: string | null;
  };
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 12.5 9.5 17 19 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 4 21.5 20H2.5L12 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 10v4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="17.3" r="0.9" fill="currentColor" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ReasonIcon({ kind }: { kind: ReasonBullet["kind"] }) {
  if (kind === "positive")
    return <CheckIcon className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />;
  if (kind === "warning")
    return <WarningIcon className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />;
  return <XIcon className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />;
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
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 text-center">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Nenhuma vaga encontrada para os filtros selecionados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
  const tags = deriveJobTags(match.job);
  const bullets = reasonBullets(match.reason, tier);
  const description = match.job.jobText.replace(/\s+/g, " ").trim().slice(0, 180);

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
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar a análise completa.");

      router.push(`/report/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 flex flex-col sm:flex-row gap-5">
      <div className="flex sm:flex-col items-center gap-2 shrink-0 sm:w-24">
        <CircularScore value={match.fitScore} size={72} strokeWidth={7} color={TIER_RING_COLOR[tier]} />
        <span className={`text-xs font-semibold text-center ${TIER_TEXT_CLASS[tier]}`}>
          {TIER_LABEL[tier]}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <a
          href={match.job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-base hover:underline"
        >
          {match.job.jobTitle}
        </a>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 flex items-center gap-1">
          {tags.company}
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-blue-500">
            <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.15" />
            <path d="m8 12.3 2.6 2.6L16.5 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </p>
        {description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">{description}…</p>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          {tags.salary && (
            <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-2.5 py-1">
              {tags.salary}
            </span>
          )}
          {[tags.seniority, tags.workModel, tags.area, tags.location].filter(Boolean).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium px-2.5 py-1"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold mb-2">Por que esta vaga combina com você</p>
          <ul className="space-y-1.5">
            {bullets.map((bullet, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <ReasonIcon kind={bullet.kind} />
                <span>{bullet.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>}
      </div>

      <div className="flex flex-col gap-2 shrink-0 w-full sm:w-56">
        <select
          value={careerTrack}
          onChange={(e) => setCareerTrack(e.target.value as CareerTrack)}
          className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-2 py-2 text-xs"
        >
          {CAREER_TRACK_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleFullAnalysis}
          disabled={loading}
          className="rounded-lg bg-blue-600 text-white font-medium px-4 py-2.5 text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {loading ? "Analisando..." : "Ver análise completa"}
          {!loading && (
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <form action={saveFeedMatchAsApplication.bind(null, match.id)}>
          <button
            type="submit"
            className="w-full rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 font-medium px-4 py-2.5 text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M7 3.5h10a1 1 0 0 1 1 1V21l-6-4-6 4V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            Salvar no Kanban
          </button>
        </form>

        <div className="flex items-center justify-between text-xs pt-1">
          <a
            href={match.job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 font-medium flex items-center gap-1"
          >
            Ver vaga original
            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
              <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <form action={discardFeedMatch.bind(null, match.id)}>
            <button type="submit" className="text-neutral-400 hover:text-red-500 font-medium">
              Descartar ✕
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
