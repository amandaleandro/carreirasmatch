"use client";

import { useState } from "react";

type Props = {
  videoId: string;
  title: string;
  channel: string;
  area: string;
  thumbnail: string;
  durationSec: number;
};

function formatDuration(seconds: number) {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return h ? `${h}:${mm}:${String(s).padStart(2, "0")}` : `${mm}:${String(s).padStart(2, "0")}`;
}

export function VideoCard({ videoId, title, channel, area, thumbnail, durationSec }: Props) {
  const [playing, setPlaying] = useState(false);
  const duration = formatDuration(durationSec);

  return (
    <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/40 flex flex-col justify-between w-full">
      <div>
        <div className="relative aspect-video w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
          {playing ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 h-full w-full"
              aria-label={`Assistir: ${title}`}
            >
              {/* Miniatura vem do YouTube (i.ytimg.com); é apenas exibida, não rehospedada. */}
              {thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
                <span className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
              {duration && (
                <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] sm:text-xs font-medium text-white">
                  {duration}
                </span>
              )}
            </button>
          )}
        </div>
        <div className="p-3.5 sm:p-4">
          <span className="text-[11px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">{area}</span>
          <h2 className="mt-1 line-clamp-2 text-xs sm:text-sm font-bold leading-snug text-neutral-900 dark:text-neutral-100">{title}</h2>
          <p className="mt-1.5 text-xs text-neutral-500">{channel}</p>
        </div>
      </div>
    </div>
  );
}
