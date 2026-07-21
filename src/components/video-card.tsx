"use client";

import { useState } from "react";
import { Play, Clock, Video as VideoIcon } from "lucide-react";

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
    <div className="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/60 dark:hover:border-blue-500/60 hover:shadow-xl transition-all duration-300 flex flex-col justify-between w-full">
      <div>
        <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
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
              className="group/btn absolute inset-0 h-full w-full overflow-hidden"
              aria-label={`Assistir: ${title}`}
            >
              {thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbnail}
                  alt={title}
                  className="h-full w-full object-cover group-hover/btn:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-slate-950/30 group-hover/btn:bg-slate-950/40 transition-colors flex items-center justify-center">
                <span className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-600/40 group-hover/btn:scale-110 transition-transform">
                  <Play className="h-6 w-6 fill-white translate-x-0.5" />
                </span>
              </div>
              {duration && (
                <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-lg bg-slate-950/80 backdrop-blur-md px-2 py-0.5 text-[11px] font-semibold text-white">
                  <Clock className="w-3 h-3 text-slate-300" />
                  <span>{duration}</span>
                </span>
              )}
            </button>
          )}
        </div>
        <div className="p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-900/50">
              {area}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
              <VideoIcon className="w-3.5 h-3.5 text-red-500" />
              <span>YouTube</span>
            </span>
          </div>

          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
            {channel}
          </p>
        </div>
      </div>
    </div>
  );
}
