"use client";

import { useState } from "react";
import { MOOD_ORDER, MoodKey, MOOD_OPTIONS } from "@/lib/mood";

interface MoodCheckInCardProps {
  initialMood?: string | null;
  onSelectMood: (mood: MoodKey) => Promise<void>;
}

export function MoodCheckInCard({ initialMood, onSelectMood }: MoodCheckInCardProps) {
  const [mood, setMood] = useState<string | null | undefined>(initialMood);
  const [saving, setSaving] = useState(false);

  async function handlePick(key: MoodKey) {
    setSaving(true);
    setMood(key);
    try {
      await onSelectMood(key);
    } catch (err) {
      console.error("Failed to save mood", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 space-y-3">
      <div>
        <h3 className="font-title font-bold text-sm text-slate-900 dark:text-white">
          {mood ? "Como você está hoje" : "Como você está hoje?"}
        </h3>
        <p className="text-xs text-slate-500 dark:text-neutral-400">
          Um check-in rápido para calibrar sua motivação do dia.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {MOOD_ORDER.map((key) => {
          const option = MOOD_OPTIONS[key];
          const isSelected = mood === key;
          return (
            <button
              key={key}
              onClick={() => handlePick(key)}
              disabled={saving}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-300 hover:border-blue-400"
              }`}
            >
              <span>{option.emoji}</span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
